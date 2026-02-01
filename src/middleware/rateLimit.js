const redis = require("../redis");

async function rateLimit(req, reply) {
  const ip = req.ip;
  const key = `rate:${ip}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 60);
  }

  if (count > 1000) {
    reply.code(429).send({ error: "Too many requests" });
  }
}

module.exports = rateLimit;  //redis rate limit