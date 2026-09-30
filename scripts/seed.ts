import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dns from "dns";
import User from "../src/models/User";
import Faculty from "../src/models/Faculty";
import Achievement from "../src/models/Achievement";
import GalleryAlbum from "../src/models/GalleryAlbum";
import GalleryImage from "../src/models/GalleryImage";
import Notice from "../src/models/Notice";
import SiteSettings from "../src/models/SiteSettings";

// Some Windows/network DNS setups fail SRV lookups for mongodb+srv
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // ignore
}
/** Load KEY=VALUE pairs from a .env-style file into process.env (no overwrite). */
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function seed() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  loadEnvFile(path.resolve(process.cwd(), ".env"));

  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/department-cms";
  const SUPER_EMAIL =
    process.env.SEED_SUPER_ADMIN_EMAIL || "superadmin@university.edu";
  const SUPER_PASS =
    process.env.SEED_SUPER_ADMIN_PASSWORD || "SuperAdmin@123";
  const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@university.edu";
  const ADMIN_PASS = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

  console.log("Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.\n");

  // --- Site Settings ---
  await SiteSettings.findOneAndUpdate(
    {},
    {
      universityName: "State University of Technology",
      departmentName: "Department of Computer Science & Engineering",
      departmentLogoUrl:
        "https://ui-avatars.com/api/?name=CSE&background=0D47A1&color=fff&size=200",
      universityLogoUrl:
        "https://ui-avatars.com/api/?name=SUT&background=1565C0&color=fff&size=200",
      departmentDescription:
        "The Department of Computer Science & Engineering offers world-class education and research opportunities in computing, artificial intelligence, and software engineering.",
      welcomeMessage:
        "Welcome to the Department of Computer Science & Engineering. We nurture innovators and leaders of tomorrow.",
      hodName: "Prof. Dr. Ananya Sharma",
      hodDesignation: "Head of Department",
      hodPhotoUrl:
        "https://ui-avatars.com/api/?name=Ananya+Sharma&background=1B5E20&color=fff&size=300",
      hodMessage:
        "Our department is committed to academic excellence, cutting-edge research, and preparing students for impactful careers in technology. We invite you to explore our programs, faculty, and vibrant campus life.",
      aboutHistory:
        "Established in 1998, the Department of CSE has grown into one of the leading computing departments in the region, with over 1200 students and a strong alumni network across the globe.",
      vision:
        "To be a globally recognized center of excellence in computer science education and research.",
      mission:
        "To provide quality education, foster innovation, and develop ethical computing professionals who contribute to society.",
      objectives: [
        "Deliver rigorous undergraduate and postgraduate curricula",
        "Promote research in emerging areas of computing",
        "Build industry partnerships for placements and internships",
        "Encourage entrepreneurship and innovation among students",
        "Uphold values of integrity, inclusion, and lifelong learning",
      ],
      address: "Block C, Tech Campus, University Road, City – 560001",
      email: "cse@university.edu",
      phone: "+91-80-1234-5678",
      officeHours: "Mon–Fri, 9:00 AM – 5:00 PM",
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d77.6!3d12.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1",
      socialLinks: {
        facebook: "https://facebook.com/universitycse",
        twitter: "https://twitter.com/universitycse",
        linkedin: "https://linkedin.com/school/universitycse",
        youtube: "https://youtube.com/@universitycse",
        instagram: "https://instagram.com/universitycse",
      },
      notesPortalUrl: "https://notes.university.edu/cse",
      questionPaperPortalUrl: "https://papers.university.edu/cse",
      heroTitle: "Shape the Future of Computing",
      heroSubtitle:
        "Excellence in education, research, and innovation at the Department of CSE.",
      heroImageUrl:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=80",
      stats: {
        students: 1200,
        faculty: 45,
        achievements: 180,
        placements: 95,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("✓ SiteSettings upserted");

  // --- Users (always reset seed passwords so login stays reliable) ---
  let superAdmin = await User.findOne({ email: SUPER_EMAIL.toLowerCase() });
  if (!superAdmin) {
    superAdmin = await User.create({
      name: "Super Admin",
      email: SUPER_EMAIL,
      password: SUPER_PASS,
      role: "super_admin",
      isActive: true,
    });
    console.log("✓ Super admin created:", SUPER_EMAIL);
  } else {
    superAdmin.password = SUPER_PASS;
    superAdmin.isActive = true;
    superAdmin.role = "super_admin";
    await superAdmin.save();
    console.log("✓ Super admin password reset:", SUPER_EMAIL);
  }

  let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (!admin) {
    admin = await User.create({
      name: "Department Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
      role: "admin",
      isActive: true,
    });
    console.log("✓ Admin created:", ADMIN_EMAIL);
  } else {
    admin.password = ADMIN_PASS;
    admin.isActive = true;
    admin.role = "admin";
    await admin.save();
    console.log("✓ Admin password reset:", ADMIN_EMAIL);
  }

  // --- Faculty ---
  const facultyCount = await Faculty.countDocuments();
  if (facultyCount < 4) {
    await Faculty.deleteMany({});
    await Faculty.insertMany([
      {
        name: "Prof. Dr. Ananya Sharma",
        designation: "Professor & Head",
        qualification: "Ph.D. (Computer Science), IIT Delhi",
        email: "ananya.sharma@university.edu",
        phone: "+91-80-1234-5601",
        photoUrl:
          "https://ui-avatars.com/api/?name=Ananya+Sharma&background=1B5E20&color=fff&size=300",
        researchInterests: ["Machine Learning", "Computer Vision", "AI Ethics"],
        bio: "Prof. Sharma leads the department with 20+ years of research experience in machine learning and computer vision. She has published over 80 papers in top-tier venues.",
        isFeatured: true,
        order: 1,
        isActive: true,
      },
      {
        name: "Dr. Rajesh Kumar",
        designation: "Associate Professor",
        qualification: "Ph.D. (Systems), IISc Bangalore",
        email: "rajesh.kumar@university.edu",
        phone: "+91-80-1234-5602",
        photoUrl:
          "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=0D47A1&color=fff&size=300",
        researchInterests: [
          "Distributed Systems",
          "Cloud Computing",
          "Networking",
        ],
        bio: "Dr. Kumar specializes in large-scale distributed systems and cloud infrastructure. He mentors the Systems Research Lab.",
        isFeatured: true,
        order: 2,
        isActive: true,
      },
      {
        name: "Dr. Priya Menon",
        designation: "Assistant Professor",
        qualification: "Ph.D. (HCI), Carnegie Mellon University",
        email: "priya.menon@university.edu",
        photoUrl:
          "https://ui-avatars.com/api/?name=Priya+Menon&background=6A1B9A&color=fff&size=300",
        researchInterests: [
          "Human-Computer Interaction",
          "Accessibility",
          "UX Design",
        ],
        bio: "Dr. Menon researches inclusive design and accessibility technologies. She co-founded the campus UX studio.",
        isFeatured: true,
        order: 3,
        isActive: true,
      },
      {
        name: "Dr. Vikram Patel",
        designation: "Assistant Professor",
        qualification: "Ph.D. (Cybersecurity), NIT Trichy",
        email: "vikram.patel@university.edu",
        phone: "+91-80-1234-5604",
        photoUrl:
          "https://ui-avatars.com/api/?name=Vikram+Patel&background=B71C1C&color=fff&size=300",
        researchInterests: [
          "Cybersecurity",
          "Cryptography",
          "Blockchain",
        ],
        bio: "Dr. Patel works on applied cryptography and secure systems. He advises the university Capture-The-Flag team.",
        isFeatured: false,
        order: 4,
        isActive: true,
      },
      {
        name: "Prof. Meera Iyer",
        designation: "Professor",
        qualification: "Ph.D. (Algorithms), Stanford University",
        email: "meera.iyer@university.edu",
        photoUrl:
          "https://ui-avatars.com/api/?name=Meera+Iyer&background=E65100&color=fff&size=300",
        researchInterests: [
          "Algorithms",
          "Computational Complexity",
          "Graph Theory",
        ],
        bio: "Prof. Iyer is a renowned theorist with contributions to approximation algorithms and combinatorial optimization.",
        isFeatured: true,
        order: 5,
        isActive: true,
      },
    ]);
    console.log("✓ Faculty seeded (5)");
  } else {
    console.log("• Faculty already seeded");
  }

  // --- Achievements ---
  const achievementCount = await Achievement.countDocuments();
  if (achievementCount < 6) {
    await Achievement.deleteMany({});
    await Achievement.insertMany([
      {
        title: "Best Paper Award at ICML 2025",
        description:
          "Faculty team led by Prof. Sharma received the Best Paper Award for research on efficient vision transformers.",
        date: new Date("2025-07-15"),
        category: "faculty",
        year: 2025,
        imageUrl:
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
      },
      {
        title: "National Hackathon Champions",
        description:
          "CSE students won first place at the National Smart India Hackathon with an AI-powered healthcare solution.",
        date: new Date("2025-03-20"),
        category: "student",
        year: 2025,
        imageUrl:
          "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      },
      {
        title: "NBA Accreditation Renewal",
        description:
          "The department successfully renewed NBA accreditation for its B.Tech program for the next 6 years.",
        date: new Date("2024-11-10"),
        category: "department",
        year: 2024,
      },
      {
        title: "Google Summer of Code Mentorship",
        description:
          "Three faculty members mentored GSoC projects; eight students were selected as contributors.",
        date: new Date("2024-08-01"),
        category: "faculty",
        year: 2024,
      },
      {
        title: "Inter-University Coding League Winners",
        description:
          "Our competitive programming team secured gold at the Inter-University Coding League finals.",
        date: new Date("2024-02-28"),
        category: "student",
        year: 2024,
        certificateUrl: "https://example.com/certificates/coding-league-2024.pdf",
      },
      {
        title: "MoU with Leading Tech Companies",
        description:
          "Department signed MoUs with three Fortune 500 tech companies for internships and collaborative research.",
        date: new Date("2023-12-05"),
        category: "department",
        year: 2023,
      },
      {
        title: "IEEE Outstanding Student Branch",
        description:
          "The IEEE student branch received the Outstanding Branch Award for community outreach and technical events.",
        date: new Date("2023-09-18"),
        category: "student",
        year: 2023,
      },
    ]);
    console.log("✓ Achievements seeded (7)");
  } else {
    console.log("• Achievements already seeded");
  }

  // --- Gallery ---
  const albumCount = await GalleryAlbum.countDocuments();
  if (albumCount < 2) {
    await GalleryImage.deleteMany({});
    await GalleryAlbum.deleteMany({});

    const [album1, album2, album3] = await GalleryAlbum.insertMany([
      {
        title: "TechFest 2025",
        description: "Highlights from the annual department tech festival.",
        year: 2025,
        coverImageUrl:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      },
      {
        title: "Graduation Ceremony 2024",
        description: "Proud moments from the Class of 2024 convocation.",
        year: 2024,
        coverImageUrl:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
      },
      {
        title: "Campus Life",
        description: "Everyday moments around labs, classrooms, and events.",
        year: 2024,
        coverImageUrl:
          "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
      },
    ]);

    await GalleryImage.insertMany([
      {
        album: album1._id,
        title: "Keynote session",
        imageUrl:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
        year: 2025,
      },
      {
        album: album1._id,
        title: "Hackathon floor",
        imageUrl:
          "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
        year: 2025,
      },
      {
        album: album1._id,
        title: "Project expo",
        imageUrl:
          "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&q=80",
        year: 2025,
      },
      {
        album: album2._id,
        title: "Graduates",
        imageUrl:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",
        year: 2024,
      },
      {
        album: album2._id,
        title: "Faculty with graduates",
        imageUrl:
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80",
        year: 2024,
      },
      {
        album: album3._id,
        title: "Main building",
        imageUrl:
          "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
        year: 2024,
      },
      {
        album: album3._id,
        title: "Computer lab",
        imageUrl:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
        year: 2024,
      },
    ]);
    console.log("✓ Gallery albums (3) and images (7) seeded");
  } else {
    console.log("• Gallery already seeded");
  }

  // --- Notices ---
  const noticeCount = await Notice.countDocuments();
  if (noticeCount < 4) {
    await Notice.deleteMany({});
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    await Notice.insertMany([
      {
        title: "Odd Semester Registration Open",
        content:
          "Registration for the Odd Semester is now open. Students must complete course registration through the academic portal by the deadline. Late registrations will incur a fine.",
        isImportant: true,
        publishedAt: now,
        expiresAt: nextMonth,
        isActive: true,
      },
      {
        title: "Guest Lecture: Generative AI in Industry",
        content:
          "Join us for a guest lecture by industry experts on Generative AI applications. Venue: Seminar Hall A. Date and time will be announced on the department notice board.",
        isImportant: false,
        publishedAt: now,
        expiresAt: nextYear,
        isActive: true,
      },
      {
        title: "Mid-Semester Examination Schedule",
        content:
          "The mid-semester examination schedule has been published. Students are advised to check the academic calendar and report any clashes to the examination cell within 3 working days.",
        isImportant: true,
        publishedAt: now,
        isActive: true,
        pdfUrl: "https://example.com/notices/mid-sem-schedule.pdf",
      },
      {
        title: "Call for Research Internship Applications",
        content:
          "Faculty labs are accepting applications for summer research internships. Eligible students (2nd year and above) may apply with a CV and statement of interest via the department portal.",
        isImportant: false,
        publishedAt: now,
        expiresAt: nextYear,
        isActive: true,
      },
      {
        title: "Library Extended Hours During Exams",
        content:
          "The central library will remain open until 11:00 PM during the examination period. ID cards are mandatory for entry after 8:00 PM.",
        isImportant: false,
        publishedAt: now,
        isActive: true,
      },
    ]);
    console.log("✓ Notices seeded (5)");
  } else {
    console.log("• Notices already seeded");
  }

  console.log("\n========================================");
  console.log("Seed completed successfully!");
  console.log("========================================");
  console.log("Credentials:");
  console.log(`  Super Admin: ${SUPER_EMAIL} / ${SUPER_PASS}`);
  console.log(`  Admin:       ${ADMIN_EMAIL} / ${ADMIN_PASS}`);
  console.log("========================================\n");

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
