"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "./db";
import {
  createSession,
  destroySession,
  getSessionUser,
  hashPassword,
  verifyPassword,
} from "./auth";
import { DEPARTMENTS, LEVELS } from "./options";

export type ActionResult = { ok: true; role?: string } | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(6, "Password needs at least 6 characters").max(100),
  role: z.enum(["student", "company"]),
});

export async function signupAction(input: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the form and try again." };
  const { name, email, password, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "An account with this email already exists." };

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: role === "company" ? "company" : "student",
      status: "pending",
    },
  });
  await createSession(user.id);
  revalidatePath("/dashboard");
  return { ok: true, role: user.role };
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter a valid email and password." };

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user || !user.passwordHash) {
    return { ok: false, error: "No account found for that email." };
  }
  const good = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!good) return { ok: false, error: "Wrong password. Try again." };
  if (user.status === "suspended") {
    return { ok: false, error: "This account is suspended. Contact support." };
  }

  await createSession(user.id);
  revalidatePath("/dashboard");
  return { ok: true, role: user.role };
}

export async function logoutAction(): Promise<ActionResult> {
  await destroySession();
  revalidatePath("/");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Profiles (submit = back to "pending" so you re-check every version)
// ---------------------------------------------------------------------------
const studentSchema = z.object({
  name: z.string().trim().min(2).max(100),
  department: z.enum(DEPARTMENTS),
  level: z.enum(LEVELS),
  cgpa: z.number().min(0).max(5),
  skills: z.array(z.string().trim().min(1).max(40)).min(1).max(30),
  cvName: z.string().trim().min(1).max(200),
  idDocName: z.string().trim().min(1).max(200),
});

export async function saveStudentProfileAction(input: {
  name: string;
  department: string;
  level: string;
  cgpa: number;
  skills: string[];
  cvName: string;
  idDocName: string;
}): Promise<ActionResult> {
  const me = await getSessionUser();
  if (!me || me.role !== "student") return { ok: false, error: "Students only." };
  const parsed = studentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the form and try again." };

  await db.studentProfile.upsert({
    where: { userId: me.id },
    create: { userId: me.id, ...parsed.data, verificationStatus: "pending", reviewReason: null },
    update: { ...parsed.data, verificationStatus: "pending", reviewReason: null },
  });
  await db.user.update({ where: { id: me.id }, data: { status: "pending" } });
  revalidatePath("/dashboard");
  return { ok: true };
}

const companySchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  cacNumber: z.string().trim().min(3).max(40),
  contactName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(30),
  website: z.string().trim().min(4).max(200),
  docName: z.string().trim().min(1).max(200),
});

export async function saveCompanyProfileAction(input: {
  companyName: string;
  cacNumber: string;
  contactName: string;
  phone: string;
  website: string;
  docName: string;
}): Promise<ActionResult> {
  const me = await getSessionUser();
  if (!me || me.role !== "company") return { ok: false, error: "Companies only." };
  const parsed = companySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the form and try again." };

  await db.companyProfile.upsert({
    where: { userId: me.id },
    create: { userId: me.id, ...parsed.data, verificationStatus: "pending", reviewReason: null },
    update: { ...parsed.data, verificationStatus: "pending", reviewReason: null },
  });
  await db.user.update({ where: { id: me.id }, data: { status: "pending" } });
  revalidatePath("/dashboard");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Admin reviews (you are the sole verifier)
// ---------------------------------------------------------------------------
const reviewSchema = z.object({
  userId: z.string().min(1),
  decision: z.enum(["verified", "rejected"]),
  reason: z.string().trim().max(500).optional(),
});

async function requireAdmin() {
  const me = await getSessionUser();
  if (!me || me.role !== "admin") return null;
  return me;
}

export async function reviewStudentAction(input: {
  userId: string;
  decision: "verified" | "rejected";
  reason?: string;
}): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Admin only." };
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid review." };
  if (parsed.data.decision === "rejected" && !parsed.data.reason) {
    return { ok: false, error: "A rejection needs a reason." };
  }

  const profile = await db.studentProfile.findUnique({
    where: { userId: parsed.data.userId },
  });
  if (!profile) return { ok: false, error: "Profile not found." };

  await db.$transaction([
    db.studentProfile.update({
      where: { userId: parsed.data.userId },
      data: {
        verificationStatus: parsed.data.decision,
        reviewReason: parsed.data.decision === "rejected" ? parsed.data.reason ?? "" : null,
      },
    }),
    db.user.update({
      where: { id: parsed.data.userId },
      data: { status: parsed.data.decision === "verified" ? "verified" : "pending" },
    }),
    db.verificationReview.create({
      data: {
        kind: "student",
        profileId: profile.id,
        reviewer: admin.email,
        decision: parsed.data.decision,
        reason: parsed.data.reason ?? null,
      },
    }),
  ]);
  revalidatePath("/admin/queue");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function reviewCompanyAction(input: {
  userId: string;
  decision: "verified" | "rejected";
  reason?: string;
}): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Admin only." };
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid review." };
  if (parsed.data.decision === "rejected" && !parsed.data.reason) {
    return { ok: false, error: "A rejection needs a reason." };
  }

  const profile = await db.companyProfile.findUnique({
    where: { userId: parsed.data.userId },
  });
  if (!profile) return { ok: false, error: "Profile not found." };

  await db.$transaction([
    db.companyProfile.update({
      where: { userId: parsed.data.userId },
      data: {
        verificationStatus: parsed.data.decision,
        reviewReason: parsed.data.decision === "rejected" ? parsed.data.reason ?? "" : null,
      },
    }),
    db.user.update({
      where: { id: parsed.data.userId },
      data: { status: parsed.data.decision === "verified" ? "verified" : "pending" },
    }),
    db.verificationReview.create({
      data: {
        kind: "company",
        profileId: profile.id,
        reviewer: admin.email,
        decision: parsed.data.decision,
        reason: parsed.data.reason ?? null,
      },
    }),
  ]);
  revalidatePath("/admin/queue");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Postings (Phase 3) — verified companies only. No stipend field by PRD.
// ---------------------------------------------------------------------------
const postingSchema = z.object({
  title: z.string().trim().min(4).max(120),
  departments: z.array(z.string().trim().min(1)).min(1).max(10),
  location: z.string().trim().min(2).max(100),
  durationMonths: z.number().int().min(1).max(12),
  skillsRequired: z.array(z.string().trim().min(1).max(40)).max(30),
  customQuestions: z.array(z.string().trim().min(1).max(300)).max(10),
  isQuickPost: z.boolean(),
});

type PostingInput = z.infer<typeof postingSchema>;

async function requireVerifiedCompany() {
  const me = await getSessionUser();
  if (!me || me.role !== "company") return null;
  const profile = await db.companyProfile.findUnique({
    where: { userId: me.id },
  });
  if (!profile || profile.verificationStatus !== "verified") return null;
  return { me, profile };
}

export async function createPostingAction(
  input: PostingInput
): Promise<ActionResult> {
  const gate = await requireVerifiedCompany();
  if (!gate) return { ok: false, error: "Verified companies only." };
  const parsed = postingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the form and try again." };

  await db.posting.create({
    data: {
      companyId: gate.profile.id,
      title: parsed.data.title,
      departments: parsed.data.departments,
      location: parsed.data.location,
      durationMonths: parsed.data.durationMonths,
      skillsRequired: parsed.data.skillsRequired,
      customQuestions: parsed.data.customQuestions,
      isQuickPost: parsed.data.isQuickPost,
      status: "active",
    },
  });
  revalidatePath("/company/postings");
  return { ok: true };
}

export async function updatePostingAction(
  input: PostingInput & { id: string }
): Promise<ActionResult> {
  const gate = await requireVerifiedCompany();
  if (!gate) return { ok: false, error: "Verified companies only." };
  const parsed = postingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the form and try again." };

  const posting = await db.posting.findUnique({ where: { id: input.id } });
  if (!posting || posting.companyId !== gate.profile.id) {
    return { ok: false, error: "Posting not found." };
  }
  await db.posting.update({
    where: { id: input.id },
    data: {
      title: parsed.data.title,
      departments: parsed.data.departments,
      location: parsed.data.location,
      durationMonths: parsed.data.durationMonths,
      skillsRequired: parsed.data.skillsRequired,
      customQuestions: parsed.data.customQuestions,
    },
  });
  revalidatePath("/company/postings");
  return { ok: true };
}

export async function setPostingStatusAction(input: {
  id: string;
  status: "active" | "closed" | "suspended";
}): Promise<ActionResult> {
  const me = await getSessionUser();
  if (!me) return { ok: false, error: "Log in first." };
  const parsed = z
    .object({ id: z.string().min(1), status: z.enum(["active", "closed", "suspended"]) })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const posting = await db.posting.findUnique({
    where: { id: parsed.data.id },
    include: { company: true },
  });
  if (!posting) return { ok: false, error: "Posting not found." };

  const isOwner = me.role === "company" && posting.company.userId === me.id;
  const isAdmin = me.role === "admin";
  if (!isOwner && !isAdmin) return { ok: false, error: "Not allowed." };
  // Owners can only open/close their own; only you (admin) can suspend.
  if (!isAdmin && parsed.data.status === "suspended") {
    return { ok: false, error: "Only the admin can suspend." };
  }
  await db.posting.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });
  revalidatePath("/company/postings");
  revalidatePath("/admin/postings");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Applications (Phase 4 student side) — max 5 active per student.
// Active = applied + shortlisted. Withdrawn/rejected free the slot.
// ---------------------------------------------------------------------------
const applySchema = z.object({
  postingId: z.string().min(1),
  answers: z.array(z.string().trim().max(2000)).max(10),
});

export async function applyAction(input: {
  postingId: string;
  answers: string[];
}): Promise<ActionResult> {
  const me = await getSessionUser();
  if (!me || me.role !== "student") return { ok: false, error: "Students only." };
  if (me.status !== "verified") {
    return { ok: false, error: "Get verified before applying." };
  }
  const parsed = applySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check your answers and try again." };

  const posting = await db.posting.findUnique({
    where: { id: parsed.data.postingId },
    include: { company: { include: { user: true } } },
  });
  if (
    !posting ||
    posting.status !== "active" ||
    posting.company.verificationStatus !== "verified" ||
    posting.company.user.status !== "verified"
  ) {
    return { ok: false, error: "This opening is no longer accepting applications." };
  }

  const mine = await db.application.findMany({
    where: {
      studentId: me.id,
      status: { in: ["applied", "shortlisted"] },
    },
    select: { id: true, postingId: true },
  });
  if (mine.some((a) => a.postingId === posting.id)) {
    return { ok: false, error: "You already applied to this opening." };
  }
  if (mine.length >= 5) {
    return {
      ok: false,
      error: "You have 5 active applications (the max). Withdraw one to free a slot.",
    };
  }

  const questions = Array.isArray(posting.customQuestions)
    ? (posting.customQuestions as string[])
    : [];
  const paired = questions.map((q, i) => ({
    question: q,
    answer: parsed.data.answers[i] ?? "",
  }));

  const application = await db.application.create({
    data: {
      postingId: posting.id,
      studentId: me.id,
      answers: paired,
      status: "applied",
    },
  });

  // Tell the company (shown in their inbox in Phase 6).
  await db.notification.create({
    data: {
      userId: posting.company.userId,
      type: "new_application",
      title: `New application: ${posting.title}`,
      body: `${me.name} just applied.`,
    },
  });

  revalidatePath("/applications");
  revalidatePath(`/openings/${posting.id}`);
  return { ok: true };
}

export async function withdrawAction(input: {
  applicationId: string;
}): Promise<ActionResult> {
  const me = await getSessionUser();
  if (!me || me.role !== "student") return { ok: false, error: "Students only." };

  const app = await db.application.findUnique({
    where: { id: input.applicationId },
  });
  if (!app || app.studentId !== me.id) {
    return { ok: false, error: "Application not found." };
  }
  if (app.status !== "applied" && app.status !== "shortlisted") {
    return { ok: false, error: "Only pending applications can be withdrawn." };
  }
  await db.application.update({
    where: { id: app.id },
    data: { status: "withdrawn" },
  });
  revalidatePath("/applications");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Company review (Phase 5) — shortlist / accept / reject + mark complete.
// Every change notifies the student.
// ---------------------------------------------------------------------------
const reviewAppSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum(["shortlisted", "accepted", "rejected"]),
});

async function ownApplication(
  meId: string,
  applicationId: string,
  adminOk: boolean
) {
  const app = await db.application.findUnique({
    where: { id: applicationId },
    include: { posting: { include: { company: true } }, student: true },
  });
  if (!app) return null;
  if (adminOk) return app;
  if (app.posting.company.userId !== meId) return null;
  return app;
}

export async function setApplicationStatusAction(input: {
  applicationId: string;
  status: "shortlisted" | "accepted" | "rejected";
}): Promise<ActionResult> {
  const me = await getSessionUser();
  if (!me || (me.role !== "company" && me.role !== "admin")) {
    return { ok: false, error: "Companies only." };
  }
  const parsed = reviewAppSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const app = await ownApplication(me.id, parsed.data.applicationId, me.role === "admin");
  if (!app) return { ok: false, error: "Application not found." };
  if (app.status === "withdrawn") {
    return { ok: false, error: "Student withdrew this application." };
  }

  await db.application.update({
    where: { id: app.id },
    data: { status: parsed.data.status },
  });
  const label =
    parsed.data.status === "shortlisted"
      ? "Shortlisted"
      : parsed.data.status === "accepted"
        ? "Accepted"
        : "Rejected";
  await db.notification.create({
    data: {
      userId: app.studentId,
      type: "status_change",
      title: `${label}: ${app.posting.title}`,
      body: `${app.posting.company.companyName} ${parsed.data.status === "rejected" ? "rejected your application." : `moved you to ${label}. Watch your email/phone — interviews happen off-app.`}`,
    },
  });
  revalidatePath(`/company/postings/${app.postingId}/applicants`);
  revalidatePath("/applications");
  return { ok: true };
}

export async function completePlacementAction(input: {
  applicationId: string;
}): Promise<ActionResult> {
  const me = await getSessionUser();
  if (!me || me.role !== "company") return { ok: false, error: "Companies only." };

  const app = await ownApplication(me.id, input.applicationId, false);
  if (!app) return { ok: false, error: "Application not found." };
  if (app.status !== "accepted") {
    return { ok: false, error: "Only accepted placements can be completed." };
  }
  await db.application.update({
    where: { id: app.id },
    data: { placementComplete: true },
  });
  await db.notification.create({
    data: {
      userId: app.studentId,
      type: "placement_complete",
      title: `Placement complete: ${app.posting.title}`,
      body: "Please rate your experience with this company.",
    },
  });
  revalidatePath(`/company/postings/${app.postingId}/applicants`);
  revalidatePath("/applications");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Ratings (Phase 6) — one per person per placement, only when complete.
// ---------------------------------------------------------------------------
const rateSchema = z.object({
  applicationId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export async function rateAction(input: {
  applicationId: string;
  score: number;
  comment?: string;
}): Promise<ActionResult> {
  const me = await getSessionUser();
  if (!me) return { ok: false, error: "Log in first." };
  const parsed = rateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Score must be 1–5." };

  const app = await db.application.findUnique({
    where: { id: parsed.data.applicationId },
    include: { posting: { include: { company: true } } },
  });
  if (!app || !app.placementComplete) {
    return { ok: false, error: "Ratings open after the placement is marked complete." };
  }
  const isStudent = me.role === "student" && app.studentId === me.id;
  const isCompany = me.role === "company" && app.posting.company.userId === me.id;
  if (!isStudent && !isCompany) return { ok: false, error: "Not your placement." };

  const toId = isStudent ? app.posting.company.userId : app.studentId;
  const dupe = await db.rating.findUnique({
    where: {
      fromId_toId_applicationId: { fromId: me.id, toId, applicationId: app.id },
    },
  });
  if (dupe) return { ok: false, error: "You already rated this placement." };

  await db.rating.create({
    data: {
      fromId: me.id,
      toId,
      applicationId: app.id,
      score: parsed.data.score,
      comment: parsed.data.comment?.trim() || null,
    },
  });
  await db.notification.create({
    data: {
      userId: toId,
      type: "new_rating",
      title: `New ${parsed.data.score}/5 rating`,
      body: `${me.name} rated placement "${app.posting.title}".`,
    },
  });
  revalidatePath("/applications");
  revalidatePath(`/company/postings/${app.postingId}/applicants`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Reports (Phase 6) — anyone logged in can file; you resolve within 48h.
// ---------------------------------------------------------------------------
const REPORT_REASONS = [
  "Scam / fake opening",
  "Asks for payment",
  "Ghosted after shortlist",
  "Unsafe workplace",
  "Other",
] as [string, ...string[]];

const reportSchema = z.object({
  companyId: z.string().min(1),
  postingId: z.string().min(1).optional(),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(1000).optional(),
});

export async function reportCompanyAction(input: {
  companyId: string;
  postingId?: string;
  reason: string;
  details?: string;
}): Promise<ActionResult> {
  const me = await getSessionUser();
  if (!me) return { ok: false, error: "Log in first." };
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Pick a valid reason." };

  const company = await db.companyProfile.findUnique({
    where: { id: parsed.data.companyId },
  });
  if (!company) return { ok: false, error: "Company not found." };

  const report = await db.report.create({
    data: {
      reporterId: me.id,
      companyId: company.id,
      reason: parsed.data.reason,
      details: parsed.data.details?.trim() || null,
      status: "open",
    },
  });

  // Acknowledgment to the reporter (instant).
  await db.notification.create({
    data: {
      userId: me.id,
      type: "report_ack",
      title: "Report received",
      body: `Report #${report.id.slice(-6)} is under review (48h SLA).`,
    },
  });
  // Alert to you (admin).
  const admins = await db.user.findMany({
    where: { role: "admin" },
    select: { id: true },
  });
  await db.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type: "new_report",
      title: `New report: ${company.companyName}`,
      body: `${parsed.data.reason} — reported by ${me.name}.`,
    })),
  });
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function resolveReportAction(input: {
  reportId: string;
  outcome: "resolved" | "dismissed";
  suspendCompany: boolean;
}): Promise<ActionResult> {
  const me = await getSessionUser();
  if (!me || me.role !== "admin") return { ok: false, error: "Admin only." };
  const parsed = z
    .object({
      reportId: z.string().min(1),
      outcome: z.enum(["resolved", "dismissed"]),
      suspendCompany: z.boolean(),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const report = await db.report.findUnique({
    where: { id: parsed.data.reportId },
    include: { reporter: true },
  });
  if (!report) return { ok: false, error: "Report not found." };

  await db.report.update({
    where: { id: report.id },
    data: { status: parsed.data.outcome, resolvedAt: new Date() },
  });

  if (parsed.data.suspendCompany) {
    const company = await db.companyProfile.findUnique({
      where: { id: report.companyId },
    });
    if (company) {
      await db.user.update({
        where: { id: company.userId },
        data: { status: "suspended" },
      });
      await db.posting.updateMany({
        where: { companyId: company.id, status: "active" },
        data: { status: "suspended" },
      });
    }
  }

  await db.notification.create({
    data: {
      userId: report.reporterId,
      type: "report_resolved",
      title: `Report ${parsed.data.outcome}`,
      body:
        parsed.data.outcome === "resolved"
          ? "Thanks — action was taken on your report."
          : "After review, no violation was found. Thanks for reporting.",
    },
  });
  revalidatePath("/admin/reports");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Notifications inbox (Phase 6)
// ---------------------------------------------------------------------------
export async function markNotificationsReadAction(): Promise<ActionResult> {
  const me = await getSessionUser();
  if (!me) return { ok: false, error: "Log in first." };
  await db.notification.updateMany({
    where: { userId: me.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
  return { ok: true };
}

export { REPORT_REASONS };
