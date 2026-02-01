// const Event = require("./models/Event");
// //here its a in-memeory batching in which events are written to mongodb in batches
// const queue = [];
// let processing = false;

// async function processQueue() {
//   if (processing || queue.length === 0) return;
//   processing = true;

//   const batch = queue.splice(0, 500); // batch writes
//   await Event.insertMany(batch);

//   processing = false;
// }

// setInterval(processQueue, 100);

// module.exports = {
//   enqueue(events) {
//     queue.push(...events);   // queue is populated by api request calling enqueue
//   }
// };
const redis = require("./redis");
const Event = require("./models/Event");

const QUEUE = "events:queue";
const RETRY = "events:retry";
const BATCH_SIZE = 200;

async function enqueue(events) {
  // push to Redis concurrently
  //await Promise.all(events.map(e => redis.rpush(QUEUE, JSON.stringify(e))));
  async function enqueue(events) {
  const pipeline = redis.pipeline();
  for (const e of events) {
    pipeline.rPush(QUEUE, JSON.stringify(e));
  }
  await pipeline.exec();
}

}

async function insertWithTimeout(docs, timeout = 2000) {
  return Promise.race([
    Event.insertMany(docs),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("MongoDB insert timeout")), timeout)
    )
  ]);
}

async function processQueue() {
  const batch = [];
  try {
    for (let i = 0; i < BATCH_SIZE; i++) {
      const item = await redis.lPop(QUEUE);
      if (!item) break;
      batch.push(JSON.parse(item));
    }
    if (batch.length === 0) return;

    await insertWithTimeout(batch);
    console.log(`Processed batch of ${batch.length} events. Queue length: ${await redis.lLen(QUEUE)}`);
  } catch (err) {
    console.error("Insert failed → retrying", err);
    await Promise.all(batch.map(i => redis.rPush(RETRY, JSON.stringify(i))));
  }
}

async function retryFailed() {
  const batch = [];
  while (true) {
    const item = await redis.lPop(RETRY);
    if (!item) break;
    batch.push(item);
  }
  if (batch.length > 0) {
    await Promise.all(batch.map(i => redis.rPush(QUEUE, i)));
  }
}

setInterval(processQueue, 300);
setInterval(retryFailed, 5000);

module.exports = { enqueue };
