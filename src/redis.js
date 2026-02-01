// const Redis = require("ioredis");
// const redis = new Redis();
// module.exports = redis;
// const Redis = require("ioredis");

// const redis = new Redis(process.env.REDIS_URI, {
//   maxRetriesPerRequest: 3,
//   enableReadyCheck: true,
//   retryStrategy(times) {
//     return Math.min(times * 50, 2000);
//   },
// });

// console.log("REDIS_URI =", process.env.REDIS_URI);

// redis.on("connect", () => console.log("Redis connected"));
// redis.on("error", (e) => console.error("Redis error", e));

// module.exports = redis;

//   socket: {
//     host: process.env.REDIS_HOST,
//     port: Number(process.env.REDIS_PORT),
//     tls: true,
//     servername: process.env.REDIS_HOST   // REQUIRED FOR REDIS CLOUD
//   },
//   password: process.env.REDIS_PASSWORD

const { createClient } = require("redis");

const client = createClient({
 url: process.env.REDIS_URL

});

client.on("connect", () => console.log(" Redis connecting"));
client.on("ready", () => console.log(" Redis ready"));
client.on("error", (err) => console.error(" Redis error", err));

(async () => {
  await client.connect();
})();

module.exports = client;

