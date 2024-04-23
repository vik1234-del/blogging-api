const app = require("../app"); // Assuming your Express app is exported from app.js
const supertest = require("supertest");
const request = supertest(app);
const expect = require("chai").expect;

describe("GET /blogs", () => {
  it("should retrieve a list of blogs", async () => {
    const res = await request.get("/blogs");
    // Add assertions for the response if needed
  });
});

describe("POST /blogs", () => {
  it("should create a new blog post", (done) => {
    const newBlog = {
      title: "Test Blog Post",
      description: "This is a test blog post.",
      tags: ["test", "example"],
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      author: "6627bf6142aba0132872db15",
    };
    request
      .post("/blogs")
      .send(newBlog)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body).to.be.an("object"); // Expecting a JSON object response

        // Check properties of the created blog post
        expect(res.body).to.have.property("title", "Test Blog Post");
        expect(res.body).to.have.property(
          "description",
          "This is a test blog post."
        );
        expect(res.body)
          .to.have.property("tags")
          .that.is.an("array")
          .with.lengthOf(2);
        expect(res.body.tags).to.include.members(["test", "example"]);
        expect(res.body).to.have.property(
          "body",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
        );
        expect(res.body).to.have.property("_id"); // Assuming the server assigns an ID to the blog post

        done();
      });
  });
});
