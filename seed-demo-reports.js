#!/usr/bin/env node
/**
 * Demo seed script — places flood reports along the Vinhomes Grand Park →
 * Independence Palace corridor for screenshot/demo purposes.
 *
 * Usage:  node seed-demo-reports.js
 * Auth:   reads refresh token from Firebase CLI credential store (~/.config/configstore/firebase-tools.json)
 */

const https = require('https');
const os = require('os');
const fs = require('fs');
const { geohashForLocation } = require('./functions/node_modules/geofire-common');

// --- credentials -----------------------------------------------------------
const configPath = os.homedir() + '/.config/configstore/firebase-tools.json';
const fbConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const refreshToken = fbConfig.tokens?.refresh_token;
if (!refreshToken) throw new Error('No Firebase CLI token found. Run: firebase login');
const FIREBASE_CLIENT_ID     = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const FIREBASE_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

const PROJECT = 'flood-up';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

// --- helpers ---------------------------------------------------------------
function post(url, body, headers) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}: ${raw}`));
        else resolve(JSON.parse(raw));
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getAccessToken() {
  const body = new URLSearchParams({
    client_id:     FIREBASE_CLIENT_ID,
    client_secret: FIREBASE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type:    'refresh_token',
  }).toString();
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        const json = JSON.parse(raw);
        if (json.error) reject(new Error(json.error_description ?? json.error));
        else resolve(json.access_token);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function ts(date) {
  return { timestampValue: date.toISOString() };
}
function str(v) { return { stringValue: v }; }
function num(v) { return { doubleValue: v }; }
function integer(v) { return { integerValue: String(v) }; }
function bool(v) { return { booleanValue: v }; }

function makeDoc(r, now) {
  const reportedAt = new Date(now + r.offsetMinutes * 60 * 1000);
  const expiresAt  = new Date(reportedAt.getTime() + 6 * 60 * 60 * 1000);
  const geohash    = geohashForLocation([r.lat, r.lng], 7);
  const depthBonus = { ankle: 0, knee: 5, waist: 10, chest: 15 };
  const trustScore = 60 + (depthBonus[r.depth] ?? 0) + (r.status === 'confirmed' ? 10 : 0);

  const fields = {
    lat:                num(r.lat),
    lng:                num(r.lng),
    geohash:            str(geohash),
    depth:              str(r.depth),
    reportedAt:         ts(reportedAt),
    expiresAt:          ts(expiresAt),
    status:             str(r.status),
    userId:             str('demo-seed-user'),
    accountAgeDays:     integer(120),
    upvotes:            integer(r.status === 'confirmed' ? Math.floor(Math.random() * 8) + 2 : 0),
    downvotes:          integer(0),
    corroborationCount: integer(r.status === 'confirmed' ? 3 : 1),
    weatherRainfallMm:  num(18.4),
    trustScore:         num(trustScore),
  };
  return { fields };
}

// --- report definitions ----------------------------------------------------
const reports = [
  { lat: 10.8414, lng: 106.8094, depth: 'knee',  status: 'confirmed', offsetMinutes: -50 },
  { lat: 10.8290, lng: 106.7862, depth: 'ankle', status: 'pending',   offsetMinutes: -35 },
  { lat: 10.8162, lng: 106.7638, depth: 'waist', status: 'confirmed', offsetMinutes: -80 },
  { lat: 10.8021, lng: 106.7472, depth: 'knee',  status: 'confirmed', offsetMinutes: -45 },
  { lat: 10.7948, lng: 106.7310, depth: 'chest', status: 'confirmed', offsetMinutes: -90 },
  { lat: 10.7870, lng: 106.7178, depth: 'waist', status: 'confirmed', offsetMinutes: -30 },
  { lat: 10.7921, lng: 106.7015, depth: 'ankle', status: 'pending',   offsetMinutes: -15 },
  { lat: 10.7850, lng: 106.6990, depth: 'knee',  status: 'confirmed', offsetMinutes: -60 },
  { lat: 10.7800, lng: 106.6975, depth: 'ankle', status: 'pending',   offsetMinutes: -20 },
];

// --- main ------------------------------------------------------------------
async function seed() {
  console.log('Fetching access token...');
  const token = await getAccessToken();
  const headers = { Authorization: `Bearer ${token}` };
  const now = Date.now();

  for (const r of reports) {
    const doc = makeDoc(r, now);
    const geohash = doc.fields.geohash.stringValue;
    await post(`${BASE_URL}/reports`, doc, headers);
    console.log(`  + ${r.depth.padEnd(5)}  ${r.status.padEnd(9)}  [${r.lat}, ${r.lng}]  ${geohash}`);
  }

  console.log(`\nSeeded ${reports.length} reports into Firestore project "${PROJECT}".`);
}

seed().catch(err => { console.error(err.message); process.exit(1); });
