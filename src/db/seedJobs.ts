import { db } from './index.ts';
import { jobs } from './schema.ts';

type JobSeed = typeof jobs.$inferInsert;

const now = new Date();
const nextQuarter = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

function makeJob(input: {
  slug: string;
  title: string;
  organization: string;
  category: string;
  state?: string;
  location: string;
  qualification: string;
  ageCriteria: string;
  vacancyInfo?: string;
  salaryPayScale?: string;
  experienceLevel?: string;
  deadlineText?: string;
  summary: string;
  applicationSteps: string[];
  requiredDocuments: string[];
  officialNotificationUrl: string;
  officialApplyUrl: string;
  officialSourceName: string;
}): JobSeed {
  return {
    slug: input.slug,
    title: input.title,
    organization: input.organization,
    category: input.category,
    state: input.state ?? 'All India',
    location: input.location,
    qualification: input.qualification,
    ageCriteria: input.ageCriteria,
    vacancyInfo:
      input.vacancyInfo ??
      'Information not yet verified for active cycle — check official notification PDF for exact post-wise vacancies.',
    salaryPayScale:
      input.salaryPayScale ??
      'As per official 7th CPC / organization pay matrix; check active notification PDF.',
    experienceLevel: input.experienceLevel ?? 'Freshers & Experienced',
    deadlineText:
      input.deadlineText ??
      'Check active recruitment calendar on official portal; deadlines vary per advertisement.',
    deadlineDate: null,
    summary: input.summary,
    applicationSteps: input.applicationSteps,
    requiredDocuments: input.requiredDocuments,
    officialNotificationUrl: input.officialNotificationUrl,
    officialApplyUrl: input.officialApplyUrl,
    officialSourceName: input.officialSourceName,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: now,
    nextReviewAt: nextQuarter,
  };
}

export const VERIFIED_JOBS: JobSeed[] = [
  makeJob({
    slug: 'ncs-national-career-service-central-private-wfh',
    title: 'National Career Service (NCS) — Verified Central, Private, Fresher & Remote Jobs',
    organization: 'Ministry of Labour & Employment, Government of India',
    category: 'Private & Freshers',
    location: 'Pan-India & Remote / WFH',
    qualification: '10th / 12th / ITI / Diploma / Graduate / Postgraduate',
    ageCriteria: '18+ years (post-dependent)',
    vacancyInfo: 'Live verified private, MNC, and government job postings updated daily on ncs.gov.in.',
    salaryPayScale: 'Employer-declared salary range displayed on each verified NCS posting.',
    experienceLevel: 'Freshers, Students & Experienced Professionals',
    summary:
      'Official free government job-matching portal listing verified Private Jobs, Freshers roles, Work-from-Home opportunities, Career Counselling, and Government Vacancies.',
    applicationSteps: [
      'Register free as a Jobseeker on ncs.gov.in.',
      'Build your NCS Resume Profile and filter by State, City, Qualification, Freshers, or Work-from-Home.',
      'Apply directly to verified employers without paying any placement or registration fee.',
    ],
    requiredDocuments: [
      'Updated Resume / Academic Certificates',
      'Valid Mobile Number & Government ID (verified on ncs.gov.in)',
    ],
    officialNotificationUrl: 'https://www.ncs.gov.in/',
    officialApplyUrl: 'https://www.ncs.gov.in/',
    officialSourceName: 'National Career Service (MoLE)',
  }),
  makeJob({
    slug: 'upsc-ssc-central-government-recruitment-portal',
    title: 'Central Government Recruitment (UPSC & SSC Group A, B & C Annual Notifications)',
    organization: 'Union Public Service Commission (UPSC) & Staff Selection Commission (SSC)',
    category: 'Central Government Jobs',
    location: 'All India (Central Ministries & Departments)',
    qualification: 'Class 10 / Class 12 / Diploma / Any Bachelor’s Degree',
    ageCriteria: '18–32 years (post-specific with SC/ST/OBC/PwBD relaxations)',
    salaryPayScale: '7th Pay Commission Levels 1 to 10 (check specific CEN/notification)',
    summary:
      'Gateway to verified Central Civil Services, Assistant Section Officers, Income Tax Inspectors, Junior Engineers, and Ministerial posts across India.',
    applicationSteps: [
      'Create One-Time Registration (OTR) on upsconline.nic.in (UPSC) or ssc.gov.in (SSC).',
      'Read the active Employment News / Official Notification PDF carefully before applying.',
      'Submit online application, upload photo/signature, and pay official fee (exempted for Women/SC/ST/PwBD where applicable).',
    ],
    requiredDocuments: [
      '10th / 12th / Degree Marks Cards & Passing Certificates',
      'Valid Photo ID & Category/EWS/PwBD Certificate',
    ],
    officialNotificationUrl: 'https://ssc.gov.in/',
    officialApplyUrl: 'https://upsconline.nic.in/',
    officialSourceName: 'UPSC & SSC Official Portals',
  }),
  makeJob({
    slug: 'kpsc-kea-karnataka-state-government-jobs',
    title: 'Karnataka State Government Recruitment (KPSC KAS/FDA/SDA, KEA & Gram Panchayat)',
    organization: 'Karnataka Public Service Commission (KPSC) & KEA',
    category: 'Karnataka Government Jobs',
    state: 'Karnataka',
    location: 'Bengaluru & All 31 Districts of Karnataka',
    qualification: 'SSLC / 2nd PUC / ITI / Diploma / Bachelor’s Degree + Kannada',
    ageCriteria: '18–35 years (GM), +3 yrs 2A/2B/3A/3B, +5 yrs SC/ST/Cat-1',
    salaryPayScale: 'Karnataka State Pay Scale (refer active KPSC / KEA notification)',
    summary:
      'Verified Karnataka state government jobs including KAS, FDA, SDA, Group-C Technical, KEA state corporation recruitments, and Municipal/Panchayat cadres.',
    applicationSteps: [
      'Complete OTR profile on kpsc.kar.nic.in or register on KEA recruitment portal.',
      'Ensure RD-number Caste, Income, Rural, Kannada Medium, and 371(J) Kalyana Karnataka certificates are valid before last date.',
      'Submit application and retain KPSC/KEA fee challan receipt.',
    ],
    requiredDocuments: [
      'SSLC / PUC / Degree Certificates & Kannada Language Proof',
      'RD-Number Caste / Income / Rural / Kannada Medium / 371(J) Certificates',
    ],
    officialNotificationUrl: 'https://kpsc.kar.nic.in/',
    officialApplyUrl: 'https://cetonline.karnataka.gov.in/kea/',
    officialSourceName: 'KPSC & KEA Government of Karnataka',
  }),
  makeJob({
    slug: 'ibps-sbi-rbi-public-sector-banking-careers',
    title: 'Public Sector Banking & Regulatory Careers (IBPS PO/Clerk/RRB, SBI & RBI)',
    organization: 'IBPS / State Bank of India / Reserve Bank of India',
    category: 'Banking',
    location: 'All India (Regional & Metro Branches)',
    qualification: 'Bachelor’s Degree in any discipline',
    ageCriteria: '20–30 years (with statutory relaxations)',
    salaryPayScale: 'IBA Bipartite Settlement / Bank Officer Scales (verify active notification)',
    summary:
      'Annual nationwide recruitment into Public Sector Banks, Regional Rural Banks, SBI, and RBI for Clerk, Probationary Officer, and Specialist Officer roles.',
    applicationSteps: [
      'Track annual IBPS CRP Calendar on ibps.in, SBI Careers (sbi.co.in/web/careers), and RBI Opportunities.',
      'Verify local language proficiency requirements when applying for State Clerical / RRB posts.',
      'Apply online directly on the respective bank/IBPS portal before deadline.',
    ],
    requiredDocuments: [
      'Degree Marks Cards / Provisional Certificate',
      'Handwritten Declaration, Left Thumb Impression, Photo & Signature',
    ],
    officialNotificationUrl: 'https://www.ibps.in/',
    officialApplyUrl: 'https://sbi.co.in/web/careers',
    officialSourceName: 'IBPS / SBI / RBI',
  }),
  makeJob({
    slug: 'indian-railways-rrb-recruitment-hub',
    title: 'Indian Railways Recruitment (RRB NTPC, ALP, Technician, JE, Group D & RPF)',
    organization: 'Ministry of Railways — Railway Recruitment Boards (RRBs)',
    category: 'Railway',
    location: 'All Railway Zones (incl. SWR Hubballi / RRB Bengaluru)',
    qualification: '10th / ITI (NCVT/SCVT) / 12th / Engineering Diploma / Graduate',
    ageCriteria: '18–36 years (CEN-specific with statutory relaxations)',
    salaryPayScale: '7th CPC Level 1 to Level 6 + Railway allowances',
    summary:
      'Unified Indian Railways recruitment portal for Station Master, Junior Engineer, Assistant Loco Pilot, Technician, Clerk, and Railway Protection Force.',
    applicationSteps: [
      'Create a single account on rrbapply.gov.in and verify active CEN notices.',
      'Select only ONE RRB zone per Centralized Employment Notice as permitted.',
      'Complete CBT, Skill/CBAT/PET, and Document Verification at the allotted RRB.',
    ],
    requiredDocuments: [
      '10th / ITI / Diploma / Degree Certificates',
      'Medical Fitness & Category/EBC Fee-Waiver Certificate (if claiming)',
    ],
    officialNotificationUrl: 'https://indianrailways.gov.in/',
    officialApplyUrl: 'https://www.rrbapply.gov.in/',
    officialSourceName: 'RRB Unified Apply Portal',
  }),
  makeJob({
    slug: 'indian-armed-forces-defence-ksp-police-recruitment',
    title: 'Defence, CAPF & State Police Recruitment (Army, Navy, Air Force, Coast Guard & KSP)',
    organization: 'Indian Armed Forces / UPSC / SSC / Karnataka State Police',
    category: 'Defence',
    location: 'All India & State Police Units',
    qualification: '10th / 12th / Graduate (Stream & Physical Standards apply)',
    ageCriteria: '17.5–25 years (entry-dependent)',
    salaryPayScale: 'Defence / CAPF / State Police Pay Matrix',
    summary:
      'Official non-agent pathways for NDA, CDS, AFCAT, Agniveer (Army/Navy/Air Force), Indian Coast Guard, SSC CAPF, and Karnataka State Police (PSI/PC).',
    applicationSteps: [
      'Apply strictly through official recruitment portals: joinindianarmy.nic.in, joinindiannavy.gov.in, afcat.cdac.in, upsc.gov.in, or ksp.karnataka.gov.in.',
      'Review Physical Measurement (Height/Chest) and Medical Vision standards before submitting.',
    ],
    requiredDocuments: [
      'Academic Marks Cards & Age Proof',
      'NCC / Sports / Domicile Certificates (if applicable)',
    ],
    officialNotificationUrl: 'https://joinindianarmy.nic.in/',
    officialApplyUrl: 'https://afcat.cdac.in/',
    officialSourceName: 'Armed Forces & State Police Official Portals',
  }),
  makeJob({
    slug: 'psu-gate-kvs-nvs-teaching-jobs',
    title: 'PSU Engineering Careers (GATE-Based) & Central Teaching Jobs (KVS, NVS & EMRS)',
    organization: 'Central PSUs (IOCL, NTPC, ONGC, BHEL, PowerGrid) / KVS / NVS / UGC',
    category: 'PSU',
    location: 'Pan-India Plant & School Locations',
    qualification: 'B.E./B.Tech + GATE Score (PSUs) OR B.Ed/D.El.Ed + CTET (Teaching)',
    ageCriteria: '21–30 years (PSUs) / up to 35–40 years (Teaching)',
    salaryPayScale: 'PSU E2 IDA Scale / 7th CPC Level 6–10 (Teaching)',
    summary:
      'Verified technical officer openings at Navratna/Maharatna PSUs via GATE and permanent PRT/TGT/PGT teaching posts across Kendriya & Navodaya Vidyalayas.',
    applicationSteps: [
      'Appear for GATE (for PSU Engineer Trainee roles) or CTET (for KVS/NVS PRT & TGT roles).',
      'Apply separately on each PSU career portal (e.g., iocl.com, careers.ntpc.co.in) or kvsangathan.nic.in when recruitment opens.',
    ],
    requiredDocuments: [
      'Valid GATE Scorecard / CTET Eligibility Certificate',
      'Degree / B.Ed Marks Cards & Category/PwBD Certificate',
    ],
    officialNotificationUrl: 'https://kvsangathan.nic.in/',
    officialApplyUrl: 'https://careers.ntpc.co.in/',
    officialSourceName: 'Central PSUs & KVS/NVS Official Portals',
  }),
  makeJob({
    slug: 'pm-internship-aicte-nats-naps-apprenticeships',
    title: 'PM Internship Scheme, AICTE Internships & NATS/NAPS Government Apprenticeships',
    organization: 'Ministry of Corporate Affairs / Ministry of Education / AICTE / MSDE',
    category: 'Internships & Apprenticeships',
    location: 'All India (Top 500 Companies, PSUs & Tech Firms)',
    qualification: '10th / 12th / ITI / Diploma / Engineering & Degree Students/Graduates',
    ageCriteria: '18–24 years (PM Internship) / 14–28+ years (NATS/NAPS)',
    salaryPayScale: 'Stipend ₹5,000/month + ₹6,000 grant (PM Internship) / Prescribed NATS/NAPS stipend',
    experienceLevel: 'Students & Freshers (0–1 year)',
    summary:
      'Government-verified paid internships and 1-year industrial/engineering apprenticeships across India’s top companies, PSUs, and AICTE partners.',
    applicationSteps: [
      'PM Internship Scheme: register on pminternship.mca.gov.in and select up to 5 district/sector preferences.',
      'Graduate/Diploma Apprenticeship (NATS 2.0): register on nats.education.gov.in.',
      'ITI/Vocational Apprenticeship (NAPS): apply via apprenticeshipindia.gov.in or AICTE Internship (internship.aicte-india.org).',
    ],
    requiredDocuments: [
      'Academic Marks Card / Provisional Certificate',
      'Aadhaar-seeded Bank Account for DBT stipend credit',
    ],
    officialNotificationUrl: 'https://pminternship.mca.gov.in/',
    officialApplyUrl: 'https://nats.education.gov.in/',
    officialSourceName: 'PM Internship / NATS 2.0 / AICTE Internship',
  }),
];

export async function ensureBaselineJobs(): Promise<void> {
  await db.insert(jobs).values(VERIFIED_JOBS).onConflictDoNothing({ target: jobs.slug });
}
