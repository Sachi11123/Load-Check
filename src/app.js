// const express = require("express");
// const app = express();
// const rateLimit = require("./middleware/rateLimit");

// app.use(express.json());
// app.use(rateLimit);

// app.use("/events", require("./routes/events"));
// app.use("/accounts", require("./routes/summary"));

// module.exports = app;
const fastify = require("fastify")({
  logger: true,
  bodyLimit: 1 * 1024 * 1024 // 1MB
});

// Rate limiting (reliability)
fastify.register(require("@fastify/rate-limit"), {
  max: 1000,
  timeWindow: "1 minute"
});

//Request timeouts (slow dependency protection)
fastify.addHook("onRequest", async (req, reply) => {
  req.setTimeout(5000);
});

fastify.register(require("./routes/events"));
fastify.register(require("./routes/summary"));

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.status(500).send({ error: "Internal Server Error" });
});



module.exports = fastify; 

