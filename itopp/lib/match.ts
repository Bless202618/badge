// Deterministic match score v1 (no ML) — dept 40 + skills 40 + level 20.
export interface MatchInput {
  department: string;
  skills: string[];
}

export interface PostingMatchInput {
  departments: string[];
  skillsRequired: string[];
}

export function matchScore(
  student: MatchInput,
  posting: PostingMatchInput
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (posting.departments.includes(student.department)) {
    score += 40;
    reasons.push("Department match");
  }

  const mine = student.skills.map((s) => s.toLowerCase().trim());
  const overlap = posting.skillsRequired.filter((s) =>
    mine.includes(s.toLowerCase().trim())
  );
  if (posting.skillsRequired.length === 0) {
    score += 20;
    reasons.push("Open to all skills");
  } else if (overlap.length > 0) {
    score += Math.round((40 * overlap.length) / posting.skillsRequired.length);
    reasons.push(
      `${overlap.length}/${posting.skillsRequired.length} skills match`
    );
  }

  // Every posting is open to 400/500-level students (no level gate in v1).
  score += 20;
  reasons.push("400-level eligible");

  return { score, reasons };
}
