import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
  describe("All fields provided", () => {
    it("should return 201", async () => {
      const userData = {
        firstName: "Sankha",
        lastName: "Chakraborty",
        email: "iamsankhachak@gmail.com",
        password: "passwordSecret"
      };
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(201);
    });

    it("should return valid json response", async () => {
      const userData = {
        firstName: "Sankha",
        lastName: "Chakraborty",
        email: "iamsankhachak@gmail.com",
        password: "passwordSecret"
      };
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });

    it("should add the user to the database", async () => {
      const userData = {
        firstName: "Sankha",
        lastName: "Chakraborty",
        email: "iamsankhachak@gmail.com",
        password: "passwordSecret"
      };
      await request(app).post("/auth/register").send(userData);
    });
  });
  describe("Fields are missing", () => {});
});
