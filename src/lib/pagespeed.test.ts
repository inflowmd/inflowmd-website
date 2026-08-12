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
function stubFetch(queue: Reply[]): { calls: () => number; restore: () => void } {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => {
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
    restore: () => {
      globalThis.fetch = original;
    },
  };
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

  console.log(`\n${passed} pagespeed checks passed.`);
}

main().catch((err) => {
  console.error("pagespeed tests failed:", err);
  process.exit(1);
});
