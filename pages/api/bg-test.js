// containerId/log are module-scoped: they persist across warm invocations of
// the same Lambda execution environment and reset only on a cold start.
// That's what lets us detect whether unawaited background work resumes
// during a later, unrelated request on the same frozen/thawed container.
const containerId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const log = [];

function record(event, fields = {}) {
  const entry = { event, at: Date.now(), containerId, ...fields };
  log.push(entry);
  return entry;
}

record("cold-start");

export default async function handler(req, res) {
  const delayMs = Number(req.query.delay ?? 5000);
  const spawn = req.query.spawn !== "0";
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = Date.now();

  record("request-received", { runId, delayMs, spawn });

  if (spawn) {
    // Not awaited before responding — this is the behavior under test.
    (async () => {
      await new Promise((r) => setTimeout(r, delayMs));
      const fired = record("background-fired", { runId, delayMs, elapsed: Date.now() - startedAt });

      const sinkUrl = process.env.BG_TEST_SINK_URL;
      if (sinkUrl) {
        try {
          await fetch(sinkUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fired),
          });
          record("sink-post-ok", { runId });
        } catch (err) {
          record("sink-post-failed", { runId, error: String(err) });
        }
      }
    })();
  }

  return res.status(200).json({
    containerId,
    runId,
    serverTimeAtResponse: Date.now(),
    log,
  });
}
