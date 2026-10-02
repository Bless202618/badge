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
