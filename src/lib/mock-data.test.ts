import { describe, expect, it } from "vitest";
import {
  formatCompactCount,
  formatRating,
  formatResponseTime,
} from "@/lib/mock-data";

describe("formatResponseTime — Bulgarca birimler", () => {
  it("bir saatin altını 'мин' ile gösterir", () => {
    expect(formatResponseTime(45)).toBe("45 мин");
  });

  it("bir günün altını 'ч' ile gösterir", () => {
    expect(formatResponseTime(120)).toBe("2 ч");
  });

  it("bir günden uzunu 'д' ile gösterir", () => {
    expect(formatResponseTime(60 * 24 * 3)).toBe("3 д");
  });

  it("ölçüm yoksa tire döner", () => {
    expect(formatResponseTime(0)).toBe("—");
    expect(formatResponseTime(null)).toBe("—");
    expect(formatResponseTime(undefined)).toBe("—");
  });

  it("Türkçe birim (dk/s/g) üretmez", () => {
    const outputs = [30, 120, 60 * 24 * 2].map(formatResponseTime);
    expect(outputs.some((o) => /\b(dk|sa|gün|g)\b/.test(o))).toBe(false);
  });
});

describe("formatRating", () => {
  it("hiç oy yoksa 0.0 değil tire gösterir", () => {
    expect(formatRating(0, 0)).toBe("—");
    expect(formatRating(4.5, 0)).toBe("—");
    expect(formatRating(null, null)).toBe("—");
  });

  it("oy varsa tek ondalık gösterir", () => {
    expect(formatRating(4.25, 10)).toBe("4.3");
    expect(formatRating(3, 1)).toBe("3.0");
  });
});

describe("formatCompactCount", () => {
  it("1000'in altını kısaltmaz", () => {
    expect(formatCompactCount(5)).toBe("5");
    expect(formatCompactCount(999)).toBe("999");
  });

  it("boş değeri 0 sayar", () => {
    expect(formatCompactCount(null)).toBe("0");
  });
});
