const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    // Implement password hashing before storing
    type: String,
    required: true,
  },
  // ... other user properties you want to store (optional)
});

module.exports = mongoose.model("User", userSchema);
