"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Role = "student" | "company" | "admin";
export type VerificationState = "pending" | "verified" | "rejected";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: VerificationState;
}

export interface StudentProfile {
  userId: string;
  name: string;
  department: string;
  level: string;
  cgpa: number;
  skills: string[];
  cvName: string;
  idDocName: string;
  verificationStatus: VerificationState;
  reviewReason?: string;
}

export interface CompanyProfile {
  userId: string;
  companyName: string;
  cacNumber: string;
  contactName: string;
  phone: string;
  website: string;
  docName: string;
  verificationStatus: VerificationState;
  reviewReason?: string;
}

interface StoreData {
  users: MockUser[];
  studentProfiles: StudentProfile[];
  companyProfiles: CompanyProfile[];
  sessionUserId: string | null;
}

// ---------------------------------------------------------------------------
// Demo seed: you (admin) + one student + one company waiting for approval,
// so the approval queue has something to show on first run.
// ---------------------------------------------------------------------------
function seed(): StoreData {
  return {
    users: [
      {
        id: "admin-1",
        name: "Platform Owner",
        email: "admin@itopp.ng",
        role: "admin",
        status: "verified",
      },
      {
        id: "student-1",
        name: "Adaeze Okafor",
        email: "adaeze@student.edu",
        role: "student",
        status: "pending",
      },
      {
        id: "company-1",
        name: "TechCorp Ltd",
        email: "hello@techcorp.ng",
        role: "company",
        status: "pending",
      },
    ],
    studentProfiles: [
      {
        userId: "student-1",
        name: "Adaeze Okafor",
        department: "Computer Science",
        level: "400 Level",
        cgpa: 4.2,
        skills: ["React", "Git", "SQL"],
        cvName: "adaeze-cv.pdf",
        idDocName: "school-id.jpg",
        verificationStatus: "pending",
      },
    ],
    companyProfiles: [
      {
        userId: "company-1",
        companyName: "TechCorp Ltd",
        cacNumber: "RC123456",
        contactName: "Tunde Bello",
        phone: "0803 000 0000",
        website: "https://techcorp.ng",
        docName: "cac-certificate.pdf",
        verificationStatus: "pending",
      },
    ],
    sessionUserId: null,
  };
}

const KEY = "itopp_mock_store_v1";

function load(): StoreData {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as StoreData;
  } catch {
    // corrupted storage → reseed below
  }
  const fresh = seed();
  try {
    window.localStorage.setItem(KEY, JSON.stringify(fresh));
  } catch {
    // private mode → keep in memory only
  }
  return fresh;
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e6
  )}`;
}

interface StoreApi {
  data: StoreData;
  currentUser: MockUser | null;
  currentStudentProfile: StudentProfile | null;
  currentCompanyProfile: CompanyProfile | null;
  signup: (name: string, email: string, role: Role) => string;
  login: (email: string) => string | null;
  logout: () => void;
  saveStudentProfile: (p: Omit<StudentProfile, "verificationStatus" | "reviewReason">) => void;
  saveCompanyProfile: (p: Omit<CompanyProfile, "verificationStatus" | "reviewReason">) => void;
  reviewStudent: (
    userId: string,
    decision: "verified" | "rejected",
    reason?: string
  ) => void;
  reviewCompany: (
    userId: string,
    decision: "verified" | "rejected",
    reason?: string
  ) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>(() =>
    typeof window === "undefined" ? seed() : load()
  );

  function persist(next: StoreData) {
    setData(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore (private mode)
    }
  }

  const api: StoreApi = {
    data,
    currentUser: data.users.find((u) => u.id === data.sessionUserId) ?? null,
    currentStudentProfile:
      data.studentProfiles.find((p) => p.userId === data.sessionUserId) ??
      null,
    currentCompanyProfile:
      data.companyProfiles.find((p) => p.userId === data.sessionUserId) ??
      null,

    signup: (name, email, role) => {
      const clean = email.trim().toLowerCase();
      if (data.users.some((u) => u.email.toLowerCase() === clean)) {
        throw new Error("An account with this email already exists.");
      }
      const id = uid(role);
      const next: StoreData = {
        ...data,
        users: [
          ...data.users,
          { id, name: name.trim(), email: clean, role, status: "pending" },
        ],
        sessionUserId: id,
      };
      persist(next);
      return id;
    },

    login: (email) => {
      const clean = email.trim().toLowerCase();
      const user = data.users.find((u) => u.email.toLowerCase() === clean);
      if (!user) return null;
      persist({ ...data, sessionUserId: user.id });
      return user.id;
    },

    logout: () => persist({ ...data, sessionUserId: null }),

    saveStudentProfile: (p) => {
      const profile: StudentProfile = {
        ...p,
        verificationStatus: "pending",
      };
      const profiles = data.studentProfiles.some(
        (x) => x.userId === p.userId
      )
        ? data.studentProfiles.map((x) => (x.userId === p.userId ? profile : x))
        : [...data.studentProfiles, profile];
      persist({
        ...data,
        studentProfiles: profiles,
        users: data.users.map((u) =>
          u.id === p.userId ? { ...u, status: "pending" as const } : u
        ),
      });
    },

    saveCompanyProfile: (p) => {
      const profile: CompanyProfile = {
        ...p,
        verificationStatus: "pending",
      };
      const profiles = data.companyProfiles.some(
        (x) => x.userId === p.userId
      )
        ? data.companyProfiles.map((x) => (x.userId === p.userId ? profile : x))
        : [...data.companyProfiles, profile];
      persist({
        ...data,
        companyProfiles: profiles,
        users: data.users.map((u) =>
          u.id === p.userId ? { ...u, status: "pending" as const } : u
        ),
      });
    },

    reviewStudent: (userId, decision, reason) => {
      persist({
        ...data,
        studentProfiles: data.studentProfiles.map((p) =>
          p.userId === userId
            ? {
                ...p,
                verificationStatus: decision,
                reviewReason: decision === "rejected" ? reason ?? "" : undefined,
              }
            : p
        ),
        users: data.users.map((u) =>
          u.id === userId ? { ...u, status: decision } : u
        ),
      });
    },

    reviewCompany: (userId, decision, reason) => {
      persist({
        ...data,
        companyProfiles: data.companyProfiles.map((p) =>
          p.userId === userId
            ? {
                ...p,
                verificationStatus: decision,
                reviewReason: decision === "rejected" ? reason ?? "" : undefined,
              }
            : p
        ),
        users: data.users.map((u) =>
          u.id === userId ? { ...u, status: decision } : u
        ),
      });
    },
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

export const DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Computer Engineering",
];

export const LEVELS = ["400 Level", "500 Level"];
