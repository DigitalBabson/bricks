import { describe, it, expect } from "vitest";
import { isAllSingleLetters } from "../searchstax";

describe("isAllSingleLetters", () => {
  it("returns true for all single-letter words", () => {
    expect(isAllSingleLetters("A A A A")).toBe(true);
    expect(isAllSingleLetters("J SMITH")).toBe(false); // "SMITH" has 5 letters
    expect(isAllSingleLetters("G E L P E Y")).toBe(true); // all single letters
    expect(isAllSingleLetters("A B C")).toBe(true);
  });

  it("returns false when at least one word has multiple letters", () => {
    expect(isAllSingleLetters("AA")).toBe(false);
    expect(isAllSingleLetters("JOHN SMITH")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isAllSingleLetters("")).toBe(false);
  });

  it("ignores punctuation when counting letters", () => {
    expect(isAllSingleLetters("A! B? C.")).toBe(true);
  });

  it("handles whitespace variations", () => {
    expect(isAllSingleLetters("  A   B   C  ")).toBe(true);
    expect(isAllSingleLetters("A  B  C")).toBe(true);
  });
});
