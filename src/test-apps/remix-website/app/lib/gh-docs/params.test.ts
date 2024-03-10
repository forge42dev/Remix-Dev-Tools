import { validateParams as validate } from "./params";

let LATEST_V1_MAJOR_TAG: string;
let LATEST_V1_MINOR_TAG: string;
let LATEST_STABLE_TAG: string;

const TAGS = [
  "v1.0.0",
  "v1.1.0",
  (LATEST_V1_MINOR_TAG = "v1.1.1"),
  (LATEST_V1_MAJOR_TAG = "v1.2.0"),
  "v2.0.0",
  (LATEST_STABLE_TAG = "v2.1.0"),
  "v3.0.0-pre.0",
];

const BRANCHES = ["main", "dev"];

describe("validateParams", () => {
  describe("with a valid lang in the first position", () => {
    describe("and a valid tag in the second position", () => {
      it("returns null", () => {
        expect(validate(TAGS, BRANCHES, { lang: "en", ref: "v1.0.0" })).toBe(
          null,
        );
        expect(
          validate(TAGS, BRANCHES, { lang: "en", ref: "v1.0.0", "*": "beef" }),
        ).toBe(null);
      });
    });

    describe("and a valid shorthand tag", () => {
      it("expands the major shorthand", () => {
        expect(validate(TAGS, BRANCHES, { lang: "en", ref: "v1" })).toBe(
          `en/${LATEST_V1_MAJOR_TAG}`,
        );
      });
      it("expands the minor shorthand", () => {
        expect(validate(TAGS, BRANCHES, { lang: "en", ref: "v1.1" })).toBe(
          `en/${LATEST_V1_MINOR_TAG}`,
        );
      });
      it("expands the major shorthand, preserves splat", () => {
        expect(
          validate(TAGS, BRANCHES, { lang: "en", ref: "v1", "*": "beef/taco" }),
        ).toBe(`en/${LATEST_V1_MAJOR_TAG}/beef/taco`);
      });
    });

    describe("and a valid branch in the second position", () => {
      it("returns null", () => {
        expect(validate(TAGS, BRANCHES, { lang: "en", ref: "main" })).toBe(
          null,
        );
        expect(
          validate(TAGS, BRANCHES, { lang: "en", ref: "main", "*": "beef" }),
        ).toBe(null);
      });
    });

    it("redirects to the latest stable tag", () => {
      expect(validate(TAGS, BRANCHES, { lang: "en" })).toBe(
        `en/${LATEST_STABLE_TAG}`,
      );
    });

    describe("and an invalid branch or tag in the second position", () => {
      it("inserts latest tag", () => {
        expect(validate(TAGS, BRANCHES, { lang: "en", ref: "beef" })).toBe(
          `en/${LATEST_STABLE_TAG}/beef`,
        );
      });
    });
  });

  describe("with a valid tag in the first param", () => {
    it("adds lang", () => {
      expect(validate(TAGS, BRANCHES, { lang: "v1.0.0" })).toBe("en/v1.0.0");
    });

    it("adds lang and keeps splat params around", () => {
      expect(validate(TAGS, BRANCHES, { lang: "v1.0.0", ref: "beef" })).toBe(
        "en/v1.0.0/beef",
      );
    });
  });

  describe("with a valid shorthand tag in the first param", () => {
    it("adds lang, expands the major tag", () => {
      expect(validate(TAGS, BRANCHES, { lang: "v1" })).toBe(
        `en/${LATEST_V1_MAJOR_TAG}`,
      );
    });
  });

  describe("with a valid branch in the first position", () => {
    it("adds the lang", () => {
      expect(validate(TAGS, BRANCHES, { lang: "main" })).toBe("en/main");
    });
  });

  describe("without a valid branch or tag in the first position", () => {
    it("adds lang and latest stable tag", () => {
      expect(validate(TAGS, BRANCHES, { lang: "beef" })).toBe(`en/main/beef`);
    });
    describe("without a valid branch or tag in the second position", () => {
      it("adds lang and latest stable tag", () => {
        expect(validate(TAGS, BRANCHES, { lang: "beef", ref: "cheese" })).toBe(
          `en/main/beef/cheese`,
        );
      });
    });
  });
});
