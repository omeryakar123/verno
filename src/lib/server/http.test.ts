import { describe, expect, it, beforeEach } from "vitest";
import {
  HttpError,
  __resetRateLimits,
  clientIp,
  rateLimit,
} from "@/lib/server/http";

describe("rateLimit", () => {
  beforeEach(() => __resetRateLimits());

  it("limite kadar izin verir", () => {
    for (let i = 0; i < 5; i++) {
      expect(() => rateLimit("k", 5, 60_000)).not.toThrow();
    }
  });

  it("limit aşılınca 429 fırlatır", () => {
    for (let i = 0; i < 5; i++) rateLimit("k", 5, 60_000);
    try {
      rateLimit("k", 5, 60_000);
      throw new Error("429 bekleniyordu");
    } catch (e) {
      expect(e).toBeInstanceOf(HttpError);
      expect((e as HttpError).status).toBe(429);
    }
  });

  it("sayaçlar anahtar başına ayrıdır", () => {
    for (let i = 0; i < 5; i++) rateLimit("a", 5, 60_000);
    expect(() => rateLimit("b", 5, 60_000)).not.toThrow();
  });

  it("pencere dolunca sayaç sıfırlanır", () => {
    rateLimit("k", 1, 1);
    // Pencere 1 ms — bir sonraki tick'te sıfırlanmalı.
    const started = Date.now();
    while (Date.now() <= started + 2) {
      /* pencerenin dolmasını bekle */
    }
    expect(() => rateLimit("k", 1, 1)).not.toThrow();
  });

  it("429 mesajı Bulgarcadır ve kalan süreyi söyler", () => {
    rateLimit("k", 1, 60_000);
    try {
      rateLimit("k", 1, 60_000);
      throw new Error("429 bekleniyordu");
    } catch (e) {
      expect((e as HttpError).message).toMatch(/Твърде много заявки/);
      expect((e as HttpError).message).toMatch(/\d+ сек/);
    }
  });
});

describe("clientIp", () => {
  const req = (headers: Record<string, string>) =>
    new Request("https://verno.bg/", { headers });

  it("x-forwarded-for listesinden ilk IP'yi alır", () => {
    expect(clientIp(req({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe(
      "1.2.3.4",
    );
  });

  it("x-forwarded-for yoksa x-real-ip'e düşer", () => {
    expect(clientIp(req({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
  });

  it("hiçbiri yoksa 'unknown' döner", () => {
    expect(clientIp(req({}))).toBe("unknown");
  });
});
