const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  state: { type: String, enum: ["draft", "published"], default: "draft" },
  read_count: { type: Number, default: 0 },
  body: { type: String, required: true },
});

// Calculate reading time
blogSchema.virtual("reading_time").get(function () {
  // Adjust the averageSpeed value based on your estimation of reading speed
  const averageSpeed = 200; // words per minute
  const words = this.body.split(/\s+/).length;
  const readingTime = Math.ceil(words / averageSpeed);
  return readingTime;
});

module.exports = mongoose.model("Blog", blogSchema);
