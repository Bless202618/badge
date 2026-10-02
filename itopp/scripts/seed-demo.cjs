// Pilot demo seeder — safe to re-run (upserts by email/title).
// Usage: npm run db:seed   (needs DATABASE_URL in .env)
// Demo logins (change these passwords after the pilot!):
//   company@demo.ng / Demo1234!   (verified company)
//   student@demo.ng / Demo1234!   (verified student)
const { scrypt, randomBytes } = require("node:crypto");
const { promisify } = require("node:util");
const scryptAsync = promisify(scrypt);
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function hash(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${salt}:${buf.toString("hex")}`;
}

async function main() {
  const passwordHash = await hash("Demo1234!");

  const companyUser = await db.user.upsert({
    where: { email: "company@demo.ng" },
    create: {
      name: "Lagos Tech Hub",
      email: "company@demo.ng",
      passwordHash,
      role: "company",
      status: "verified",
    },
    update: { status: "verified", role: "company" },
  });

  const company = await db.companyProfile.upsert({
    where: { userId: companyUser.id },
    create: {
      userId: companyUser.id,
      companyName: "Lagos Tech Hub",
      cacNumber: "RC987654",
      contactName: "Ada Nwosu",
      phone: "0805 123 4567",
      website: "https://lagostechhub.example.ng",
      docName: "cac-demo.pdf",
      verificationStatus: "verified",
    },
    update: { verificationStatus: "verified" },
  });

  const postings = [
    {
      title: "Frontend Intern",
      departments: ["Computer Science", "Software Engineering"],
      location: "Lagos (Hybrid)",
      durationMonths: 6,
      skillsRequired: ["React", "Git", "CSS"],
      customQuestions: [
        "Link to something you built (GitHub, live site, or screenshots)",
        "What days of the week can you be on-site?",
      ],
      isQuickPost: false,
    },
    {
      title: "Backend Intern",
      departments: ["Computer Science", "Information Technology"],
      location: "Remote",
      durationMonths: 6,
      skillsRequired: [],
      customQuestions: [],
      isQuickPost: true,
    },
  ];

  for (const p of postings) {
    const exists = await db.posting.findFirst({
      where: { companyId: company.id, title: p.title, status: "active" },
    });
    if (!exists) {
      await db.posting.create({ data: { ...p, companyId: company.id } });
      console.log("Created posting:", p.title);
    } else {
      console.log("Posting exists:", p.title);
    }
  }

  const studentUser = await db.user.upsert({
    where: { email: "student@demo.ng" },
    create: {
      name: "Demo Student",
      email: "student@demo.ng",
      passwordHash,
      role: "student",
      status: "verified",
    },
    update: { status: "verified", role: "student" },
  });

  await db.studentProfile.upsert({
    where: { userId: studentUser.id },
    create: {
      userId: studentUser.id,
      name: "Demo Student",
      department: "Computer Science",
      level: "400 Level",
      cgpa: 4.0,
      skills: ["React", "Git", "SQL"],
      cvName: "demo-cv.pdf",
      idDocName: "demo-id.jpg",
      verificationStatus: "verified",
    },
    update: { verificationStatus: "verified" },
  });

  console.log("SEED DONE — log in with the demo accounts above.");
}

main()
  .catch((e) => {
    console.error("SEED FAIL:" + e.message);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
