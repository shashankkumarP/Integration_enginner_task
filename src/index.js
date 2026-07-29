import 'dotenv/config';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

const WRITE_KEY = process.env.SEGMENT_WRITE_KEY;
if (!WRITE_KEY) {
  console.error('Missing SEGMENT_WRITE_KEY paste your source write key in .env.');
  process.exit(1);
}

const segment = axios.create({
  baseURL: 'https://api.segment.io/v1',
  auth: { username: WRITE_KEY, password: '' },
  headers: { 'Content-Type': 'application/json' },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nowISO = () => new Date().toISOString();

async function send(endpoint, body) {
  const payload = { messageId: uuid(), timestamp: nowISO(), ...body };
  const { status } = await segment.post(endpoint, payload);
  console.log(`[${status}] ${endpoint} -> ${body.event || body.type || endpoint}`, payload.userId ? `(userId: ${payload.userId})` : `(anonymousId: ${payload.anonymousId})`);
}

async function run() {


  const anonymousId = uuid();
  const userId = `user_${uuid().slice(0, 8)}`;

  // 1. page_viewed — fired while the visitor is still anonymous
  await send('/track', {
    anonymousId,
    event: 'page_viewed',
    properties: {
      url: 'https://flowspark.example.com/pricing',
      referrer: 'https://google.com',
      title: 'FlowSpark — Pricing',
    },
  });
  await sleep(500);


  await send('/identify', {
    anonymousId,
    userId,
    traits: {
      email: 'jamie.doe@example.com',
      name: 'Jamie Doe',
      plan: 'trial',
      createdAt: nowISO(),
    },
  });
  await sleep(500);

 
  await send('/track', {
    anonymousId,
    userId,
    event: 'signup_completed',
    properties: {
      plan: 'trial',
      method: 'email',
      signup_source: 'pricing_page',
    },
  });
  await sleep(500);

  await send('/track', {
    userId,
    event: 'login_completed',
    properties: {
      method: 'email',
      login_count: 2,
    },
  });

  console.log('\nDone. Open Segment -> Source -> Debugger and confirm:');
  console.log(`  - page_viewed shows anonymousId ${anonymousId} with no userId`);
  console.log(`  - identify + signup_completed show BOTH anonymousId and userId ${userId}`);
  console.log(`  - login_completed shows only userId ${userId}`);
}

run().catch((err) => {
  console.error('Request failed:', err.response?.data || err.message);
  process.exit(1);
});
