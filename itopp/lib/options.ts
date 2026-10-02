// Single source of truth for dropdown options (forms + server validation).
// Departments = courses approved for SIWES / industrial training
// (engineering, sciences & technology, computing, agriculture,
// environmental, allied health). Existing names are unchanged so saved
// profiles and postings keep matching.
export const DEPARTMENTS: [string, ...string[]] = [
  // Computing & ICT
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Computer Engineering",
  "Cybersecurity",
  "Data Science",
  "Information Systems",
  // Engineering
  "Agricultural Engineering",
  "Chemical Engineering",
  "Civil Engineering",
  "Electrical/Electronics Engineering",
  "Mechanical Engineering",
  "Mechatronics Engineering",
  "Petroleum Engineering",
  "Metallurgical & Materials Engineering",
  // Sciences & technology
  "Biochemistry",
  "Biology",
  "Botany",
  "Chemistry",
  "Geology",
  "Industrial Chemistry",
  "Mathematics",
  "Microbiology",
  "Physics",
  "Science Laboratory Technology",
  "Statistics",
  "Zoology",
  // Agriculture
  "Agricultural Science",
  "Animal Science",
  "Crop Science",
  "Fisheries & Aquaculture",
  "Food Science & Technology",
  "Forestry & Wildlife",
  "Soil Science",
  // Environmental
  "Architecture",
  "Building Technology",
  "Estate Management",
  "Quantity Surveying",
  "Surveying & Geoinformatics",
  "Urban & Regional Planning",
  // Allied health
  "Medical Laboratory Science",
];

export const LEVELS: [string, ...string[]] = ["400 Level", "500 Level"];
