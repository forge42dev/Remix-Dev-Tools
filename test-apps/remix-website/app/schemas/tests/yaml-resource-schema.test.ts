import { yamlResourceSchema } from "../yaml-resource-schema";

const validResource = {
  title: "My Resource",
  imgSrc: "https://example.com/image.png",
  repoUrl: "https://example.com/repo",
  initCommand: "npm install",
  category: "templates",
  featured: true,
};

describe("yamlResourceSchema", () => {
  it("should return a valid resource array", () => {
    expect(yamlResourceSchema.parse([validResource])).toEqual([validResource]);
  });

  it("should throw an error if the title is missing", () => {
    expect(() =>
      yamlResourceSchema.parse([{ ...validResource, title: "" }]),
    ).toThrow();
  });

  it("should throw an error if the imgSrc is missing", () => {
    expect(() =>
      yamlResourceSchema.parse([{ ...validResource, imgSrc: "" }]),
    ).toThrow();
  });

  it("should throw an error if the imgSrc is not a URL", () => {
    expect(() =>
      yamlResourceSchema.parse([{ ...validResource, imgSrc: "not-a-url" }]),
    ).toThrow();
  });

  it("should throw an error if the repoUrl is missing", () => {
    expect(() =>
      yamlResourceSchema.parse([{ ...validResource, repoUrl: "" }]),
    ).toThrow();
  });

  it("should throw an error if the repoUrl is not a URL", () => {
    expect(() =>
      yamlResourceSchema.parse([{ ...validResource, repoUrl: "not-a-url" }]),
    ).toThrow();
  });

  it("should throw an error if the initCommand is missing", () => {
    expect(() =>
      yamlResourceSchema.parse([{ ...validResource, initCommand: "" }]),
    ).toThrow();
  });

  it("should throw an error if the category is missing", () => {
    expect(() =>
      yamlResourceSchema.parse([{ ...validResource, category: "" }]),
    ).toThrow();
  });

  it("should throw an error if the category is not templates or libraries", () => {
    expect(() =>
      yamlResourceSchema.parse([
        { ...validResource, category: "not-a-category" },
      ]),
    ).toThrow();
  });

  it("should throw an error if the featured is not a boolean", () => {
    expect(() =>
      yamlResourceSchema.parse([
        { ...validResource, featured: "not-a-boolean" },
      ]),
    ).toThrow();
  });

  it("should not throw an error if the featured is missing", () => {
    expect(() =>
      yamlResourceSchema.parse([{ ...validResource, featured: undefined }]),
    ).not.toThrow();
  });

  it("should not throw an error if the featured is false", () => {
    expect(() =>
      yamlResourceSchema.parse([{ ...validResource, featured: false }]),
    ).not.toThrow();
  });

  it("should not throw an error if the featured is true", () => {
    expect(() =>
      yamlResourceSchema.parse([{ ...validResource, featured: true }]),
    ).not.toThrow();
  });

  it("should not throw an error if the category is templates", () => {
    expect(() =>
      yamlResourceSchema.parse([{ ...validResource, category: "templates" }]),
    ).not.toThrow();
  });

  it("should not throw an error if the category is libraries", () => {
    expect(() =>
      yamlResourceSchema.parse([{ ...validResource, category: "libraries" }]),
    ).not.toThrow();
  });
});
