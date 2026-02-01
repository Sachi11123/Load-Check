// const express = require("express");
// const router = express.Router();
// const queue = require("../queue");

// router.post("/", async (req, res) => {
//   const events = req.body;

//   if (!Array.isArray(events)) {
//     return res.status(400).json({ error: "Array expected" });
//   }

//   queue.enqueue(events.map(e => ({
//     ...e,
//     timestamp: new Date(e.timestamp)
//   })));

//   res.status(202).json({ accepted: events.length });
// });

// module.exports = router;
const { enqueue } = require("../queue");

async function eventRoutes(fastify) {
  fastify.post("/events", {
    schema: {
      body: {
        type: "array",
        items: {
          type: "object",
          required: ["event_id", "account_id", "user_id", "type", "timestamp"],
          properties: {
            event_id: { type: "string" },
            account_id: { type: "string" },
            user_id: { type: "string" },
            type: { type: "string", enum: ["message_sent", "call_made", "form_submitted", "login", "custom"] },
            timestamp: { type: "string", format: "date-time" },
            metadata: { type: "object" }
          }
        }
      }
    }
  }, async (req, reply) => {
    try {
      await enqueue(req.body, { timeout: 1000 }); // 1 sec max
      reply.code(202).send({ status: "queued", count: req.body.length });
    } catch (err) {
      reply.code(503).send({ error: "Queue busy, try again" });
    }
  });
}

module.exports = eventRoutes;
