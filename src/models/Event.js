const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  event_id: { type: String, index: true },
  account_id: { type: String, index: true },
  user_id: { type: String, index: true },
  type: { type: String, index: true },
  timestamp: { type: Date, index: true },
  metadata: Object
});

// Compound index for hot summary queries
EventSchema.index({ account_id: 1, timestamp: -1 });

module.exports = mongoose.model("Event", EventSchema);
