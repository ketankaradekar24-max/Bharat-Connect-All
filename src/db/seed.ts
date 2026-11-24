import { count } from 'drizzle-orm';
import { db } from './index.ts';
import { scholarships } from './schema.ts';

export const VERIFIED_PORTAL_SEEDS = [
  {
    slug: 'karnataka-ssp-post-matric-scholarship',
    title: 'Karnataka State Scholarship Portal (SSP) — Post-Matric Scholarship',
    providerName: 'Government of Karnataka (Social Welfare, Backward Classes, Tribal & Minority Departments)',
    providerType: 'Government - State',
    department: 'Department of Backward Classes / Social Welfare / Minorities / Tribal Welfare',
    category: 'State',
    state: 'Karnataka',
    district: null,
    educationLevels: ['PUC', 'Diploma', 'Undergraduate', 'Postgraduate', 'Professional'],
    eligibleCourses: ['All'],
    minMarksPercentage: null,
    maxFamilyIncome: 250000,
    eligibleCategories: ['SC', 'ST', 'OBC', 'Minority'],
    requiresDisability: false,
    summary:
      'Unified Karnataka state portal for post-matric tuition fee reimbursement and maintenance support for eligible domicile students studying beyond Class 10.',
    overview:
      'The State Scholarship Portal (SSP) of Karnataka brings post-matric scholarships from multiple state welfare departments onto one application portal. Eligibility rules, family income ceilings, and benefit components vary slightly depending on the student category and department.',
    whoCanApply:
      'Domicile students of Karnataka enrolled in recognized PUC, Diploma, ITI, Undergraduate, Postgraduate, or Professional courses.',
    eligibilityDetails:
      'Must be a permanent resident of Karnataka studying in a recognized institution. Family annual income limits apply by department (commonly up to INR 1,00,000 to INR 2,50,000 depending on category and scheme).',
    benefitsSummary:
      'Fee concession / reimbursement and maintenance allowance as notified by the respective Karnataka welfare department.',
    requiredDocuments: [
      'SSLC / Class 10 marks card',
      'Previous qualifying examination marks card',
      'Valid Caste and Income Certificate (RD number from Nadakacheri / Seva Sindhu)',
      'College / Institution bonafide and fee receipt',
      'Bank account seeded for DBT (check NPCI status)',
    ],
    applicationProcedure:
      '1. Create a student account on the official Karnataka SSP Post-Matric portal.\n2. Complete e-KYC and link your RD-numbered Caste & Income certificates.\n3. Select your college, course, and academic year using your admission details.\n4. Review and submit the application before the department deadline.',
    importantDatesText:
      'Annual academic cycle — check the official Karnataka SSP portal for current department-wise opening and closing dates.',
    deadlineDate: null,
    officialSourceName: 'State Scholarship Portal, Government of Karnataka',
    officialSourceUrl: 'https://ssp.postmatric.karnataka.gov.in/',
    officialApplyUrl: 'https://ssp.postmatric.karnataka.gov.in/',
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'central-sector-scheme-college-university-students-nsp',
    title: 'Central Sector Scheme of Scholarships for College and University Students (CSSS)',
    providerName: 'Department of Higher Education, Ministry of Education, Government of India',
    providerType: 'Government - Central',
    department: 'Department of Higher Education',
    category: 'Merit-based',
    state: 'All India',
    district: null,
    educationLevels: ['Undergraduate', 'Postgraduate', 'Professional'],
    eligibleCourses: ['All'],
    minMarksPercentage: 80,
    maxFamilyIncome: 450000,
    eligibleCategories: ['All'],
    requiresDisability: false,
    summary:
      'Merit-cum-means central scholarship for students above the 80th percentile in Class 12 board exams pursuing regular college or university degrees.',
    overview:
      'Administered through the National Scholarship Portal (NSP), CSSS supports meritorious students from low-income families across India to meet day-to-day expenses while pursuing regular higher education.',
    whoCanApply:
      'Students who scored above the 80th percentile in their respective State/Central Class 12 board examination and are enrolled in regular degree courses.',
    eligibilityDetails:
      'Gross parental/family income must not exceed INR 4,50,000 per annum. Students must not be receiving any other scholarship and must pursue a regular full-time course (not distance/correspondence).',
    benefitsSummary:
      'INR 12,000 per annum at graduation level (first 3 years) and INR 20,000 per annum at postgraduate level / 4th & 5th year of professional courses (subject to official NSP guidelines).',
    requiredDocuments: [
      'Class 12 Board Examination Marksheet',
      'Family Income Certificate issued by competent authority',
      'College / University Bonafide Certificate',
      'Bank passbook linked for DBT',
      'NSP One-Time Registration (OTR) ID',
    ],
    applicationProcedure:
      '1. Complete One-Time Registration (OTR) on the National Scholarship Portal.\n2. Log in and select the Central Sector Scheme under Department of Higher Education.\n3. Upload required academic and income documents.\n4. Submit and track institute verification through your college nodal officer.',
    importantDatesText:
      'Annual cycle via National Scholarship Portal — verify current year submission and institute verification cutoffs on scholarships.gov.in.',
    deadlineDate: null,
    officialSourceName: 'National Scholarship Portal (NSP)',
    officialSourceUrl: 'https://scholarships.gov.in/',
    officialApplyUrl: 'https://scholarships.gov.in/',
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'aicte-pragati-scholarship-for-girl-students',
    title: 'AICTE Pragati Scholarship Scheme for Girl Students (Technical Degree & Diploma)',
    providerName: 'All India Council for Technical Education (AICTE)',
    providerType: 'Government - Central',
    department: 'AICTE / Ministry of Education',
    category: 'Central',
    state: 'All India',
    district: null,
    educationLevels: ['Diploma', 'Undergraduate', 'Professional'],
    eligibleCourses: ['Engineering', 'Polytechnic', 'Diploma', 'Architecture', 'Pharmacy', 'Technical'],
    minMarksPercentage: null,
    maxFamilyIncome: 800000,
    eligibleCategories: ['All'],
    requiresDisability: false,
    summary:
      'Central technical education scholarship supporting girl students admitted to first-year AICTE-approved degree or diploma programs.',
    overview:
      'AICTE Pragati encourages women participation in technical and engineering education by providing annual financial assistance for tuition, books, and equipment to eligible girl students.',
    whoCanApply:
      'Girl students admitted to the first year (or second year via lateral entry) of an AICTE-approved Diploma or Technical Degree course in the current academic session.',
    eligibilityDetails:
      'Up to two girl children per family are eligible. Total family income from all sources must not exceed INR 8,00,000 per annum. Selection is based on merit in the qualifying examination.',
    benefitsSummary:
      'INR 50,000 per annum for every year of study (up to 4 years for degree / 3 years for diploma) as per official AICTE scheme terms.',
    requiredDocuments: [
      'Class 10 / Class 12 / ITI Marksheet (as applicable)',
      'Admission letter and fee receipt from AICTE-approved institute',
      'Annual Family Income Certificate',
      'Bank account details in the student name',
      'Declaration confirming up to two girl children in family',
    ],
    applicationProcedure:
      '1. Register on the National Scholarship Portal (NSP) with your OTR.\n2. Choose AICTE Pragati (Degree or Diploma) from the central schemes list.\n3. Upload institute admission proof and income certificate.\n4. Ensure your institution verifies the application on NSP.',
    importantDatesText:
      'Annual application window on NSP — check scholarships.gov.in and aicte-india.org for current session cutoffs.',
    deadlineDate: null,
    officialSourceName: 'AICTE Official Schemes & National Scholarship Portal',
    officialSourceUrl: 'https://www.aicte-india.org/schemes/students-development-schemes/Pragati',
    officialApplyUrl: 'https://scholarships.gov.in/',
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'aicte-saksham-scholarship-specially-abled-students',
    title: 'AICTE Saksham Scholarship Scheme for Specially Abled Students',
    providerName: 'All India Council for Technical Education (AICTE)',
    providerType: 'Government - Central',
    department: 'AICTE / Ministry of Education',
    category: 'Disability',
    state: 'All India',
    district: null,
    educationLevels: ['Diploma', 'Undergraduate', 'Professional'],
    eligibleCourses: ['Engineering', 'Polytechnic', 'Diploma', 'Architecture', 'Pharmacy', 'Technical'],
    minMarksPercentage: null,
    maxFamilyIncome: 800000,
    eligibleCategories: ['All'],
    requiresDisability: true,
    summary:
      'Financial assistance for specially abled students (40% or more disability) pursuing AICTE-approved technical degree or diploma courses.',
    overview:
      'Saksham is an AICTE initiative dedicated to empowering students with benchmark disabilities to pursue technical education without financial barriers.',
    whoCanApply:
      'Students with a disability of not less than 40% admitted to the first year or second year (lateral entry) of an AICTE-approved Degree or Diploma course.',
    eligibilityDetails:
      'Must hold a valid UDID / disability certificate confirming >= 40% disability, with annual family income not exceeding INR 8,00,000.',
    benefitsSummary:
      'INR 50,000 per annum for each year of study (covering tuition, books, assistive devices, and academic expenses as notified by AICTE).',
    requiredDocuments: [
      'Valid Disability Certificate / UDID card (>= 40% disability)',
      'Qualifying exam marksheet (10th / 12th / Diploma)',
      'AICTE-approved institution admission & fee proof',
      'Annual Family Income Certificate',
      'Bank account passbook',
    ],
    applicationProcedure:
      '1. Complete OTR registration on the National Scholarship Portal.\n2. Select AICTE Saksham Scholarship Scheme.\n3. Upload disability certificate and institutional enrollment documents.\n4. Track verification via your college nodal officer.',
    importantDatesText:
      'Annual cycle via National Scholarship Portal — check official portals for active dates.',
    deadlineDate: null,
    officialSourceName: 'AICTE Saksham Scheme Documentation',
    officialSourceUrl: 'https://www.aicte-india.org/schemes/students-development-schemes/Saksham',
    officialApplyUrl: 'https://scholarships.gov.in/',
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'karnataka-vidyasiri-food-accommodation-scheme',
    title: 'Vidyasiri — Food and Accommodation Assistance Scheme (Karnataka)',
    providerName: 'Backward Classes Welfare Department, Government of Karnataka',
    providerType: 'Government - State',
    department: 'Backward Classes Welfare Department',
    category: 'Need-based',
    state: 'Karnataka',
    district: null,
    educationLevels: ['PUC', 'Diploma', 'Undergraduate', 'Postgraduate', 'Professional'],
    eligibleCourses: ['All'],
    minMarksPercentage: null,
    maxFamilyIncome: 250000,
    eligibleCategories: ['OBC', 'Minority', 'EWS'],
    requiresDisability: false,
    summary:
      'Monthly food and accommodation stipend for eligible Karnataka students studying away from home who did not receive government hostel admission.',
    overview:
      'Vidyasiri supports post-matric students from backward classes in Karnataka who study in a college outside their hometown (typically >= 5 km from residence) and could not secure a seat in a government hostel.',
    whoCanApply:
      'Karnataka domicile post-matric students belonging to eligible backward class categories (Cat-1, 2A, 3A, 3B as notified) not residing in a government hostel.',
    eligibilityDetails:
      'Family annual income must be within department limits (e.g., up to INR 1,00,000 for 2A/3A/3B and INR 2,50,000 for Cat-1, verify exact current notification on SSP). Attendance requirements apply.',
    benefitsSummary:
      'Monthly stipend for 10 months in an academic year (historically INR 1,500/month — confirm current rate in latest Karnataka BCWD notification).',
    requiredDocuments: [
      'Valid Karnataka Caste and Income Certificate (RD Number)',
      'Previous academic marks card',
      'College bonafide & attendance record',
      'Hostel non-availability / rented or commuting address proof',
    ],
    applicationProcedure:
      '1. Apply through the Karnataka State Scholarship Portal (SSP).\n2. Select Vidyasiri assistance under Backward Classes Welfare.\n3. Verify distance/hostel status and submit through your college.',
    importantDatesText:
      'Annual academic cycle via Karnataka SSP — check ssp.postmatric.karnataka.gov.in for current cycle dates.',
    deadlineDate: null,
    officialSourceName: 'Backward Classes Welfare Department / SSP Karnataka',
    officialSourceUrl: 'https://ssp.postmatric.karnataka.gov.in/',
    officialApplyUrl: 'https://ssp.postmatric.karnataka.gov.in/',
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
];

export async function ensureBaselineScholarships(): Promise<number> {
  const existing = await db.select({ value: count() }).from(scholarships);
  const total = Number(existing[0]?.value ?? 0);
  if (total > 0) {
    return 0;
  }

  await db.insert(scholarships).values(VERIFIED_PORTAL_SEEDS).onConflictDoNothing();
  return VERIFIED_PORTAL_SEEDS.length;
}
