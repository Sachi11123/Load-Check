// const app = require("./app");
// const connectDB = require("./db");

// connectDB().then(() => {
//   app.listen(3000, () => {
//     console.log("Server running on port 3000");
//   });
// });
require("dotenv").config();
const app = require("./app");

const connectDB = require("./db");

const startServer = async () => {
  try {
    // 1 Connect DB first
    await connectDB();

    // 2️  Start Fastify server
    await app.listen({ port: 3000 });
    console.log("Server running on port 3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

startServer();

const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  try {
    await app.close(); // stop Fastify
    await require("mongoose").connection.close(); // close MongoDB
    console.log("Shutdown complete");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
