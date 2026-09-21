import { describe, expect, it } from "vitest";
import {
  displayResolutionRate,
  displayResponseMinutes,
  formatResolutionRate,
} from "@/lib/display-brand-metrics";

describe("displayResolutionRate", () => {
  it("şikayeti olmayan markada oran yoktur", () => {
    expect(displayResolutionRate("x", 80, 0, 0)).toBeNull();
    expect(displayResolutionRate("x", 80, null, null)).toBeNull();
  });

  it("kayıtlı oranı kullanır", () => {
    expect(displayResolutionRate("x", 87, 100, 87)).toBe(87);
  });

  it("kayıtlı oran yoksa çözülen/toplam üzerinden hesaplar", () => {
    expect(displayResolutionRate("x", 0, 200, 50)).toBe(25);
  });

  it("hiç çözüm yoksa 0 döner (null değil)", () => {
    expect(displayResolutionRate("x", 0, 10, 0)).toBe(0);
  });

  it("99'da tavanlanır — %100 gösterilmez", () => {
    expect(displayResolutionRate("x", 100, 10, 10)).toBe(99);
  });
});

describe("displayResponseMinutes", () => {
  it("şikayeti olmayan markada süre yoktur", () => {
    expect(displayResponseMinutes("x", 120, 0)).toBeNull();
  });

  it("ölçüm yoksa null döner (0 dakika gibi görünmesin)", () => {
    expect(displayResponseMinutes("x", 0, 5)).toBeNull();
  });

  it("ölçüm varsa dakikayı döner", () => {
    expect(displayResponseMinutes("x", 120, 5)).toBe(120);
  });
});

describe("formatResolutionRate", () => {
  it("Bulgarca yüzde biçimi sonektir", () => {
    expect(formatResolutionRate(87, 100)).toBe("87%");
  });

  it("şikayet yoksa tire döner", () => {
    expect(formatResolutionRate(87, 0)).toBe("—");
    expect(formatResolutionRate(87, null)).toBe("—");
  });

  it("oran bilinmiyorsa tire döner", () => {
    expect(formatResolutionRate(null, 10)).toBe("—");
    expect(formatResolutionRate(-1, 10)).toBe("—");
  });
});
