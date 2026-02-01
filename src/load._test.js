import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 50 },
    { duration: '40s', target: 100 },
    { duration: '20s', target: 50 },
  ],
  thresholds: {
    http_req_duration: ['p95<500'], // P95 latency < 500ms
    http_req_failed: ['rate<0.01']  // <1% failed requests
  }
};






const BASE_URL = 'http://localhost:3000';

function randomEvent(account_id, user_id) {
  return {
    event_id: `${account_id}_${user_id}_${Date.now()}`,
    account_id,
    user_id,
    type: ['message_sent','call_made','form_submitted','login','custom'][Math.floor(Math.random()*5)],
    timestamp: new Date().toISOString(),
    metadata: { any: "sample" }
  };
}

export default function () {
  // 1. POST /events (batch of 10)
  const events = [];
  for(let i=0;i<10;i++) {
    events.push(randomEvent(`acc_${Math.floor(Math.random()*10)}`, `user_${Math.floor(Math.random()*50)}`));
  }
  const postRes = http.post(`${BASE_URL}/events`, JSON.stringify(events), {
    headers: { 'Content-Type': 'application/json' }
  });
  check(postRes, { 'POST /events 202': r => r.status === 202 });

  // 2. GET /summary/:id
  const accountId = `acc_${Math.floor(Math.random()*10)}`;
  const getRes = http.get(`${BASE_URL}/summary/${accountId}?window=24h`);
  check(getRes, { 'GET /summary 200': r => r.status === 200 });

  sleep(0.1); // small pause
}
