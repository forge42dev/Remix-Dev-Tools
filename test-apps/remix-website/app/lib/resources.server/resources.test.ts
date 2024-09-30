import { fetchResourcesFromYaml, replaceRelativeLinks } from "./index";

describe("replaceRelativeLinks", () => {
  it("should replace relative links with absolute links for images", () => {
    const input = `<img src="./relative">`;
    const repoUrl = "https://my-repo";
    const expected = `<img src="${repoUrl}/raw/main/relative">`;
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(expected);
  });

  it("should not replace relative links with absolute links for links", () => {
    const input = `<link src="./relative">`;
    const repoUrl = "https://my-repo";

    expect(replaceRelativeLinks(input, repoUrl)).toEqual(input);
  });

  it("should replace relative links with absolute links when src is not the first attribute", () => {
    const input = `<img alt="alt text" src="./relative">`;
    const repoUrl = "https://my-repo";
    const expected = `<img alt="alt text" src="${repoUrl}/raw/main/relative">`;
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(expected);
  });

  it("should replace relative links with absolute links for images with other attributes and multiple images and other tags", () => {
    const input = `<img alt="alt text" src="./relative" ><img src="./relative2" alt="alt text2"><link src="./relative">`;
    const repoUrl = "https://my-repo";
    const expected = `<img alt="alt text" src="${repoUrl}/raw/main/relative" ><img src="${repoUrl}/raw/main/relative2" alt="alt text2"><link src="./relative">`;
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(expected);
  });

  it("should not replace relative links with absolute links for images with absolute links", () => {
    const input = `<img src="https://absolute">`;
    const repoUrl = "https://my-repo";
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(input);
  });

  it("should not replace relative links with absolute links for images with absolute links and replace with relative links properly", () => {
    const input = `<img src="https://absolute"><img src="./relative">`;
    const repoUrl = "https://my-repo";
    const expected = `<img src="https://absolute"><img src="${repoUrl}/raw/main/relative">`;
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(expected);
  });

  it("should not replace relative links that are not in the src attribute", () => {
    const input = `<img alt="./relative">`;
    const repoUrl = "https://my-repo";
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(input);
  });

  it("should not replace relative links that are not in the img tag", () => {
    const input = `you can find it here ./relative`;
    const repoUrl = "https://my-repo";
    expect(replaceRelativeLinks(input, repoUrl)).toEqual(input);
  });
});

describe("fetchResourcesFromYaml", () => {
  it("fetches resources from the yaml file properly and returns an array of resources", () => {
    const resources = fetchResourcesFromYaml();
    expect(resources.length).toBeGreaterThan(0);
  });
});
