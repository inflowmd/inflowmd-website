/**
 * Plain assertions for the SSRF guard and rate limiter. Run with:
 *   npm run test:security
 */

import assert from "node:assert/strict";
import http from "node:http";
import { assertSafeUrl, isInternalAddress } from "./ssrfGuard";
import { fetchHtml } from "./fetchHtml";
import { rateLimit, resetRateLimit } from "./rateLimit";

let passed = 0;
async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

async function main(): Promise<void> {
  console.log("\nssrfGuard\n");

  /* ---------- address classification ---------- */

  await check("classifies internal IPv4 ranges", () => {
    for (const ip of [
      "127.0.0.1",
      "127.1.2.3",
      "10.0.0.1",
      "10.255.255.255",
      "172.16.0.1",
      "172.31.255.255",
      "192.168.1.1",
      "169.254.169.254", // cloud metadata
      "0.0.0.0",
    ]) {
      assert.equal(isInternalAddress(ip), true, `${ip} should be internal`);
    }
  });

  await check("leaves public IPv4 alone", () => {
    for (const ip of ["8.8.8.8", "1.1.1.1", "172.15.0.1", "172.32.0.1", "192.169.0.1"]) {
      assert.equal(isInternalAddress(ip), false, `${ip} should be public`);
    }
  });

  await check("classifies internal IPv6, including IPv4-mapped", () => {
    for (const ip of ["::1", "::", "fe80::1", "fc00::1", "fd12:3456::1", "::ffff:127.0.0.1"]) {
      assert.equal(isInternalAddress(ip), true, `${ip} should be internal`);
    }
    assert.equal(isInternalAddress("2606:4700:4700::1111"), false);
  });

  /* ---------- URL-level guard ---------- */

  await check("rejects loopback hostnames and IP literals", async () => {
    for (const url of [
      "http://localhost/",
      "http://localhost:3000/x",
      "http://foo.localhost/",
      "http://127.0.0.1/",
      "http://169.254.169.254/latest/meta-data/",
      "http://10.0.0.5/admin",
      "http://192.168.1.1/",
      "http://[::1]/",
    ]) {
      const v = await assertSafeUrl(url);
      assert.equal(v.ok, false, `${url} should be refused`);
    }
  });

  await check("rejects non-http(s) schemes", async () => {
    for (const url of ["file:///etc/passwd", "ftp://example.com/x", "gopher://example.com/"]) {
      const v = await assertSafeUrl(url);
      assert.equal(v.ok, false, `${url} should be refused`);
    }
  });

  await check("allows a public host", async () => {
    const v = await assertSafeUrl("https://example.com/");
    assert.equal(v.ok, true);
  });

  await check("a name that will not resolve is allowed through, not refused", async () => {
    // Must stay permissive: a site that is merely down still deserves the
    // partial report, rather than a hard rejection implying wrongdoing.
    const v = await assertSafeUrl("https://this-domain-does-not-exist-9v8x7z.com/");
    assert.equal(v.ok, true);
  });

  /* ---------- the redirect case ---------- */

  await check("REDIRECT: a public URL that 302s to an internal address is blocked", async () => {
    // A server that redirects to loopback, standing in for a hostile site.
    const server = http.createServer((req, res) => {
      if (req.url === "/redirect") {
        res.writeHead(302, { Location: "http://169.254.169.254/latest/meta-data/" });
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<html><body><h1>ok</h1></body></html>");
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    const port = (server.address() as { port: number }).port;

    try {
      // The test server itself lives on loopback, so it is exempted — but only
      // it. Every other hop is judged by the real guard.
      const guard = async (u: string) => {
        const parsed = new URL(u);
        if (parsed.hostname === "127.0.0.1" && parsed.port === String(port)) {
          return { ok: true } as const;
        }
        return assertSafeUrl(u);
      };

      // Baseline: the exempted origin itself fetches fine.
      const direct = await fetchHtml(`http://127.0.0.1:${port}/`, { guard });
      assert.equal(direct.ok, true, "control fetch should succeed");

      // The real case: same origin, but it redirects to cloud metadata.
      const redirected = await fetchHtml(`http://127.0.0.1:${port}/redirect`, { guard });
      assert.equal(redirected.ok, false, "redirect to internal must fail");
      assert.equal(redirected.blocked, true, "must be reported as blocked");
      assert.match(redirected.finalUrl ?? "", /169\.254\.169\.254/);
      // The metadata body must never reach the caller.
      assert.equal(redirected.html, "");
    } finally {
      await new Promise<void>((r) => server.close(() => r()));
    }
  });

  await check("REDIRECT: every hop is guarded, not only the first", async () => {
    const seen: string[] = [];
    const server = http.createServer((req, res) => {
      if (req.url === "/a") {
        res.writeHead(302, { Location: "/b" });
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<html><body><h1>done</h1></body></html>");
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    const port = (server.address() as { port: number }).port;

    try {
      const guard = async (u: string) => {
        seen.push(new URL(u).pathname);
        return { ok: true } as const;
      };
      await fetchHtml(`http://127.0.0.1:${port}/a`, { guard });
      assert.deepEqual(seen, ["/a", "/b"], `guard should see both hops, saw ${seen.join(",")}`);
    } finally {
      await new Promise<void>((r) => server.close(() => r()));
    }
  });

  await check("relative Location headers resolve against the current URL", async () => {
    const server = http.createServer((req, res) => {
      if (req.url === "/start") {
        res.writeHead(302, { Location: "/landed" });
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<html><body><h1>landed</h1></body></html>");
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    const port = (server.address() as { port: number }).port;
    try {
      const guard = async () => ({ ok: true }) as const;
      const r = await fetchHtml(`http://127.0.0.1:${port}/start`, { guard });
      assert.equal(r.ok, true);
      assert.match(r.finalUrl ?? "", /\/landed$/);
      assert.match(r.html, /landed/);
    } finally {
      await new Promise<void>((r) => server.close(() => r()));
    }
  });

  /* ---------- rate limiting ---------- */

  console.log("\nrateLimit\n");

  await check("allows 10 per window, then refuses the 11th", () => {
    resetRateLimit();
    for (let i = 0; i < 10; i++) {
      assert.equal(rateLimit("1.2.3.4").allowed, true, `request ${i + 1} should pass`);
    }
    const over = rateLimit("1.2.3.4");
    assert.equal(over.allowed, false);
    assert.ok(over.retryAfter > 0, "should report a retry-after");
  });

  await check("limits are per key, so one caller cannot starve another", () => {
    resetRateLimit();
    for (let i = 0; i < 10; i++) rateLimit("1.1.1.1");
    assert.equal(rateLimit("1.1.1.1").allowed, false);
    assert.equal(rateLimit("2.2.2.2").allowed, true);
  });

  await check("the window slides — old hits expire", async () => {
    resetRateLimit();
    const WINDOW = 40;
    for (let i = 0; i < 10; i++) rateLimit("3.3.3.3", 10, WINDOW);
    // Immediately over the limit...
    assert.equal(rateLimit("3.3.3.3", 10, WINDOW).allowed, false);
    // ...but once the window has genuinely elapsed, the slots free up.
    await new Promise((r) => setTimeout(r, WINDOW + 15));
    assert.equal(rateLimit("3.3.3.3", 10, WINDOW).allowed, true);
  });

  await check("booth headroom: a walk-up audit is nowhere near the limit", () => {
    resetRateLimit();
    // One live audit is one request; the picker path never reaches the limiter.
    const v = rateLimit("booth");
    assert.equal(v.allowed, true);
    assert.equal(v.remaining, 9);
  });

  console.log(`\n${passed} checks passed\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
