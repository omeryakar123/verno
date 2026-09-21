import { describe, expect, it } from "vitest";
import { formatPhone, isValidPhone, toE164 } from "@/lib/phone";

describe("toE164 — Bulgar numaraları", () => {
  it("ulusal 0'lı biçimi kabul eder", () => {
    expect(toE164("0888123456")).toBe("+359888123456");
  });

  it("ülke kodlu biçimi kabul eder", () => {
    expect(toE164("+359 888 123 456")).toBe("+359888123456");
    expect(toE164("359888123456")).toBe("+359888123456");
  });

  it("9 hanelik yerel biçimi kabul eder", () => {
    expect(toE164("888123456")).toBe("+359888123456");
  });

  it("9 hane değilse reddeder", () => {
    expect(toE164("88812345")).toBeNull();
    expect(toE164("8881234567")).toBeNull();
  });

  it("8 veya 9 ile başlamayan mobil öneki reddeder", () => {
    expect(toE164("788123456")).toBeNull();
    expect(toE164("288123456")).toBeNull();
  });

  it("Türk cep numarasını (5xx) reddeder", () => {
    expect(toE164("05321234567")).toBeNull();
  });
});

describe("isValidPhone", () => {
  it("saklanan E.164 biçimini doğrular", () => {
    expect(isValidPhone("+359888123456")).toBe(true);
  });

  it("boş değeri reddeder", () => {
    expect(isValidPhone(null)).toBe(false);
    expect(isValidPhone("")).toBe(false);
  });

  it("yanlış uzunluğu reddeder", () => {
    expect(isValidPhone("+35988812345")).toBe(false);
  });
});

describe("formatPhone", () => {
  it("+359 (8XX) XXX XXX biçiminde gösterir", () => {
    expect(formatPhone("+359888123456")).toBe("+359 (888) 123 456");
  });

  it("yarım girişte kırılmaz", () => {
    expect(formatPhone("088")).toBe("+359 (88");
  });

  it("9 haneden fazlasını yok sayar", () => {
    expect(formatPhone("0888123456999")).toBe("+359 (888) 123 456");
  });
});
