const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// ---------- Config ----------
// 👇 PUT YOUR OWN UPI ID HERE (the one you want to receive payments at)
const UPI_ID = process.env.UPI_ID || 'bidyawantpradhan@ybl';
const UPI_PAYEE_NAME = process.env.UPI_PAYEE_NAME || 'Anon Chat';

const MAX_MALE_FREE_PER_DAY = 5;
const PAID_PACK_SIZE = 10;
const PAID_PACK_PRICE_INR = 49;
const COUNT_THRESHOLD_MS = 10_000;
const INITIAL_DURATION_MS = 60_000;
const DECISION_WINDOW_MS = 15_000;
const REPORTS_TO_BLOCK = 3;
const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000;

// ---------- Persistent per-user counters (anonymous, keyed by browser UUID) ----------
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
fs.mkdirSync(dataDir, { recursive: true });

let store = { users: {} };
try { store = JSON.parse(fs.readFileSync(usersFile, 'utf8')); } catch (_) {}

let persistTimer = null;
function persist() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    fs.writeFileSync(usersFile, JSON.stringify(store, null, 2));
  }, 200);
}

const today = () => new Date().toISOString().slice(0, 10);

function getOrCreateRecord(userId) {
  if (!store.users[userId]) {
    store.users[userId] = {
      dailyMatches: { date: today(), count: 0 },
      paidMatches: 0,
      createdAt: Date.now(),
    };
  }
  return store.users[userId];
}
function ensureFreshDay(rec) {
  if (!rec.dailyMatches || rec.dailyMatches.date !== today()) {
    rec.dailyMatches = { date: today(), count: 0 };
  }
}
function freeRemaining(rec) {
  ensureFreshDay(rec);
  return Math.max(0, MAX_MALE_FREE_PER_DAY - rec.dailyMatches.count);
}
function totalRemaining(rec) {
  return freeRemaining(rec) + (rec.paidMatches || 0);
}
function consumeOneMatch(rec) {
  ensureFreshDay(rec);
  if (rec.dailyMatches.count < MAX_MALE_FREE_PER_DAY) {
    rec.dailyMatches.count += 1;
  } else if (rec.paidMatches > 0) {
    rec.paidMatches -= 1;
  }
  persist();
}

// ---------- UPI payment (manual UTR verification) ----------
function buildUpiLink() {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_PAYEE_NAME,
    am: String(PAID_PACK_PRICE_INR),
    cu: 'INR',
    tn: `Anon Chat ${PAID_PACK_SIZE} matches`,
  });
  return `upi://pay?${params.toString()}`;
}

app.get('/api/payment-info', (req, res) => {
  const link = buildUpiLink();
  res.json({
    upiId: UPI_ID,
    payeeName: UPI_PAYEE_NAME,
    priceInr: PAID_PACK_PRICE_INR,
    packSize: PAID_PACK_SIZE,
    upiLink: link,
    qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(link)}`,
  });
});

const claimsFile = path.join(dataDir, 'claims.json');
let claims = [];
try { claims = JSON.parse(fs.readFileSync(claimsFile, 'utf8')); } catch (_) {}
function saveClaims() {
  fs.writeFileSync(claimsFile, JSON.stringify(claims, null, 2));
}

app.post('/api/claim', (req, res) => {
  const { userId, utr } = req.body || {};
  if (typeof userId !== 'string' || userId.length < 8) {
    return res.status(400).json({ error: 'Invalid user' });
  }
  const utrClean = String(utr || '').trim();
  if (!/^[A-Za-z0-9]{8,30}$/.test(utrClean)) {
    return res.status(400).json({ error: 'Enter a valid UTR / transaction ID' });
  }
  // Prevent the same UTR being reused
  if (claims.some((c) => c.utr.toLowerCase() === utrClean.toLowerCase())) {
    return res.status(409).json({ error: 'This transaction ID has already been used' });
  }
  const rec = getOrCreateRecord(userId);
  rec.paidMatches = (rec.paidMatches || 0) + PAID_PACK_SIZE;
  persist();
  claims.push({
    at: Date.now(),
    userId,
    utr: utrClean,
    amountInr: PAID_PACK_PRICE_INR,
    packSize: PAID_PACK_SIZE,
    verified: false,
  });
  saveClaims();
  console.log(`💰 New claim: ${utrClean} from ${userId} — verify in your UPI app and mark verified in data/claims.json`);
  res.json({
    ok: true,
    paidMatches: rec.paidMatches,
    freeRemaining: freeRemaining(rec),
  });
});

app.get('/api/quota', (req, res) => {
  const userId = req.query.userId;
  if (typeof userId !== 'string') return res.status(400).json({ error: 'Missing userId' });
  const rec = getOrCreateRecord(userId);
  res.json({
    freeRemaining: freeRemaining(rec),
    freeMax: MAX_MALE_FREE_PER_DAY,
    paidMatches: rec.paidMatches || 0,
  });
});

// ---------- Match state (in-memory) ----------
const userProfiles = new Map();   // userId -> { gender }
const userSockets = new Map();
const socketToUser = new Map();
const waitingUsers = new Set();   // insertion order = FIFO queue
const activeSessions = new Map();
const userToRoom = new Map();
const reportsByUser = new Map();
const blocks = new Map();
const recentReports = [];

function isBlocked(uid) {
  const until = blocks.get(uid);
  if (!until) return false;
  if (Date.now() > until) { blocks.delete(uid); return false; }
  return true;
}

function findMatch(uid) {
  const me = userProfiles.get(uid);
  if (!me) return null;
  for (const other of waitingUsers) {
    if (other === uid) continue;
    const op = userProfiles.get(other);
    if (op && op.gender !== me.gender) return other;
  }
  return null;
}

function sendQuota(uid) {
  const sock = userSockets.get(uid);
  const prof = userProfiles.get(uid);
  if (!sock || !prof) return;
  if (prof.gender === 'male') {
    const rec = getOrCreateRecord(uid);
    sock.emit('match-quota', {
      free: freeRemaining(rec),
      freeMax: MAX_MALE_FREE_PER_DAY,
      paid: rec.paidMatches || 0,
    });
  }
}

function tryEnqueue(uid) {
  const sock = userSockets.get(uid);
  if (!sock) return;
  if (isBlocked(uid)) {
    sock.emit('blocked', { reason: 'You have been temporarily blocked due to reports.' });
    return;
  }
  const prof = userProfiles.get(uid);
  if (!prof) return;
  if (prof.gender === 'male') {
    const rec = getOrCreateRecord(uid);
    if (totalRemaining(rec) <= 0) {
      sock.emit('paywall', {
        packSize: PAID_PACK_SIZE,
        priceInr: PAID_PACK_PRICE_INR,
      });
      return;
    }
  }
  if (userToRoom.has(uid)) return;
  waitingUsers.add(uid);
  sock.emit('searching');
  const match = findMatch(uid);
  if (match) pairUsers(uid, match);
}

function pairUsers(a, b) {
  waitingUsers.delete(a);
  waitingUsers.delete(b);
  const roomId = crypto.randomUUID();
  const session = {
    roomId,
    users: [a, b],
    startTime: Date.now(),
    extended: false,
    continueVotes: new Set(),
    messages: [],
    counted: false,
  };
  activeSessions.set(roomId, session);
  userToRoom.set(a, roomId);
  userToRoom.set(b, roomId);

  for (const uid of [a, b]) {
    userSockets.get(uid)?.emit('matched', { roomId, duration: INITIAL_DURATION_MS });
  }

  session.countTimer = setTimeout(() => {
    if (!activeSessions.has(roomId)) return;
    session.counted = true;
    for (const uid of session.users) {
      const p = userProfiles.get(uid);
      if (p?.gender === 'male') {
        const rec = getOrCreateRecord(uid);
        consumeOneMatch(rec);
        sendQuota(uid);
      }
    }
  }, COUNT_THRESHOLD_MS);

  session.endTimer = setTimeout(() => {
    if (!activeSessions.has(roomId)) return;
    if (session.extended) return;
    for (const uid of session.users) {
      userSockets.get(uid)?.emit('decision-time');
    }
    session.decisionTimer = setTimeout(() => {
      if (!activeSessions.has(roomId)) return;
      if (session.extended) return;
      endSession(roomId, 'time-up');
    }, DECISION_WINDOW_MS);
  }, INITIAL_DURATION_MS);
}

function endSession(roomId, reason) {
  const s = activeSessions.get(roomId);
  if (!s) return;
  activeSessions.delete(roomId);
  clearTimeout(s.countTimer);
  clearTimeout(s.endTimer);
  clearTimeout(s.decisionTimer);
  for (const uid of s.users) {
    userToRoom.delete(uid);
    userSockets.get(uid)?.emit('session-ended', { reason });
  }
}

// ---------- Socket events ----------
io.on('connection', (socket) => {
  socket.on('register', (data) => {
    const { userId, gender } = data || {};
    if (typeof userId !== 'string' || userId.length < 8 ||
        !['male', 'female'].includes(gender)) {
      socket.emit('error-msg', 'Invalid registration');
      return;
    }

    const oldSock = userSockets.get(userId);
    if (oldSock && oldSock.id !== socket.id) {
      try { oldSock.disconnect(true); } catch (_) {}
    }

    userProfiles.set(userId, { gender });
    userSockets.set(userId, socket);
    socketToUser.set(socket.id, userId);

    sendQuota(userId);
    tryEnqueue(userId);
  });

  socket.on('message', (text) => {
    const uid = socketToUser.get(socket.id);
    if (!uid) return;
    const roomId = userToRoom.get(uid);
    if (!roomId) return;
    const s = activeSessions.get(roomId);
    if (!s) return;
    const safe = String(text || '').slice(0, 1000).trim();
    if (!safe) return;
    s.messages.push({ from: uid, text: safe, at: Date.now() });
    const other = s.users.find((u) => u !== uid);
    userSockets.get(other)?.emit('message', { from: 'them', text: safe });
    socket.emit('message', { from: 'me', text: safe });
  });

  socket.on('skip', () => {
    const uid = socketToUser.get(socket.id);
    if (!uid) return;
    const roomId = userToRoom.get(uid);
    if (roomId) endSession(roomId, 'skipped');
  });

  socket.on('continue', () => {
    const uid = socketToUser.get(socket.id);
    if (!uid) return;
    const roomId = userToRoom.get(uid);
    if (!roomId) return;
    const s = activeSessions.get(roomId);
    if (!s) return;
    s.continueVotes.add(uid);
    if (s.continueVotes.size === 2) {
      s.extended = true;
      clearTimeout(s.decisionTimer);
      for (const u of s.users) userSockets.get(u)?.emit('extended');
    } else {
      socket.emit('continue-pending');
    }
  });

  socket.on('report', () => {
    const uid = socketToUser.get(socket.id);
    if (!uid) return;
    const roomId = userToRoom.get(uid);
    if (!roomId) return;
    const s = activeSessions.get(roomId);
    if (!s) return;
    const other = s.users.find((u) => u !== uid);
    const report = { at: Date.now(), by: uid, against: other, messages: s.messages.slice(-20) };
    recentReports.push(report);
    if (recentReports.length > 500) recentReports.shift();
    const arr = reportsByUser.get(other) || [];
    arr.push({ date: today(), by: uid });
    reportsByUser.set(other, arr);
    const todayReports = arr.filter((r) => r.date === today()).length;
    if (todayReports >= REPORTS_TO_BLOCK) {
      blocks.set(other, Date.now() + BLOCK_DURATION_MS);
      userSockets.get(other)?.emit('blocked', {
        reason: 'You have been blocked for 24 hours due to multiple reports.',
      });
    }
    endSession(roomId, 'reported');
  });

  socket.on('next', () => {
    const uid = socketToUser.get(socket.id);
    if (uid) tryEnqueue(uid);
  });

  socket.on('disconnect', () => {
    const uid = socketToUser.get(socket.id);
    socketToUser.delete(socket.id);
    if (!uid) return;
    if (userSockets.get(uid) === socket) userSockets.delete(uid);
    waitingUsers.delete(uid);
    const roomId = userToRoom.get(uid);
    if (roomId) endSession(roomId, 'disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`✅ Anon Chat running at http://localhost:${PORT}`);
});
