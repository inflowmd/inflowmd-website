/**
 * Plain assertions for the PageSpeed client's retry/backoff behavior.
 * No test framework, no network — `fetch` is stubbed. Run with:
 *   npm run test:pagespeed
 *
 * Backoff delays are overridden to milliseconds so the suite stays fast; one
 * test pins the REAL production values so the spec can't drift silently.
 */

import assert from "node:assert/strict";
import {
  RETRY_DELAYS_MS,
  TOTAL_BUDGET_MS,
  runPageSpeed,
  type PageSpeedOptions,
} from "./pagespeed";

let passed = 0;
async function check(name: string, fn: () => Promise<void>): Promise<void> {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

/** A minimal successful PSI payload — enough for the parser. */
const OK_BODY = {
  lighthouseResult: {
    categories: { performance: { score: 0.73 } },
    audits: {
      "largest-contentful-paint": { numericValue: 2100 },
      "cumulative-layout-shift": { numericValue: 0.012 },
      "total-blocking-time": { numericValue: 30 },
      "speed-index": { numericValue: 1900 },
    },
  },
};

type Reply = { status: number; body?: unknown } | { throws: Error };

/** Installs a fetch stub that replies from `queue`, in order. */
function stubFetch(queue: Reply[]): {
  calls: () => number;
  urls: () => string[];
  restore: () => void;
} {
  const original = globalThis.fetch;
  let calls = 0;
  const urls: string[] = [];
  globalThis.fetch = (async (input: unknown) => {
    urls.push(String(input));
    const reply = queue[Math.min(calls, queue.length - 1)];
    calls++;
    if ("throws" in reply) throw reply.throws;
    return {
      status: reply.status,
      json: async () => reply.body ?? {},
    } as unknown as Response;
  }) as typeof fetch;
  return {
    calls: () => calls,
    urls: () => urls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

/** Runs `fn` with a specific key value (or none), capturing console.warn. */
async function withKey(
  key: string | undefined,
  fn: (warnings: string[]) => Promise<void>
): Promise<void> {
  const savedKey = process.env.PAGESPEED_API_KEY;
  const savedWarn = console.warn;
  const warnings: string[] = [];
  if (key === undefined) delete process.env.PAGESPEED_API_KEY;
  else process.env.PAGESPEED_API_KEY = key;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map(String).join(" "));
  };
  try {
    await fn(warnings);
  } finally {
    console.warn = savedWarn;
    if (savedKey === undefined) delete process.env.PAGESPEED_API_KEY;
    else process.env.PAGESPEED_API_KEY = savedKey;
  }
}

/** Fast backoff so the suite doesn't burn the real 2s + 5s. */
const FAST: PageSpeedOptions = { retryDelaysMs: [10, 20], totalBudgetMs: 5_000 };

async function main(): Promise<void> {
  await check("the production backoff is 2s then 5s, inside the 55s ceiling", async () => {
    assert.deepEqual(RETRY_DELAYS_MS, [2_000, 5_000]);
    assert.equal(TOTAL_BUDGET_MS, 55_000);
    // The whole sequence must fit the ceiling with room for real attempts.
    const totalWaiting = RETRY_DELAYS_MS.reduce((a, b) => a + b, 0);
    assert.ok(totalWaiting < TOTAL_BUDGET_MS, "backoff waits must fit inside the budget");
  });

  await check("a first-attempt success makes exactly one request", async () => {
    const stub = stubFetch([{ status: 200, body: OK_BODY }]);
    try {
      const result = await runPageSpeed("https://example.com", FAST);
      assert.equal(result.available, true);
      assert.equal(result.lighthouseScore, 73);
      assert.equal(result.lcp, 2.1);
      assert.equal(stub.calls(), 1);
    } finally {
      stub.restore();
    }
  });

  await check("a 500 is retried and the retry's success is returned", async () => {
    const stub = stubFetch([{ status: 500 }, { status: 200, body: OK_BODY }]);
    try {
      const result = await runPageSpeed("https://example.com", FAST);
      assert.equal(result.available, true);
      assert.equal(result.lighthouseScore, 73);
      assert.equal(stub.calls(), 2, "should have retried exactly once");
    } finally {
      stub.restore();
    }
  });

  await check("two 500s then success — three attempts total, success returned", async () => {
    const stub = stubFetch([{ status: 500 }, { status: 503 }, { status: 200, body: OK_BODY }]);
    try {
      const result = await runPageSpeed("https://example.com", FAST);
      assert.equal(result.available, true);
      assert.equal(stub.calls(), 3);
    } finally {
      stub.restore();
    }
  });

  await check("three 500s gives up and returns the honest partial", async () => {
    const stub = stubFetch([{ status: 500 }]);
    try {
      const result = await runPageSpeed("https://example.com", FAST);
      assert.equal(result.available, false);
      assert.equal(result.lighthouseScore, null);
      assert.match(result.error ?? "", /server error \(500\)/);
      assert.equal(stub.calls(), 3, "one initial attempt plus two retries, then stop");
    } finally {
      stub.restore();
    }
  });

  await check("a non-5xx error is NOT retried — quota/4xx answers immediately", async () => {
    const stub = stubFetch([
      { status: 429, body: { error: { message: "Quota exceeded for quota metric 'Queries'." } } },
    ]);
    try {
      const result = await runPageSpeed("https://example.com", FAST);
      assert.equal(result.available, false);
      assert.match(result.error ?? "", /Quota exceeded/);
      assert.equal(stub.calls(), 1, "retrying a quota rejection would only make it worse");
    } finally {
      stub.restore();
    }
  });

  await check("a timeout is NOT retried — the partial report is worth more", async () => {
    const abort = new Error("aborted");
    abort.name = "AbortError";
    const stub = stubFetch([{ throws: abort }]);
    try {
      const result = await runPageSpeed("https://example.com", FAST);
      assert.equal(result.available, false);
      assert.match(result.error ?? "", /did not finish measuring this page in time/);
      assert.equal(stub.calls(), 1);
    } finally {
      stub.restore();
    }
  });

  await check("a network error is not retried and surfaces its own message", async () => {
    const stub = stubFetch([{ throws: new Error("socket hang up") }]);
    try {
      const result = await runPageSpeed("https://example.com", FAST);
      assert.equal(result.available, false);
      assert.match(result.error ?? "", /socket hang up/);
      assert.equal(stub.calls(), 1);
    } finally {
      stub.restore();
    }
  });

  await check("retries never outlast the shared budget", async () => {
    // Budget is far smaller than the backoff would need, so after the first
    // 500 there is no room to wait — it must stop rather than overrun.
    const stub = stubFetch([{ status: 500 }]);
    const started = Date.now();
    try {
      const result = await runPageSpeed("https://example.com", {
        retryDelaysMs: [2_000, 5_000],
        totalBudgetMs: 400,
      });
      const elapsed = Date.now() - started;
      assert.equal(result.available, false);
      assert.match(result.error ?? "", /server error \(500\)/);
      assert.equal(stub.calls(), 1, "no budget for a backoff wait plus a real attempt");
      assert.ok(elapsed < 2_000, `must not sleep past the budget, took ${elapsed}ms`);
    } finally {
      stub.restore();
    }
  });

  await check("the whole retry sequence stays within the budget it was given", async () => {
    const stub = stubFetch([{ status: 500 }]);
    const started = Date.now();
    try {
      await runPageSpeed("https://example.com", {
        retryDelaysMs: [50, 100],
        totalBudgetMs: 3_000,
      });
      const elapsed = Date.now() - started;
      assert.equal(stub.calls(), 3);
      assert.ok(elapsed < 3_000, `sequence took ${elapsed}ms, budget was 3000ms`);
    } finally {
      stub.restore();
    }
  });

  /* ---------- authentication: a keyless call must never be silent ---------- */

  await check("an authenticated call attaches the key and warns about nothing", async () => {
    await withKey("AIzaSyTestKeyNotReal", async (warnings) => {
      const stub = stubFetch([{ status: 200, body: OK_BODY }]);
      try {
        const result = await runPageSpeed("https://example.com", FAST);
        assert.equal(result.available, true);
        assert.ok(
          stub.urls()[0].includes("key=AIzaSyTestKeyNotReal"),
          `the key must actually reach the query string: ${stub.urls()[0]}`
        );
        assert.equal(
          warnings.filter((w) => w.includes("PAGESPEED_API_KEY")).length,
          0,
          "a healthy authenticated call must be silent"
        );
      } finally {
        stub.restore();
      }
    });
  });

  await check("a MISSING key warns loudly and says exactly how to fix it", async () => {
    await withKey(undefined, async (warnings) => {
      const stub = stubFetch([{ status: 200, body: OK_BODY }]);
      try {
        await runPageSpeed("https://example.com", FAST);
        assert.ok(!stub.urls()[0].includes("key="), "no key should be sent");
        const warned = warnings.filter((w) => w.includes("PAGESPEED_API_KEY is missing"));
        assert.equal(warned.length, 1, `expected one loud warning, got ${warnings.length}`);
        assert.match(warned[0], /ANONYMOUSLY/, "must name the actual behavior");
        assert.match(warned[0], /quota/i, "must explain the consequence");
        assert.match(warned[0], /\.env\.local/, "must say how to fix it locally");
        assert.match(warned[0], /Vercel/, "must say how to fix it in production");
        assert.match(warned[0], /example\.com/, "must name the target that went out keyless");
      } finally {
        stub.restore();
      }
    });
  });

  await check("a PLACEHOLDER key counts as missing and warns", async () => {
    await withKey("your_key_here", async (warnings) => {
      const stub = stubFetch([{ status: 200, body: OK_BODY }]);
      try {
        await runPageSpeed("https://example.com", FAST);
        assert.ok(!stub.urls()[0].includes("key="), "a placeholder must not be sent");
        assert.ok(warnings.some((w) => w.includes("PAGESPEED_API_KEY is missing")));
      } finally {
        stub.restore();
      }
    });
  });

  await check("every retry of a keyless call warns — the noise is the point", async () => {
    await withKey(undefined, async (warnings) => {
      const stub = stubFetch([{ status: 500 }]);
      try {
        await runPageSpeed("https://example.com", FAST);
        assert.equal(stub.calls(), 3);
        assert.equal(
          warnings.filter((w) => w.includes("PAGESPEED_API_KEY is missing")).length,
          3,
          "a keyless batch should be impossible to miss in the logs"
        );
      } finally {
        stub.restore();
      }
    });
  });

  console.log(`\n${passed} pagespeed checks passed.`);
}

main().catch((err) => {
  console.error("pagespeed tests failed:", err);
  process.exit(1);
});
