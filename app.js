const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;
console.log(secretKey);
// const crypto = require("crypto");
// const secretKey = "W3H4euYdDJvj";
const bcrypt = require("bcryptjs");
const logger = require("./logger");
require("dotenv").config();

const User = require("./schema/user.model.js");
const Blog = require("./schema/blog.model.js"); // Import Blog model
const authenticateToken = require("./middleware/auth-token.js"); // Apply the authentication middleware to relevant routes

const app = express();

// Connect to your MongoDB database
mongoose
  .connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => logger.info("Connected to MongoDB")) // Log database connection success
  .catch((err) => {
    logger.error("Error connecting to MongoDB:", err); // Log database connection error
    console.error("Error connecting to MongoDB", err); // Also log to console for visibility
  });

app.use(bodyParser.json());

const sendErrorResponse = (res, statusCode, errorMessage) => {
  console.error(errorMessage);
  res.status(statusCode).json({ error: errorMessage });
};

// route to add a new blog, making sure all attributes are present
app.post("/blogs", authenticateToken, async (req, res) => {
  try {
    // Destructure the required attributes from the request body
    const {
      title,
      description,
      tags,
      author,
      timestamp,
      state,
      read_count,
      reading_time,
      body,
    } = req.body;

    // Check if any of the required attributes are missing
    if (
      !title ||
      !description ||
      !tags ||
      !author ||
      !timestamp ||
      !state ||
      !read_count ||
      !reading_time ||
      !body
    ) {
      return res.status(400).json({ error: "Missing required attributes" });
    }

    // Create a new blog post document based on the request body
    const newBlog = await Blog.create(req.body);
    res.status(201).json(newBlog);
  } catch (error) {
    sendErrorResponse(res, 500, "Server error");
  }
});

// Route to get list of blogs with pagination, search, and state filtering
app.get("/blogs", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      author,
      title,
      tags,
      sortBy,
      orderBy,
      state,
    } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    let query = {};

    // query for search
    if (author) query.author = author;
    if (title) query.title = { $regex: title, $options: "i" };
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };

    // query for state filtering
    if (state) query.state = state;

    // sort options
    let sortOptions = {};
    if (sortBy && orderBy) {
      sortOptions[sortBy] = orderBy === "asc" ? 1 : -1;
    }

    // Fetch blogs with pagination, search, and state filtering
    const blogs = await Blog.find(query)
      .sort(sortOptions)
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .populate("author", "first_name last_name email");

    res.json(blogs);
  } catch (error) {
    sendErrorResponse(res, 500, "Server error");
  }
});

// Route to change the state of a blog from draft to published
app.patch("/blogs/:id/state", async (req, res) => {
  try {
    const blogId = req.params.id;
    const { state } = req.body;

    // Find the blog by ID and update its state
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { state },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json({ message: "Blog state updated", updatedBlog });
  } catch (error) {
    sendErrorResponse(res, 500, "Server error");
  }
});

//ROUTE to signup new user
app.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword, // Remember to hash the password before saving
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ msg: "User created successfully" });
  } catch (err) {
    console.error("Error signing up:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Route to update/edit a blog post
app.put("/blogs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    // Ensure only the owner of the blog can update it
    if (req.user.userId !== update.author.toString()) {
      return sendErrorResponse(res, 403, "Unauthorized");
    }

    // Update the blog post based on the provided ID
    const updatedBlog = await Blog.findByIdAndUpdate(id, update, { new: true });

    if (!updatedBlog) {
      return sendErrorResponse(res, 404, "Blog not found");
    }

    res.json(updatedBlog);
  } catch (error) {
    sendErrorResponse(res, 500, "Server error");
  }
});

/// Route to sign in a user
app.post("/signin", async (req, res) => {
  console.log(req.headers);
  try {
    const { email, password } = req.body;

    console.log("Request Body:", req.body);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error("Error signing in:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to delete a blog post by ID
app.delete("/blogs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return sendErrorResponse(res, 404, "Blog not found");
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    sendErrorResponse(res, 500, "Server error");
  }
});

// Route to get a list of blogs created by the authenticated user
app.get("/my-blogs", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userBlogs = await Blog.find({ author: userId });

    res.json(userBlogs);
  } catch (error) {
    sendErrorResponse(res, 500, "Server error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

module.exports = app;
