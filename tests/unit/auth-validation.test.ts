import { describe, expect, it } from "vitest";
import { getPasswordError, isValidEmail } from "@/lib/auth/validation";

describe("isValidEmail", () => {
  it("accepts well-formed emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("rejects malformed emails", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("getPasswordError", () => {
  it("returns null for passwords of 8+ characters", () => {
    expect(getPasswordError("longenough")).toBeNull();
  });

  it("returns an error message for short passwords", () => {
    expect(getPasswordError("short")).toMatch(/at least 8 characters/);
  });
});
