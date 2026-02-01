const Event = require("../models/Event");
const redis = require("../redis");

async function summaryRoutes(fastify) {
  fastify.get("/summary/:id", async (req, reply) => {
    const accountId = req.params.id;
    const window = req.query.window || "24h";
    const cacheKey = `summary:${accountId}:${window}`;

    // 1. Parse window
    let since;
    switch (window) {
      case "7d": since = new Date(Date.now() - 7*24*60*60*1000); break;
      case "24h":
      default: since = new Date(Date.now() - 24*60*60*1000); break;
    }

    // 2. Cache first (fail-safe)
    let cached;
    try { cached = await redis.get(cacheKey); } catch (_) {}
    if (cached) return reply.send(JSON.parse(cached));

    // 3. MongoDB aggregation: totals + top users
    const aggregation = await Event.aggregate([
      { $match: { account_id: accountId, timestamp: { $gte: since } } },
      {
        $facet: {
          totals: [
            { $group: { _id: "$type", count: { $sum: 1 } } }
          ],
          top_users: [
            { $group: { _id: "$user_id", events: { $sum: 1 } } },
            { $sort: { events: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]).maxTimeMS(2000);

    const totals = Object.fromEntries(
      (aggregation[0]?.totals || []).map(d => [d._id, d.count])
    );

    const top_users = (aggregation[0]?.top_users || []).map(u => ({
      user_id: u._id,
      events: u.events
    }));

    const response = {
      account_id: accountId,
      window,
      totals,
      top_users
    };

    // 4. Cache result (fail-safe)
    try { await redis.setex(cacheKey, 60, JSON.stringify(response)); } catch (_) {}

    reply.send(response);
  });
}

module.exports = summaryRoutes;
