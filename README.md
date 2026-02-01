# High-Throughput Event Ingestion & Analytics Service

This project is a backend service designed to ingest **high-volume user activity events**, store them efficiently, and expose **aggregated analytics APIs**.  
It focuses on **performance, reliability, and scalability** under traffic spikes.

The system was intentionally evolved step-by-step to demonstrate **engineering trade-offs and optimizations**.

---

## 🚀 What This Service Does

- Accepts **batched user activity events** (page views, messages, calls, form submissions, etc.)
- Buffers and **writes events in batches** to MongoDB to reduce write pressure
- Exposes **summary analytics per account** (last 24h stats)
- Handles traffic spikes using **queueing and backpressure**
- Designed to be load-tested with **k6**

---


---

## ⚡ Evolution & Optimizations

### 1️⃣ Express + In-Memory Queue (Baseline)

Initial version:
- Express.js server
- Events pushed into an **in-memory queue**
- Periodic batch writes to MongoDB

**Problems under load:**
- Express struggled with high concurrency
- In-memory queue would lose data on process crash
- Latency spikes during heavy traffic

---

### 2️⃣ Migration to Fastify

**Why Fastify?**
- Faster request lifecycle
- Lower overhead per request
- Better suited for high-throughput APIs

**Result:**
- Improved throughput
- Lower P95 latency
- More predictable performance under load

---

### 3️⃣ Queue-Based Batching (Backpressure)

Instead of writing events directly to MongoDB:
- Requests **enqueue events**
- A worker process **flushes events in batches**
- MongoDB writes are controlled and smoothed

**Benefits:**
- Protects MongoDB from write bursts
- Avoids connection pool exhaustion
- Keeps request latency low

---

### 4️⃣ Redis Queue (Production-Ready)

To improve reliability:
- In-memory queue was replaced with **Redis**
- Retry queue added for failed batch inserts
- Timeouts added to DB writes

**Trade-off:**
- Slightly more complexity
- Much better durability and resilience

---

## 🛡️ How the System Handles Traffic

- **Batching:** Events are written in batches (default: 500)
- **Queueing:** Incoming requests are decoupled from DB writes
- **Backpressure:** MongoDB is protected during traffic spikes
- **Retries:** Failed inserts are retried safely
- **Caching:** Summary responses are cached to reduce DB reads

---

## 📡 API Endpoints

### POST `/events`

Accepts a batch of events:

```json
[
  {
    "event_id": "evt_123",
    "account_id": "acc_1",
    "user_id": "user_10",
    "type": "message_sent",
    "timestamp": "2025-01-01T10:00:00Z",
    "metadata": { "any": "value" }
  }
]


