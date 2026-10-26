export interface PublishedGrade {
  score: string | number;
  evaluation: { weight: number };
}
export function partialAverage(grades: PublishedGrade[]) {
  const weight = grades.reduce((sum, g) => sum + g.evaluation.weight, 0);
  return weight > 0
    ? grades.reduce((sum, g) => sum + Number(g.score) * g.evaluation.weight, 0) / weight
    : null;
}
export function creditWeightedAverage(courses: { credits: number; grades: PublishedGrade[] }[]) {
  const measured = courses
    .map((c) => ({ ...c, average: partialAverage(c.grades) }))
    .filter((c) => c.average !== null);
  const credits = measured.reduce((sum, c) => sum + c.credits, 0);
  return credits > 0
    ? measured.reduce((sum, c) => sum + c.average! * c.credits, 0) / credits
    : null;
}
export function attendanceRate(rows: { status: string }[]) {
  const counted = rows.filter((r) => r.status !== "EXCUSED");
  return counted.length
    ? (100 * counted.filter((r) => r.status === "PRESENT" || r.status === "LATE").length) /
        counted.length
    : null;
}
export function limaCalendar(now = new Date()) {
  const local = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Lima" }).format(now);
  const date = new Date(local + "T12:00:00Z");
  const weekday = date.getUTCDay() || 7;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - weekday + 1);
  return {
    weekday,
    local,
    date,
    days: Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
      return {
        weekday: i + 1,
        label: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i],
        day: d.getUTCDate(),
        iso: d.toISOString().slice(0, 10),
      };
    }),
  };
}
