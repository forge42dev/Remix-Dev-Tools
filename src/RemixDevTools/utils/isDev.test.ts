import { isDev } from "./isDev";

describe("isDev Test suite", () => {
  it("should work", () => {
    process.env.NODE_ENV = "development";
    expect(isDev()).toBeTruthy();
  });
  it("should work", () => {
    process.env.NODE_ENV = "production";
    expect(isDev()).toBeFalsy();
  });
});
