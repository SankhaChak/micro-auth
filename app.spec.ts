import request from "supertest";
import app from "./src/app";
import { calculateDiscount } from "./src/utils";

describe("App", () => {
  it("should calculate the discount", () => {
    const result = calculateDiscount(100, 10);
    expect(result).toBe(10);
  });

  it("should return 200", async () => {
    const response = await request(app).get("/").send();
    expect(response.statusCode).toBe(200);
  });
});
