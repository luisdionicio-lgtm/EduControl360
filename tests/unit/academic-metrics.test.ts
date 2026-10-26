import { test } from "node:test";
import assert from "node:assert/strict";
import {
  partialAverage,
  creditWeightedAverage,
  attendanceRate,
  limaCalendar,
} from "../../apps/web/src/lib/academic-metrics.ts";
test("partial averages normalize only the published evaluation weight", () => {
  assert.equal(
    partialAverage([
      { score: "18", evaluation: { weight: 30 } },
      { score: "16", evaluation: { weight: 20 } },
    ]),
    17.2,
  );
  assert.equal(partialAverage([]), null);
});
test("overall partial average respects course credits and omits ungraded courses", () => {
  assert.equal(
    creditWeightedAverage([
      { credits: 4, grades: [{ score: 18, evaluation: { weight: 30 } }] },
      { credits: 2, grades: [{ score: 15, evaluation: { weight: 30 } }] },
      { credits: 8, grades: [] },
    ]),
    17,
  );
  assert.equal(creditWeightedAverage([]), null);
});
test("attendance includes late sessions and excludes excused sessions", () => {
  assert.equal(
    attendanceRate([
      { status: "PRESENT" },
      { status: "LATE" },
      { status: "ABSENT" },
      { status: "EXCUSED" },
    ]),
    200 / 3,
  );
  assert.equal(attendanceRate([{ status: "EXCUSED" }]), null);
});
test("week boundaries use Lima rather than the host timezone", () => {
  const week = limaCalendar(new Date("2026-10-27T02:00:00Z"));
  assert.equal(week.weekday, 1);
  assert.equal(week.local, "2026-10-26");
  assert.equal(week.days[6].iso, "2026-11-01");
});
