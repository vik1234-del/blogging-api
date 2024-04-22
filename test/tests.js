const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const expect = chai.expect;
const request = supertest(app);

describe("API Endpoints", () => {
  // Test for POST /blogs endpoint
  describe("POST /blogs", () => {
    it("should create a new blog post", async () => {
      const res = await request.post("/blogs").send({
        title: "Test Blog",
        description: "This is a test blog post",
        tags: ["test", "example"],
        author: "testuser",
        timestamp: new Date(),
        state: "published",
        read_count: 0,
        reading_time: "5 mins",
        body: "Lorem ipsum dolor sit amet.",
      });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("_id");
      expect(res.body.title).to.equal("Test Blog");
    });
  });
});
