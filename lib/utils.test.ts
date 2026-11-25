import { cn } from "./utils";

describe("cn", () => {
  it("joins multiple class names into one string", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("drops falsy and conditional values", () => {
    expect(cn("flex", false && "hidden", undefined, null, "gap-2")).toBe("flex gap-2");
  });

  it("flattens arrays and objects", () => {
    expect(cn(["flex", "gap-2"], { "text-sm": true, "text-lg": false })).toBe("flex gap-2 text-sm");
  });

  it("lets the last conflicting tailwind utility win", () => {
    expect(cn("px-2 px-4", "text-sm text-lg")).toBe("px-4 text-lg");
  });

  it("returns an empty string with no inputs", () => {
    expect(cn()).toBe("");
  });
});
