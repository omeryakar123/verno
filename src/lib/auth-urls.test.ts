import { describe, expect, it } from "vitest";
import { expandTrustedOrigins, normalizeSiteUrl } from "@/lib/auth-urls";

describe("normalizeSiteUrl", () => {
  it("Coolify'ın bozuk 'https//host' biçimini onarır", () => {
    expect(normalizeSiteUrl("https//verno.bg")).toBe("https://verno.bg");
  });

  it("şemasız değere https ekler", () => {
    expect(normalizeSiteUrl("verno.bg")).toBe("https://verno.bg");
  });

  it("iç port (3000/8080) tarayıcı origin'inde görünmez", () => {
    expect(normalizeSiteUrl("https://verno.bg:3000")).toBe("https://verno.bg");
    expect(normalizeSiteUrl("https://verno.bg:8080")).toBe("https://verno.bg");
  });

  it("diğer portları korur", () => {
    expect(normalizeSiteUrl("http://localhost:8083")).toBe(
      "http://localhost:8083",
    );
  });

  it("yol ve sorgu kısmını atar", () => {
    expect(normalizeSiteUrl("https://verno.bg/login?x=1")).toBe(
      "https://verno.bg",
    );
  });

  it("boş veya geçersiz değerde null döner", () => {
    expect(normalizeSiteUrl("")).toBeNull();
    expect(normalizeSiteUrl(null)).toBeNull();
    expect(normalizeSiteUrl("   ")).toBeNull();
  });
});

describe("expandTrustedOrigins", () => {
  it("apex için www varyantını ekler", () => {
    expect(expandTrustedOrigins(["https://verno.bg"])).toEqual(
      expect.arrayContaining(["https://verno.bg", "https://www.verno.bg"]),
    );
  });

  it("www için apex varyantını ekler", () => {
    expect(expandTrustedOrigins(["https://www.verno.bg"])).toEqual(
      expect.arrayContaining(["https://verno.bg", "https://www.verno.bg"]),
    );
  });

  it("portu korur", () => {
    expect(expandTrustedOrigins(["http://localhost:8083"])).toContain(
      "http://localhost:8083",
    );
  });

  it("ilgisiz origin uydurmaz", () => {
    const out = expandTrustedOrigins(["https://verno.bg"]);
    expect(out.some((o) => o.includes("tepkimvar"))).toBe(false);
    expect(out).toHaveLength(2);
  });
});
