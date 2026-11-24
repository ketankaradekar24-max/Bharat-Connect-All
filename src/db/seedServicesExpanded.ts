import { db } from './index.ts';
import { publicServices } from './schema.ts';

type ServiceSeed = typeof publicServices.$inferInsert;

const now = new Date();
const nextReview = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

function makeService(input: {
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  departmentOrAuthority: string;
  jurisdiction?: 'Central' | 'State';
  state?: string;
  country?: string | null;
  summary: string;
  overview: string;
  whoCanApply: string;
  eligibilityRequirements: string;
  documentsRequired: string[];
  applicationSteps: string[];
  officialFees: string;
  appointmentProcess?: string | null;
  trackingGuidance: string;
  commonMistakes: string[];
  faqs: Array<{ q: string; a: string }>;
  officialWebsiteName: string;
  officialWebsiteUrl: string;
  officialApplyUrl: string;
  sourceUrl?: string;
  isThirdParty?: boolean;
}): ServiceSeed {
  return {
    slug: input.slug,
    title: input.title,
    category: input.category,
    subcategory: input.subcategory,
    departmentOrAuthority: input.departmentOrAuthority,
    jurisdiction: input.jurisdiction ?? 'Central',
    state: input.state ?? 'All India',
    country: input.country ?? null,
    summary: input.summary,
    overview: input.overview,
    whoCanApply: input.whoCanApply,
    eligibilityRequirements: input.eligibilityRequirements,
    documentsRequired: input.documentsRequired,
    applicationSteps: input.applicationSteps,
    officialFees: input.officialFees,
    appointmentProcess: input.appointmentProcess ?? null,
    trackingGuidance: input.trackingGuidance,
    commonMistakes: input.commonMistakes,
    faqs: input.faqs,
    translations: null,
    officialWebsiteName: input.officialWebsiteName,
    officialWebsiteUrl: input.officialWebsiteUrl,
    officialApplyUrl: input.officialApplyUrl,
    sourceUrl: input.sourceUrl ?? input.officialWebsiteUrl,
    isThirdParty: input.isThirdParty ?? false,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: now,
    nextReviewAt: nextReview,
  };
}

export const EXPANDED_PUBLIC_SERVICES: ServiceSeed[] = [
  // ================= COLLEGE ADMISSIONS & COUNSELLING =================
  makeService({
    slug: 'josaa-csab-central-engineering-counselling',
    title: 'JoSAA & CSAB Counselling Guide (IITs, NITs, IIITs & GFTIs)',
    category: 'College Admissions & Counselling',
    subcategory: 'Central Engineering Counselling',
    departmentOrAuthority: 'Joint Seat Allocation Authority (JoSAA) & CSAB',
    summary:
      'Complete round-by-round guidance for JoSAA & CSAB online registration, choice filling, Freeze/Float/Slide options, document verification, and seat acceptance.',
    overview:
      'JoSAA conducts centralized online seat allocation for IITs, NITs, IIITs, and Centrally Funded Technical Institutes based on JEE Main and JEE Advanced ranks, followed by CSAB Special Rounds for vacant NIT+ seats.',
    whoCanApply: 'Candidates holding valid JEE Main or JEE Advanced ranks meeting Class 12 subject & aggregate criteria.',
    eligibilityRequirements: 'Valid JEE Main / JEE Advanced rank plus Class 12 minimum percentage / top-20 percentile norms.',
    documentsRequired: [
      'JEE Main / JEE Advanced Admit Card & Rank Card',
      'Class 10 & Class 12 Marks Cards & Passing Certificate',
      'Category Certificate (EWS / OBC-NCL / SC / ST in official JoSAA format) & PwD Certificate if applicable',
      'Medical Certificate in prescribed JoSAA Annexure format & Cancelled Cheque/Bank Passbook',
    ],
    applicationSteps: [
      'Register on josaa.nic.in using your JEE Main Application Number and password.',
      'Fill and arrange academic program choices in strictly decreasing order of preference and lock before deadline.',
      'Review Mock Seat Allocation 1 & 2 to refine preferences realistically.',
      'After Round allotment, choose Freeze, Float, or Slide, upload documents, pay Seat Acceptance Fee, and respond to verification queries promptly.',
      'For vacant NIT/IIIT/GFTI seats after JoSAA rounds, register separately on csab.nic.in for CSAB Special Rounds.',
    ],
    officialFees: 'Seat Acceptance Fee & Partial Admission Fee are published each admission cycle on josaa.nic.in (adjustable against institute tuition fee).',
    appointmentProcess: 'Online document verification followed by physical reporting at the allotted IIT/NIT/IIIT as per schedule.',
    trackingGuidance: 'Log in to josaa.nic.in candidate portal daily during active rounds to reply to any Document Verification Officer query within the deadline.',
    commonMistakes: [
      'Forgetting to respond to a JoSAA Document Verification query before cutoff, which cancels the allotted seat.',
      'Submitting an old-format OBC-NCL or EWS certificate issued before the official financial-year cutoff.',
      'Placing lower-preference branches above higher-preference ones during choice filling.',
    ],
    faqs: [
      {
        q: 'What is the difference between Freeze, Float, and Slide?',
        a: 'Freeze accepts the current seat permanently; Float keeps the seat while seeking higher preferences across any institute; Slide seeks higher preferences within the same allotted institute.',
      },
    ],
    officialWebsiteName: 'Joint Seat Allocation Authority (JoSAA)',
    officialWebsiteUrl: 'https://josaa.nic.in/',
    officialApplyUrl: 'https://josaa.nic.in/',
    sourceUrl: 'https://csab.nic.in/',
  }),
  makeService({
    slug: 'kea-karnataka-ugcet-neet-counselling-guide',
    title: 'KEA Karnataka Admission Counselling (KCET Engineering, Medical, Pharmacy & Architecture)',
    category: 'College Admissions & Counselling',
    subcategory: 'Karnataka State Counselling (KEA)',
    departmentOrAuthority: 'Karnataka Examinations Authority (KEA)',
    jurisdiction: 'State',
    state: 'Karnataka',
    summary:
      'Step-by-step guide to KEA document verification, secret key, Option Entry, Mock Allotment, Choice 1–4 rules, and college reporting in Karnataka.',
    overview:
      'KEA manages centralized Karnataka seat allotment for Engineering, Architecture, Farm Sciences, B.Pharm, and State-Quota MBBS/BDS/AYUSH (via NEET/NATA/KCET ranks).',
    whoCanApply: 'KCET, NEET UG (Karnataka registered), and NATA qualifiers satisfying KEA eligibility clauses.',
    eligibilityRequirements: 'Must complete KEA online registration, clause verification (Study/Rural/Kannada/Caste/Income RD numbers), and obtain Verification Slip.',
    documentsRequired: [
      'KCET / NEET Application Printout & Verification Slip',
      'SSLC & 2nd PUC Marks Cards + Study Certificates (7 years / Clause proof)',
      'RD-Number Caste / Income / Rural / Kannada Medium / HK 371(J) Certificates',
    ],
    applicationSteps: [
      'Complete online document verification or BEO/KEA verification as notified on cetonline.karnataka.gov.in/kea/.',
      'Download the KEA Verification Slip and log into the Option Entry portal.',
      'Enter college + branch preferences carefully and inspect Mock Allotment results.',
      'Rearrange/edit preferences before Round 1 Real Allotment.',
      'After Round 1 allotment, exercise Choice 1 (Accept & Report), Choice 2 (Hold & Try Higher), Choice 3 (Reject & Try Again), or Choice 4 (Exit), pay fee, download Admission Order, and report to college.',
    ],
    officialFees: 'KEA counselling registration and tuition fee slabs are notified per college type (Government / Aided / Private / Supernumerary) on cetonline.karnataka.gov.in/kea/.',
    trackingGuidance: 'Track allotment rounds, fee challans, and Admission Order status inside your KEA candidate portal.',
    commonMistakes: [
      'Selecting Choice 1 or Choice 4 without understanding forfeiture/penalty rules in Round 2 & Mop-up rounds.',
      'Waiting until the final hour for Option Entry when portal traffic is highest.',
    ],
    faqs: [
      {
        q: 'Can non-Karnataka NEET candidates participate in KEA Private/Management seats?',
        a: 'Yes, eligible NEET UG qualifiers can register during KEA open registration windows for Open/Other/NRI quota private seats in Karnataka as per official KEA brochure.',
      },
    ],
    officialWebsiteName: 'Karnataka Examinations Authority (KEA)',
    officialWebsiteUrl: 'https://cetonline.karnataka.gov.in/kea/',
    officialApplyUrl: 'https://cetonline.karnataka.gov.in/kea/',
  }),
  makeService({
    slug: 'mcc-neet-aiq-medical-counselling',
    title: 'MCC All India Quota Medical & Dental Counselling (MBBS / BDS / B.Sc Nursing)',
    category: 'College Admissions & Counselling',
    subcategory: 'Medical & Dental Counselling (MCC)',
    departmentOrAuthority: 'Medical Counselling Committee (DGHS), Ministry of Health & Family Welfare',
    summary:
      'Official guide for 15% All India Quota, AIIMS, JIPMER, Central Universities, ESIC, and Deemed University MBBS/BDS/Nursing counselling on mcc.nic.in.',
    overview:
      'Qualified NEET UG and NEET PG candidates apply on mcc.nic.in for All India Quota seats in Government medical colleges as well as 100% seats in AIIMS, JIPMER, BHU, AMU, and Deemed Universities.',
    whoCanApply: 'NEET UG / NEET PG qualified candidates meeting percentile cutoff.',
    eligibilityRequirements: 'Qualified NEET scorecard and Class 12 PCB (for UG) or MBBS + internship (for PG).',
    documentsRequired: [
      'NTA NEET Admit Card & Rank Letter / Scorecard',
      'Class 10 & Class 12 Mark Sheets & Certificates',
      'Valid Photo ID, Passport Photos & Provisional Allotment Letter',
      'Category / EWS / PwBD Disability Certificate from designated MCC centres (if applicable)',
    ],
    applicationSteps: [
      'Register on mcc.nic.in under UG/PG Medical Counselling.',
      'Pay non-refundable registration fee + refundable security deposit.',
      'Fill and lock college choices across AIQ / AIIMS / Deemed quotas.',
      'Download Allotment Letter if allotted and report physically to the allotted medical college with original documents.',
    ],
    officialFees: 'Registration fee and refundable security deposit differ by AIQ vs Deemed University quota; check official MCC Information Bulletin.',
    trackingGuidance: 'Track Round 1, Round 2, Round 3, and Stray Vacancy allotment results directly on mcc.nic.in.',
    commonMistakes: [
      'Missing the Security Deposit forfeiture rules when exiting after Round 2.',
      'Using state-format PwD certificates instead of MCC-designated Medical Board certificates.',
    ],
    faqs: [
      {
        q: 'Do I need to apply separately for State 85% Quota medical seats?',
        a: 'Yes. MCC covers 15% AIQ + AIIMS/Central/Deemed institutions. For 85% state quota seats, register separately on your state authority portal (e.g., KEA for Karnataka).',
      },
    ],
    officialWebsiteName: 'Medical Counselling Committee (MCC)',
    officialWebsiteUrl: 'https://mcc.nic.in/',
    officialApplyUrl: 'https://mcc.nic.in/',
  }),
  makeService({
    slug: 'college-counselling-playbook-polytechnic-iti-ug-pg',
    title: 'How Admission Counselling Works (Diploma, Polytechnic, ITI, Degree, PhD & Withdrawals)',
    category: 'College Admissions & Counselling',
    subcategory: 'General Admission & Withdrawal Playbook',
    departmentOrAuthority: 'AICTE / DGT (ITI) / UGC / State Directorates of Technical Education',
    summary:
      'Clear walkthrough covering Registration, Choice Filling, Document Verification, Fee Payment, Reporting, Polytechnic/ITI admissions, and AICTE/UGC fee refund & withdrawal rules.',
    overview:
      'Whether applying for Polytechnic/Diploma (DTE), ITI (NCVT MIS / State), Undergraduate Arts/Science/Commerce (SAMARTH / UUCMS Karnataka), Postgraduate, or PhD admissions, counselling follows a predictable multi-round workflow.',
    whoCanApply: 'Students applying to Polytechnic, ITI, UG/PG Degree, Law, Pharmacy, Agriculture, Management, or PhD programs.',
    eligibilityRequirements: 'SSLC/10th for ITI & Polytechnic Diploma; 10+2 for UG; Degree for PG; Master’s/NET/GATE for PhD.',
    documentsRequired: [
      'SSLC / PUC / Degree Marks Cards & Transfer Certificate (TC)',
      'Study / Bonafide / Migration Certificate (if changing board or university)',
      'Category, Income, Domicile & Fee-concession documents',
    ],
    applicationSteps: [
      'Track official DTE / University / NCVT ITI admission portals (in Karnataka: UUCMS uucms.karnataka.gov.in for Degree/PG & dtek.karnataka.gov.in for Polytechnic).',
      'Complete online registration and upload marks cards for merit list ranking.',
      'Submit prioritized college/course choices and confirm during Mock/Real rounds.',
      'Pay prescribed tuition fee, verify originals at nodal centre/college, and retain official fee receipts.',
      'If withdrawing before classes commence or official cutoff, submit formal cancellation online/in writing to claim fee refund under AICTE/UGC norms.',
    ],
    officialFees: 'Government polytechnics, ITIs, and state universities publish official fee structures and AICTE/UGC refund timelines in their admission prospectuses.',
    trackingGuidance: 'Save your application acknowledgement, fee receipt, and withdrawal confirmation email for record.',
    commonMistakes: [
      'Handing over original certificates without keeping scanned copies and an official acknowledgement receipt.',
      'Missing UGC/AICTE withdrawal cutoff dates for tuition fee refunds.',
    ],
    faqs: [
      {
        q: 'Where do Karnataka students apply for BA, B.Sc, B.Com, BBA, and BCA admissions?',
        a: 'State public university degree admissions in Karnataka are managed through the Unified University & College Management System (uucms.karnataka.gov.in).',
      },
    ],
    officialWebsiteName: 'UUCMS Karnataka / AICTE / DGT NCVT',
    officialWebsiteUrl: 'https://uucms.karnataka.gov.in/',
    officialApplyUrl: 'https://www.aicte-india.org/',
  }),

  // ================= DRIVING, TRANSPORT & VEHICLE =================
  makeService({
    slug: 'vehicle-rc-transfer-noc-hypothecation-vahan',
    title: 'Vehicle RC Transfer, NOC, Hypothecation Removal & Duplicate RC (Parivahan Vahan)',
    category: 'Driving Licence & Transport',
    subcategory: 'Vehicle Registration & RC Services',
    departmentOrAuthority: 'Ministry of Road Transport & Highways / State RTOs',
    summary:
      'Step-by-step official guidance for Transfer of Ownership (Form 29/30), Hypothecation Termination after loan closure (Form 35), Interstate NOC (Form 28), and Duplicate RC.',
    overview:
      'Vahan 4.0 on Parivahan Sewa provides unified online access to vehicle registration (RC) services across Indian RTOs without needing unauthorized middlemen.',
    whoCanApply: 'Registered vehicle owners, buyers/sellers, and loan-closed vehicle owners across India.',
    eligibilityRequirements: 'Valid Registration Certificate, active Motor Insurance, valid PUC certificate, and cleared pending traffic challans.',
    documentsRequired: [
      'Original Registration Certificate (RC) & Valid Vehicle Insurance + PUC Certificate',
      'Form 29 & Form 30 (Ownership Transfer) OR Form 35 + Bank Loan Closure NOC (Hypothecation Removal)',
      'Form 28 & Chassis pencil print (for Interstate NOC)',
      'FIR / Police Lost Report (for Duplicate RC)',
    ],
    applicationSteps: [
      'Visit vahan.parivahan.gov.in and select your State and RTO.',
      'Enter Vehicle Registration Number and last 5 digits of Chassis Number to access Online Services.',
      'Choose Transfer of Ownership, Hypothecation Termination, Duplicate RC, Address Change, or Issue of NOC.',
      'Verify via OTP on registered mobile number, upload required signed forms, and pay the official RTO fee.',
      'Submit physical signed forms / original RC at the RTO counter if prompted by your state RTO.',
    ],
    officialFees: 'Central/State RTO fees vary by vehicle class (Two-wheeler / LMV) and service type; displayed live inside vahan.parivahan.gov.in.',
    trackingGuidance: 'Use "Know Your Application Status" on vahan.parivahan.gov.in with your Application Number or Vehicle Registration Number.',
    commonMistakes: [
      'Applying with an expired PUC or expired vehicle insurance policy.',
      'Failing to remove bank hypothecation (Form 35) before selling a financed vehicle.',
    ],
    faqs: [
      {
        q: 'Can I download a digital copy of my RC and Driving Licence?',
        a: 'Yes, DigiLocker and the official mParivahan app issue legally valid digital RC and Driving Licences under the Motor Vehicles Act.',
      },
    ],
    officialWebsiteName: 'Vahan 4.0 — Parivahan Sewa',
    officialWebsiteUrl: 'https://vahan.parivahan.gov.in/',
    officialApplyUrl: 'https://vahan.parivahan.gov.in/',
  }),
  makeService({
    slug: 'traffic-echallan-puc-fitness-idp-parivahan',
    title: 'Traffic e-Challan Check, International Driving Permit (IDP), Road Tax & PUC/Fitness',
    category: 'Driving Licence & Transport',
    subcategory: 'e-Challan, IDP, PUC & Road Tax',
    departmentOrAuthority: 'Ministry of Road Transport & Highways / State Traffic Police',
    summary:
      'Check pending traffic e-Challans, pay state road tax, verify Pollution Under Control (PUC) & Fitness certificates, or apply for an International Driving Permit (IDP).',
    overview:
      'Parivahan hosts official tools for checking national e-Challans, verifying PUC/Fitness validity, paying interstate border/road tax, and applying for an International Driving Permit.',
    whoCanApply: 'Indian vehicle owners and valid Permanent Driving Licence holders travelling abroad.',
    eligibilityRequirements: 'Valid Permanent DL, Passport, and Air Ticket/Visa (where required) for IDP; valid vehicle number for e-Challan/PUC.',
    documentsRequired: [
      'Valid Permanent Driving Licence (for IDP)',
      'Valid Indian Passport copy & Visa / Travel details (for IDP)',
      'Vehicle Registration & Chassis/Engine last 5 digits (for e-Challan & Fitness)',
    ],
    applicationSteps: [
      'For Traffic Fines: visit echallan.parivahan.gov.in, enter Challan Number, DL Number, or Vehicle Number, and pay via official state gateway.',
      'For International Driving Permit: visit sarathi.parivahan.gov.in, select "Apply for International Driving Permit (IDP)", upload DL/Passport copies, and pay official fee.',
      'For PUC / Road Tax: visit puc.parivahan.gov.in or vahan.parivahan.gov.in.',
    ],
    officialFees: 'Official IDP fee, road tax, and challan penalties are shown directly on parivahan.gov.in.',
    trackingGuidance: 'Download payment receipts immediately from echallan.parivahan.gov.in for dispute or verification proof.',
    commonMistakes: [
      'Paying traffic fines on lookalike unofficial SMS links instead of echallan.parivahan.gov.in.',
    ],
    faqs: [
      {
        q: 'How long is an Indian International Driving Permit valid?',
        a: 'Typically 1 year from issue or until your Indian Driving Licence expiry, whichever is earlier.',
      },
    ],
    officialWebsiteName: 'Parivahan e-Challan & Sarathi',
    officialWebsiteUrl: 'https://echallan.parivahan.gov.in/',
    officialApplyUrl: 'https://echallan.parivahan.gov.in/',
  }),

  // ================= PASSPORT & VISA (COUNTRY GUIDES) =================
  ...([
    {
      slug: 'visa-guide-usa-official',
      country: 'USA',
      title: 'USA Visa Guidance (Tourist B1/B2, Student F1, Work H-1B & Transit C1)',
      portalName: 'U.S. Travel Docs / U.S. Department of State (CEAC)',
      url: 'https://travel.state.gov/content/travel/en/us-visas.html',
      applyUrl: 'https://ceac.state.gov/genniv/',
      fees: 'Verify current MRV visa fee on ustraveldocs.com/in (non-immigrant fees vary by B1/B2, F1, H/L categories).',
    },
    {
      slug: 'visa-guide-uk-official',
      country: 'UK',
      title: 'UK Visa Guidance (Standard Visitor, Student Route, Skilled Worker & Transit)',
      portalName: 'GOV.UK Visas and Immigration (UKVI)',
      url: 'https://www.gov.uk/browse/visas-immigration',
      applyUrl: 'https://www.gov.uk/apply-to-come-to-the-uk',
      fees: 'Official UKVI fees and Immigration Health Surcharge (IHS) vary by visa type and duration; verify on gov.uk/visa-fees.',
    },
    {
      slug: 'visa-guide-canada-official',
      country: 'Canada',
      title: 'Canada Visa Guidance (Visitor, Study Permit, Work Permit & Express Entry)',
      portalName: 'Immigration, Refugees and Citizenship Canada (IRCC)',
      url: 'https://www.canada.ca/en/services/immigration-citizenship.html',
      applyUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application.html',
      fees: 'Verify current CAD application & biometrics fees directly on ircc.canada.ca.',
    },
    {
      slug: 'visa-guide-australia-official',
      country: 'Australia',
      title: 'Australia Visa Guidance (Visitor Subclass 600, Student 500 & Skilled Work)',
      portalName: 'Australian Government — Department of Home Affairs (ImmiAccount)',
      url: 'https://immi.homeaffairs.gov.au/',
      applyUrl: 'https://online.immi.gov.au/lusc/login',
      fees: 'Verify current AUD Visa Application Charge (VAC) via the Home Affairs Visa Pricing Estimator.',
    },
    {
      slug: 'visa-guide-france-italy-schengen',
      country: 'France & Italy (Schengen)',
      title: 'France & Italy Schengen Visa Guidance (Tourist, Business, Study & Family Visit)',
      portalName: 'France-Visas & Ministry of Foreign Affairs of Italy (Vistoperitalia)',
      url: 'https://france-visas.gouv.fr/',
      applyUrl: 'https://vistoperitalia.esteri.it/home/en',
      fees: 'Schengen short-stay (Type C) and national long-stay (Type D) official EUR/INR fees are published on France-Visas & Vistoperitalia.',
    },
    {
      slug: 'visa-guide-japan-south-korea',
      country: 'Japan & South Korea',
      title: 'Japan & South Korea Visa Guidance (Tourist, Student, Work & Business)',
      portalName: 'MOFA Japan (eVISA) & Korea Visa Portal',
      url: 'https://www.mofa.go.jp/j_info/visit/visa/index.html',
      applyUrl: 'https://www.visa.go.kr/',
      fees: 'Verify bilateral visa fee schedules directly with Embassy of Japan in India and Korea Visa Portal.',
    },
    {
      slug: 'visa-guide-singapore-uae',
      country: 'Singapore & UAE',
      title: 'Singapore & UAE Visa Guidance (Tourist, Work Pass, Student & Transit)',
      portalName: 'Singapore ICA / MOM & UAE ICP / GDRFA',
      url: 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements',
      applyUrl: 'https://u.ae/en/information-and-services/visa-and-emirates-id',
      fees: 'Official Singapore ICA / MOM pass fees and UAE ICP visa fees are published on government immigration portals.',
    },
  ] as const).map((v) =>
    makeService({
      slug: v.slug,
      title: v.title,
      category: 'Passport & Visa',
      subcategory: 'Destination Country Visa Guide',
      departmentOrAuthority: v.portalName,
      country: v.country,
      summary: `Independent checklist and official immigration links for ${v.country} Tourist, Student, Work, Business, Family, and Transit visas. Bharat Connect is not an embassy or visa agency.`,
      overview: `Review general document requirements, official application workflows, biometrics appointment procedures, and official government links for ${v.country}. Visa decisions and timelines are solely determined by official government authorities.`,
      whoCanApply: `Indian passport holders travelling to ${v.country} for tourism, university study, employment, business, medical, or transit purposes.`,
      eligibilityRequirements: `Valid Indian passport (usually 6+ months validity beyond return date), confirmed purpose-specific documents (offer letter / invitation / itinerary), and financial proof.`,
      documentsRequired: [
        'Valid Indian Passport (minimum 6 months validity and blank pages)',
        'Completed official online visa application form & biometric appointment confirmation',
        'Purpose-specific documents (University Offer / Employer Sponsorship / Business Invitation / Travel Itinerary)',
        'Financial sufficiency proof (bank statements / ITR / scholarship award / sponsor letter)',
        'Travel & Health Insurance (mandatory for Schengen/Student routes)',
      ],
      applicationSteps: [
        `Read official ${v.country} visa eligibility rules on the government immigration portal before booking flights.`,
        'Create an account directly on the official immigration/visa portal and complete the application accurately.',
        'Pay the official visa fee and schedule biometric/interview appointment at an authorized Visa Application Centre or Consulate.',
        'Attend biometrics/interview with original documents (do NOT upload sensitive passport/bank files to unofficial sites).',
      ],
      officialFees: v.fees,
      appointmentProcess: 'Biometrics and visa interviews are scheduled strictly through official embassy/authorized VAC appointment portals.',
      trackingGuidance: 'Track application status using your official Reference/Application ID on the embassy or VAC tracking page.',
      commonMistakes: [
        'Relying on unauthorized agents who guarantee visa approval (no third party can guarantee a visa).',
        'Inconsistent travel dates, unverified hotel bookings, or missing financial explanation letters.',
      ],
      faqs: [
        {
          q: `Does Bharat Connect process or guarantee ${v.country} visas?`,
          a: 'No. Bharat Connect is strictly an independent information guide and never represents any embassy, consulate, or immigration department.',
        },
      ],
      officialWebsiteName: v.portalName,
      officialWebsiteUrl: v.url,
      officialApplyUrl: v.applyUrl,
    })
  ),

  // ================= GOVERNMENT DOCUMENTS & CERTIFICATES =================
  makeService({
    slug: 'aadhaar-uidai-update-guidance',
    title: 'Aadhaar Enrolment, Address Update, Download & PVC Card Guidance (UIDAI)',
    category: 'Government Documents',
    subcategory: 'Aadhaar & Identity Services',
    departmentOrAuthority: 'Unique Identification Authority of India (UIDAI)',
    summary:
      'Official guidance for booking Aadhaar Seva Kendra appointments, updating address online, downloading masked e-Aadhaar, and ordering PVC card via myaadhaar.uidai.gov.in.',
    overview:
      'UIDAI provides self-service online address updates, document updates, virtual ID generation, and Aadhaar Seva Kendra slot booking. Bharat Connect never asks for or stores Aadhaar numbers or OTPs.',
    whoCanApply: 'Indian residents needing Aadhaar enrolment, biometric/demographic update, or e-Aadhaar retrieval.',
    eligibilityRequirements: 'Valid Proof of Identity (PoI) and Proof of Address (PoA) from UIDAI approved document list.',
    documentsRequired: [
      'Valid Proof of Identity (Passport / PAN / Voter ID / Driving Licence)',
      'Valid Proof of Address (Utility bill / Bank Passbook / Passport / Rent Agreement)',
      'Registered mobile number (for online myAadhaar OTP login on uidai.gov.in only)',
    ],
    applicationSteps: [
      'Visit official UIDAI portal myaadhaar.uidai.gov.in (verify .gov.in domain).',
      'Log in directly on UIDAI with your Aadhaar and UIDAI OTP (never share Aadhaar OTP on third-party sites).',
      'Choose Address Update / Document Update, or Book Appointment at an Aadhaar Seva Kendra for biometric/mobile updates.',
      'Save your 14-digit URN / SRN slip to check update status.',
    ],
    officialFees: 'UIDAI publishes standard charges for demographic updates, biometric updates, and PVC card printing on uidai.gov.in.',
    appointmentProcess: 'Book an Aadhaar Seva Kendra or Bank/Post Office slot at appointments.uidai.gov.in.',
    trackingGuidance: 'Use "Check Enrolment & Update Status" on myaadhaar.uidai.gov.in with your SRN/URN.',
    commonMistakes: [
      'Sharing Aadhaar OTPs with unauthorized shops or websites.',
      'Uploading expired utility bills (>3 months old) as Proof of Address.',
    ],
    faqs: [
      {
        q: 'Should I enter my Aadhaar number or OTP on Bharat Connect?',
        a: 'Never. Bharat Connect never collects Aadhaar numbers or OTPs. Always enter them strictly on uidai.gov.in.',
      },
    ],
    officialWebsiteName: 'UIDAI (myAadhaar)',
    officialWebsiteUrl: 'https://uidai.gov.in/',
    officialApplyUrl: 'https://myaadhaar.uidai.gov.in/',
  }),
  makeService({
    slug: 'digilocker-official-digital-documents',
    title: 'DigiLocker — Official Digital Marks Cards, DL, RC, PAN & Certificates',
    category: 'Government Documents',
    subcategory: 'Digital Certificates & Verification',
    departmentOrAuthority: 'Ministry of Electronics & IT (MeitY), Government of India',
    summary:
      'Access authentic digital CBSE/PUC marks cards, Driving Licences, Vehicle RC, PAN, and Caste/Income certificates legally valid under IT Act Rules.',
    overview:
      'DigiLocker connects directly to issuing ministries, state education boards, CBSE, Parivahan, Income Tax, and Karnataka Nadakacheri so documents fetched inside DigiLocker carry cryptographic QR verification.',
    whoCanApply: 'Any Indian citizen with a registered mobile number or Aadhaar.',
    eligibilityRequirements: 'Active mobile number for DigiLocker account creation.',
    documentsRequired: [
      'Roll Number / Registration Number (to pull CBSE/State Board marks cards)',
      'DL / RC / PAN / Certificate RD number to fetch verified issuer copies',
    ],
    applicationSteps: [
      'Open digilocker.gov.in or the official DigiLocker mobile app.',
      'Sign up and link your mobile/Aadhaar directly on DigiLocker.',
      'Search "Issued Documents" -> select Central Board / Karnataka PUC / Parivahan / Nadakacheri.',
      'Fetch documents directly into your Issued Documents folder for paperless verification.',
    ],
    officialFees: 'Completely Free (₹0) government digital public infrastructure.',
    trackingGuidance: 'Fetched documents appear instantly under "Issued Documents" with a verifiable QR code.',
    commonMistakes: [
      'Uploading phone photos into DigiLocker Drive instead of pulling authentic "Issued Documents" from the issuer.',
    ],
    faqs: [
      {
        q: 'Are DigiLocker documents accepted for college admissions and traffic checks?',
        a: 'Yes. Issued Documents in DigiLocker are legally equivalent to originals under Rule 9A of the Information Technology Rules.',
      },
    ],
    officialWebsiteName: 'DigiLocker (MeitY)',
    officialWebsiteUrl: 'https://www.digilocker.gov.in/',
    officialApplyUrl: 'https://www.digilocker.gov.in/',
  }),
  makeService({
    slug: 'birth-death-marriage-legal-heir-certificates',
    title: 'Birth, Death, Marriage, Domicile & Legal Heir / Family Certificates',
    category: 'Government Documents',
    subcategory: 'Civil Registration & Family Certificates',
    departmentOrAuthority: 'Office of the Registrar General of India (CRS) / State Revenue & Municipal Departments',
    summary:
      'Guidance for Birth & Death registration (CRS / Karnataka e-JanMa), Marriage registration, Domicile/Residence, and Legal Heir / Surviving Family Member certificates.',
    overview:
      'Civil vital records (Birth & Death) are registered via the Civil Registration System (dc.crsorgi.gov.in) or Karnataka e-JanMa, while Marriage, Domicile, and Surviving Family/Legal Heir certificates are handled through state portals such as Seva Sindhu / Nadakacheri / Kaveri 2.0.',
    whoCanApply: 'Parents/family members, married couples, legal heirs, and citizens requiring official civil or domicile records.',
    eligibilityRequirements: 'Hospital birth/death report, marriage solemnization proof, or local revenue verification.',
    documentsRequired: [
      'Hospital Discharge / Birth or Death Report (for Birth/Death certificates)',
      'Wedding Invitation / Photos, Witness IDs & Age Proof (for Marriage Registration)',
      'Death Certificate, Ration Card & Family Tree Affidavit (for Legal Heir / Vamshavruksha)',
      'Address & Residence duration proof (for Domicile Certificate)',
    ],
    applicationSteps: [
      'For Birth/Death (India-wide): visit dc.crsorgi.gov.in (or ejanma.karnataka.gov.in in Karnataka) within 21 days for free timely registration.',
      'For Marriage Registration in Karnataka: apply online on kaveri.karnataka.gov.in and book Sub-Registrar appointment.',
      'For Legal Heir / Surviving Family / Domicile: apply through Seva Sindhu (sevasindhu.karnataka.gov.in) or your state e-District portal.',
    ],
    officialFees: 'Birth/Death registration within 21 days is free; nominal statutory fees apply for delayed orders, certified copies, and marriage registration.',
    trackingGuidance: 'Use your CRS acknowledgement / Seva Sindhu SAKALA application number to track approval and download signed PDF.',
    commonMistakes: [
      'Delaying birth/death reporting beyond 21 days, which requires delayed-registration Tahsildar/SDM orders.',
    ],
    faqs: [
      {
        q: 'Where can Karnataka residents verify property & family records online?',
        a: 'Kaveri 2.0 (kaveri.karnataka.gov.in) handles Marriage & Deed registration, while Nadakacheri / Seva Sindhu issues Family Tree (Vamshavruksha) and Domicile certificates.',
      },
    ],
    officialWebsiteName: 'Civil Registration System (CRS) & State e-District',
    officialWebsiteUrl: 'https://dc.crsorgi.gov.in/',
    officialApplyUrl: 'https://sevasindhu.karnataka.gov.in/',
  }),

  // ================= GOVERNMENT SCHEMES & WELFARE =================
  makeService({
    slug: 'karnataka-guarantee-welfare-schemes-seva-sindhu',
    title: 'Karnataka State Welfare Schemes (Gruha Lakshmi, Shakti, Yuva Nidhi & Anna Bhagya)',
    category: 'Government Schemes',
    subcategory: 'Karnataka State Welfare & Women/Youth Schemes',
    departmentOrAuthority: 'Government of Karnataka (Seva Sindhu Guarantee Portal)',
    jurisdiction: 'State',
    state: 'Karnataka',
    summary:
      'Verified guidance for Karnataka state welfare schemes including Gruha Lakshmi (women heads of households), Yuva Nidhi (unemployed graduates/diploma holders), and Shakti.',
    overview:
      'The Government of Karnataka administers major social welfare and youth unemployment assistance schemes exclusively through Seva Sindhu, Grama One, Karnataka One, and Bangalore One centres.',
    whoCanApply: 'Eligible Karnataka residents meeting scheme-specific ration card, graduation year, or income norms.',
    eligibilityRequirements: 'Ration Card (BPL/APL/Antyodaya) woman head for Gruha Lakshmi; recent Karnataka degree/diploma pass-outs remaining unemployed after 6 months for Yuva Nidhi.',
    documentsRequired: [
      'Ration Card & Aadhaar-seeded Bank Passbook (for DBT)',
      'Degree / Diploma Provisional or Convocation Marks Card (for Yuva Nidhi)',
      'Karnataka Residence / Study proof',
    ],
    applicationSteps: [
      'Visit sevasindhu.karnataka.gov.in or sevasindhugs.karnataka.gov.in (avoid unofficial apps).',
      'Select the scheme (e.g., Gruha Lakshmi or Yuva Nidhi) and authenticate via official Karnataka portal.',
      'Ensure your bank account is Aadhaar-seeded (NPCI DBT mapped) to receive direct benefit transfers.',
    ],
    officialFees: 'Free online application on Seva Sindhu; nominal fixed service charge only if applying via Karnataka One / Grama One.',
    trackingGuidance: 'Track DBT payment and application status on Seva Sindhu or the DBT Karnataka mobile app.',
    commonMistakes: [
      'Bank account not NPCI-DBT seeded, causing payment failure even after approval.',
    ],
    faqs: [
      {
        q: 'Are Karnataka guarantee schemes open to other states?',
        a: 'No. These are Karnataka State Government schemes meant strictly for eligible residents of Karnataka.',
      },
    ],
    officialWebsiteName: 'Seva Sindhu Guarantee Services — Karnataka',
    officialWebsiteUrl: 'https://sevasindhu.karnataka.gov.in/',
    officialApplyUrl: 'https://sevasindhugs.karnataka.gov.in/',
  }),
  makeService({
    slug: 'pm-awas-yojana-housing-nsap-pension-udid',
    title: 'Central Welfare Schemes (PM Awas Yojana Housing, Senior Pension NSAP & UDID Disability)',
    category: 'Government Schemes',
    subcategory: 'Housing, Senior Citizens & Disability Welfare',
    departmentOrAuthority: 'Ministry of Housing & Urban Affairs / Rural Development / Social Justice (GoI)',
    summary:
      'Guidance for Pradhan Mantri Awas Yojana (PMAY Urban & Gramin), Indira Gandhi National Old Age / Widow / Disability Pension (NSAP), and Unique Disability ID (UDID).',
    overview:
      'Central social security and housing schemes support EWS/LIG families seeking affordable housing, senior citizens above 60 below poverty line, and Persons with Disabilities (PwD) obtaining national UDID cards and ADIP assistive devices.',
    whoCanApply: 'EWS/LIG households without pucca housing (PMAY), BPL Senior Citizens/Widows (NSAP), and Persons with Disabilities (UDID).',
    eligibilityRequirements: 'Scheme-specific income/BPL/disability (40%+ benchmark disability for UDID) criteria.',
    documentsRequired: [
      'Income / BPL Ration Card & Family ID',
      'Bank Account details linked for DBT',
      'Medical Certificate / Hospital Assessment (for UDID)',
      'Property / Land / Residence proof (for PMAY)',
    ],
    applicationSteps: [
      'For Housing: apply through pmaymis.gov.in (PMAY-U) or Gram Panchayat / pmayg.nic.in (PMAY-G).',
      'For UDID Card: register at swavlambancard.gov.in and complete Medical Board assessment at your District Hospital.',
      'For Old Age / Widow / Disability Pensions: apply via UMANG / State Social Security Portal (Sandhya Suraksha / Manaswini in Karnataka) linked with NSAP.',
    ],
    officialFees: 'Completely Free (₹0) government application.',
    trackingGuidance: 'Track PMAY status via Assessment ID on pmaymis.gov.in and UDID status on swavlambancard.gov.in.',
    commonMistakes: [
      'Paying middlemen fees for free PMAY or UDID forms.',
    ],
    faqs: [
      {
        q: 'Is the UDID card valid across all Indian states?',
        a: 'Yes, UDID is a single national disability identity card valid for scholarships, railway concessions, and government reservations across India.',
      },
    ],
    officialWebsiteName: 'PMAY / UDID Swavlamban / NSAP',
    officialWebsiteUrl: 'https://www.swavlambancard.gov.in/',
    officialApplyUrl: 'https://pmaymis.gov.in/',
    sourceUrl: 'https://nsap.nic.in/',
  }),

  // ================= SKILL DEVELOPMENT & LEARNING =================
  makeService({
    slug: 'swayam-nptel-free-courses-certifications',
    title: 'SWAYAM & NPTEL — Free Official IIT, IIM & University Courses (Coding, AI, Science & Arts)',
    category: 'Skill Development & Learning',
    subcategory: 'Free Official Online Courses & Credit Transfer',
    departmentOrAuthority: 'Ministry of Education, IITs, IISc, IIMs, UGC & AICTE',
    summary:
      'Study free online courses from IITs, IISc, and Central Universities across Programming, Data Science, AI/ML, Cybersecurity, Cloud, Management, and Humanities.',
    overview:
      'SWAYAM (Study Webs of Active-Learning for Young Aspiring Minds) and NPTEL provide 100% free video lectures and weekly assignments taught by IIT/IISc/University faculty, with optional low-cost proctored certification exams eligible for UGC academic credit transfer.',
    whoCanApply: 'School students, college students, working professionals, and lifelong learners across India.',
    eligibilityRequirements: 'Open enrollment to all learners; no prerequisites for joining courses.',
    documentsRequired: [
      'Active email address to register on swayam.gov.in',
      'Valid ID card only if registering for the optional proctored certificate exam',
    ],
    applicationSteps: [
      'Visit swayam.gov.in or nptel.ac.in and browse courses by category (Computer Science, AI/ML, Engineering, Management, Humanities).',
      'Click "Join" before the semester enrollment deadline to watch lectures and submit assignments for free.',
      'Optionally register for the proctored exam (SC/ST/PwD/EWS fee waivers available) to earn an IIT/NPTEL/SWAYAM certificate.',
    ],
    officialFees: 'Learning and coursework are 100% Free. Optional proctored certification exam carries a nominal fee (~₹1,000, with 50% fee waiver for SC/ST/PwD).',
    trackingGuidance: 'Track assignment scores and exam hall tickets directly on your SWAYAM learner dashboard.',
    commonMistakes: [
      'Missing the course enrollment cutoff date or exam registration window mid-semester.',
    ],
    faqs: [
      {
        q: 'Are SWAYAM / NPTEL credits recognized by Indian universities?',
        a: 'Yes. Under UGC & AICTE regulations, universities can transfer up to 40% of semester credits earned through SWAYAM courses.',
      },
    ],
    officialWebsiteName: 'SWAYAM — Ministry of Education',
    officialWebsiteUrl: 'https://swayam.gov.in/',
    officialApplyUrl: 'https://swayam.gov.in/',
    sourceUrl: 'https://nptel.ac.in/',
  }),
  makeService({
    slug: 'skill-india-digital-nielit-coding-career-roadmaps',
    title: 'Skill India Digital Hub, NIELIT (CCC/AI/Cybersecurity) & Free Tech/Career Roadmaps',
    category: 'Skill Development & Learning',
    subcategory: 'Vocational Training, Digital Skills & Career Preparation',
    departmentOrAuthority: 'Ministry of Skill Development & Entrepreneurship (MSDE) / NIELIT (MeitY)',
    summary:
      'Access free NSQF courses, PMKVY training centers, NIELIT digital literacy/AI programs, Coding/Web/Data Science learning paths, English communication, and resume/interview guides.',
    overview:
      'Skill India Digital Hub aggregates free Central/State skill courses, PMKVY training centres, and Digital Public Infrastructure career tools, while NIELIT provides affordable government-certified IT, Python, Cybersecurity, and AI courses.',
    whoCanApply: 'Students, freshers, school dropouts, job seekers, and entrepreneurs.',
    eligibilityRequirements: 'Varies by course (open beginner courses up to graduate AI/Cloud tracks).',
    documentsRequired: [
      'Mobile number & basic educational profile on skillindiadigital.gov.in',
      'Passport photo & ID if enrolling in proctored NIELIT CCC / O-Level certification',
    ],
    applicationSteps: [
      'Visit skillindiadigital.gov.in and create a free learner profile.',
      'Explore Skill Courses (Python, Web Dev, Cloud, Digital Marketing, Financial Literacy, Spoken English) or locate nearby PMKVY centres.',
      'For formal MeitY IT certificates (CCC, BCC, O-Level), apply via student.nielit.gov.in.',
    ],
    officialFees: 'Most online Skill India Digital courses and PMKVY schemes are Free; NIELIT exam fees are published on student.nielit.gov.in.',
    trackingGuidance: 'Download Skill India Digital verifiable certificates and track NIELIT admit cards/results on student.nielit.gov.in.',
    commonMistakes: [
      'Paying high fees to unaccredited private coaching centers for certificates that are offered free or at nominal cost by NIELIT/SWAYAM.',
    ],
    faqs: [
      {
        q: 'Can I learn coding, AI, and resume skills for free through verified platforms?',
        a: 'Yes. Skill India Digital, SWAYAM/NPTEL, and AICTE/NASSCOM FutureSkills Prime provide free verified foundational tracks in Coding, Data Science, AI, and Career Readiness.',
      },
    ],
    officialWebsiteName: 'Skill India Digital Hub & NIELIT',
    officialWebsiteUrl: 'https://www.skillindiadigital.gov.in/',
    officialApplyUrl: 'https://www.skillindiadigital.gov.in/',
    sourceUrl: 'https://student.nielit.gov.in/',
  }),

  // ================= BUSINESS & ENTREPRENEURSHIP =================
  makeService({
    slug: 'startup-india-dpiit-recognition-funding',
    title: 'Startup India DPIIT Recognition, Seed Fund & Entrepreneurship Support',
    category: 'Business & Entrepreneurship',
    subcategory: 'Startup Recognition & Government Funding',
    departmentOrAuthority: 'Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce',
    summary:
      'Register your Private Limited, LLP, or Partnership startup for DPIIT Recognition to access Startup India Seed Fund, IPR fee rebates, and GeM procurement relaxation.',
    overview:
      'DPIIT Startup India Recognition gives eligible innovative Indian businesses (<10 years old, turnover <₹100 Cr) access to tax exemptions (80-IAC), Startup India Seed Fund Scheme (SISFS), patent/trademark fee rebates, and public procurement exemptions.',
    whoCanApply: 'Founders of incorporated Private Limited Companies, LLPs, or Registered Partnership Firms working toward innovation or scalable products/services.',
    eligibilityRequirements: 'Entity must be incorporated in India (Sole Proprietorship is not eligible for DPIIT recognition — register Udyam MSME instead).',
    documentsRequired: [
      'Certificate of Incorporation / Partnership Registration & Company PAN',
      'Brief Pitch Deck / Product Innovation Write-up & Website/MVP link',
      'Director / Partner details & Authorization Letter',
    ],
    applicationSteps: [
      'Create an account on startupindia.gov.in and register your company profile.',
      'Navigate to DPIIT Recognition for Startups -> Apply via National Single Window System (nsws.gov.in).',
      'Upload incorporation certificate, director details, and innovation description.',
      'Once DPIIT Certificate is generated, apply for Seed Fund (SISFS) through empanelled incubators.',
    ],
    officialFees: '₹0 (Completely Free government recognition via startupindia.gov.in / nsws.gov.in).',
    trackingGuidance: 'Download your DPIIT Recognition Certificate and track Seed Fund applications on startupindia.gov.in.',
    commonMistakes: [
      'Applying as an unregistered sole proprietorship (incorporate as LLP/Pvt Ltd first, or register under Udyam MSME).',
    ],
    faqs: [
      {
        q: 'Does DPIIT charge any fee for Startup India registration?',
        a: 'No. Startup India DPIIT recognition is completely free on the official government portal.',
      },
    ],
    officialWebsiteName: 'Startup India (DPIIT)',
    officialWebsiteUrl: 'https://www.startupindia.gov.in/',
    officialApplyUrl: 'https://www.nsws.gov.in/',
  }),
  makeService({
    slug: 'gst-fssai-mca-trademark-business-licences',
    title: 'GST Registration, Company/LLP (MCA), FSSAI Food Licence & Trademark (IP India)',
    category: 'Business & Entrepreneurship',
    subcategory: 'Tax Registration, Corporate Filings & Licences',
    departmentOrAuthority: 'CBIC (GST) / Ministry of Corporate Affairs (MCA) / FSSAI / CGPDTM (IP India)',
    summary:
      'Step-by-step official links and checklists for GSTIN registration, Private Limited/LLP incorporation, FSSAI Food Registration/Licence, and Trademark protection.',
    overview:
      'Indian businesses access statutory registrations directly through official central portals: gst.gov.in (GST), mca.gov.in (Companies/LLPs), foscos.fssai.gov.in (Food Business), and ipindia.gov.in (Trademarks & Patents).',
    whoCanApply: 'Entrepreneurs, shop owners, cloud kitchens/food businesses, freelancers crossing thresholds, and incorporated companies.',
    eligibilityRequirements: 'Turnover thresholds or mandatory e-commerce/interstate rules for GST; food handling activity for FSSAI.',
    documentsRequired: [
      'PAN of Applicant / Business & Address Proof of Principal Place of Business (Electricity bill / Rent agreement + NOC)',
      'Bank Account / Cancelled Cheque & Photographs',
      'Digital Signature Certificate (DSC) for Companies/LLPs/Partnerships',
    ],
    applicationSteps: [
      'GST: Visit gst.gov.in -> Services -> Registration -> New Registration (TRN -> ARN).',
      'Company/LLP: Visit mca.gov.in V3 portal -> RUN / SPICe+ (Company) or FiLLiP (LLP).',
      'FSSAI Food Licence: Visit foscos.fssai.gov.in -> Apply for Basic Registration / State / Central Licence.',
      'Trademark: Search public marks first on ipindiaservices.gov.in -> file Form TM-A.',
    ],
    officialFees: 'GST registration is Free (₹0); statutory government fees apply for MCA stamp duty, FSSAI annual fee (Basic ₹100/yr), and Trademark filing (50% rebate for MSMEs/Startups).',
    trackingGuidance: 'Track GST ARN on gst.gov.in, FSSAI application ID on foscos.fssai.gov.in, and TM application number on ipindiaonline.gov.in.',
    commonMistakes: [
      'Filing Trademark without checking existing conflicting marks in the same Nice Class on IP India Public Search.',
    ],
    faqs: [
      {
        q: 'Do Udyam MSMEs get fee concessions on Trademarks?',
        a: 'Yes, individuals, Udyam-registered MSMEs, and DPIIT Startups receive a 50% statutory fee reduction on Trademark filings.',
      },
    ],
    officialWebsiteName: 'GST Portal / MCA / FoSCoS FSSAI / IP India',
    officialWebsiteUrl: 'https://www.gst.gov.in/',
    officialApplyUrl: 'https://foscos.fssai.gov.in/',
    sourceUrl: 'https://www.mca.gov.in/',
  }),

  // ================= TAX & FINANCIAL GUIDANCE =================
  makeService({
    slug: 'ppf-nps-post-office-savings-education-loans',
    title: 'PPF, National Pension System (NPS), Post Office Schemes & Vidya Lakshmi Education Loans',
    category: 'Tax & Financial',
    subcategory: 'Government Savings, Pension & Education Loans',
    departmentOrAuthority: 'Department of Posts / PFRDA / Ministry of Finance (PM-Vidyalaxmi)',
    summary:
      'Educational overview of Public Provident Fund (PPF), Sukanya Samriddhi, NPS/eNPS, Post Office savings, and official education loan portal PM-Vidyalaxmi.',
    overview:
      'Explore central government-backed long-term savings instruments, retirement accounts (NPS), and the official single-window education loan platform (pmvidyalaxmi.co.in / vidyalakshmi.co.in). Bharat Connect provides educational guidance only and does not offer regulated financial advice.',
    whoCanApply: 'Indian residents (PPF/Post Office/NPS) and students admitted to recognized higher-education institutions (PM-Vidyalaxmi).',
    eligibilityRequirements: 'KYC compliant Indian bank account / Post Office savings account; confirmed college admission for education loans.',
    documentsRequired: [
      'PAN Card & Address Proof (KYC)',
      'Admission Letter & Fee Schedule from College/University (for Education Loans)',
    ],
    applicationSteps: [
      'PPF / Sukanya Samriddhi: Open through India Post (indiapost.gov.in) or authorized public/private sector banks.',
      'NPS: Register online directly via enps.nsdl.com or your bank’s POP-SP.',
      'Education Loans: Register on pmvidyalaxmi.co.in, complete the Common Education Loan Application Form (CELAF), and apply to up to multiple banks plus Central Sector Interest Subsidy (CSIS) if eligible.',
    ],
    officialFees: 'Opening a PPF/Post Office account requires nominal minimum deposit (₹500/yr for PPF); PM-Vidyalaxmi portal registration is Free.',
    trackingGuidance: 'Track education loan bank sanction status inside your PM-Vidyalaxmi dashboard.',
    commonMistakes: [
      'Skipping annual minimum deposit (₹500) in PPF, which marks the account inactive.',
    ],
    faqs: [
      {
        q: 'Does Bharat Connect approve education loans or give investment advice?',
        a: 'No. Bharat Connect shares official educational guides and directs you to government-backed portals like PM-Vidyalaxmi and India Post.',
      },
    ],
    officialWebsiteName: 'India Post / eNPS / PM-Vidyalaxmi',
    officialWebsiteUrl: 'https://www.indiapost.gov.in/',
    officialApplyUrl: 'https://pmvidyalaxmi.co.in/',
    sourceUrl: 'https://enps.nsdl.com/',
  }),

  // ================= HEALTH & PUBLIC SERVICES =================
  makeService({
    slug: 'esanjeevani-abha-ors-telemanas-eraktkosh',
    title: 'eSanjeevani Teleconsultation, ABHA Health ID, Govt Hospital OPD (ORS) & Tele-MANAS',
    category: 'Health & Public Services',
    subcategory: 'Public Healthcare, Telemedicine & Mental Health',
    departmentOrAuthority: 'Ministry of Health & Family Welfare (MoHFW) / National Health Authority',
    summary:
      'Book online OPD appointments at AIIMS/Govt hospitals (ORS), consult doctors free via eSanjeevani, create ABHA Health ID, check blood banks (e-RaktKosh), or call Tele-MANAS (14416).',
    overview:
      'India’s Ayushman Bharat Digital Mission (ABDM) provides citizens free online medical teleconsultations (eSanjeevani), online registration at government hospitals (ORS), unified digital health records (ABHA), real-time blood bank stock (e-RaktKosh), and 24x7 toll-free mental health support (Tele-MANAS: 14416).',
    whoCanApply: 'All Indian residents seeking free public healthcare discovery, OPD booking, or mental health support.',
    eligibilityRequirements: 'Open to all citizens across India. Never substitutes emergency clinical care (dial 108 / 112 in medical emergencies).',
    documentsRequired: [
      'Mobile number for eSanjeevani / ORS Patient Portal login',
      'Existing prescriptions or lab reports (optional for teleconsultation)',
    ],
    applicationSteps: [
      'Free Doctor Consultation: Visit esanjeevani.mohfw.gov.in -> Patient Registration -> select State & OPD.',
      'Government Hospital OPD Appointment: Visit ors.gov.in -> choose State/Hospital (e.g., AIIMS, NIMHANS, Victoria/Bowring) -> book OPD slot.',
      '24x7 Mental Health Support: Call toll-free 14416 or 1800-891-4416 (Tele-MANAS, 20+ languages including Kannada, Hindi & English).',
      'Blood Bank Stock: Check live component availability at eraktkosh.mohfw.gov.in.',
    ],
    officialFees: 'eSanjeevani OPD and Tele-MANAS helpline 14416 are 100% Free.',
    trackingGuidance: 'View OPD tokens on ors.gov.in and digital health records on abha.abdm.gov.in.',
    commonMistakes: [
      'Using teleconsultation platforms during acute medical emergencies instead of calling 108 / 112 ambulance services.',
    ],
    faqs: [
      {
        q: 'What is the national toll-free mental health helpline in India?',
        a: 'Tele-MANAS (Ministry of Health & Family Welfare) operates 24/7 toll-free at 14416 and 1800-891-4416 in multiple Indian languages.',
      },
    ],
    officialWebsiteName: 'MoHFW (eSanjeevani / ORS / ABHA / e-RaktKosh)',
    officialWebsiteUrl: 'https://esanjeevani.mohfw.gov.in/',
    officialApplyUrl: 'https://ors.gov.in/',
    sourceUrl: 'https://telemanas.mohfw.gov.in/',
  }),

  // ================= AGRICULTURE & RURAL SERVICES =================
  makeService({
    slug: 'pm-kisan-pmfby-kcc-enam-bhoomi-agriculture',
    title: 'PM-KISAN, Crop Insurance (PMFBY), Soil Health Card, e-NAM & Karnataka Bhoomi RTC',
    category: 'Agriculture & Rural Services',
    subcategory: 'Farmer Welfare, Crop Insurance & Land Records',
    departmentOrAuthority: 'Ministry of Agriculture & Farmers Welfare / Dept. of Revenue, Karnataka',
    summary:
      'Official guides for PM-KISAN income support, PMFBY crop insurance, Kisan Credit Card (KCC), Soil Health Card, e-NAM agricultural markets, and Karnataka Bhoomi RTC/Pahani.',
    overview:
      'Indian farmers and rural citizens can verify PM-KISAN installment status, insure crops against weather risks under PMFBY, sell produce transparently on e-NAM mandis, and access Karnataka Bhoomi land records (RTC/Pahani & Mutation status) online.',
    whoCanApply: 'Landholding farmers, tenant farmers (under state rules), dairy/fisheries farmers (KCC allied), and rural landowners.',
    eligibilityRequirements: 'Valid cultivable land records (RTC/Khata/FRUITS ID in Karnataka) and Aadhaar-seeded bank account for DBT.',
    documentsRequired: [
      'Land Ownership / RTC / Pahani / Khata Extract (FRUITS Farmer ID in Karnataka)',
      'Bank Passbook with Aadhaar-NPCI DBT seeding',
      'Sowing Certificate (for PMFBY crop insurance claims)',
    ],
    applicationSteps: [
      'PM-KISAN: Visit pmkisan.gov.in -> New Farmer Registration / e-KYC / Know Your Status.',
      'Crop Insurance: Enroll via pmfby.gov.in (or Samrakshane portal in Karnataka) before seasonal cut-off.',
      'Karnataka Land Records & FRUITS: Visit landrecords.karnataka.gov.in (Bhoomi) for RTC/Pahani and fruits.karnataka.gov.in for Farmer ID.',
      'Online Mandi Trading: Register at enam.gov.in.',
    ],
    officialFees: 'Farmer registrations on PM-KISAN, FRUITS, and e-NAM are free; nominal subsidized farmer premium applies under PMFBY (2% Kharif, 1.5% Rabi).',
    trackingGuidance: 'Check PM-KISAN installment & e-KYC status at pmkisan.gov.in ("Know Your Status") and crop claim status at pmfby.gov.in.',
    commonMistakes: [
      'Not completing mandatory PM-KISAN e-KYC and land-seeding verification, which pauses ₹2,000 installments.',
    ],
    faqs: [
      {
        q: 'What is FRUITS in Karnataka agriculture services?',
        a: 'FRUITS (Farmer Registration and Unified Beneficiary Information System) is Karnataka’s official single farmer ID used across PM-KISAN, crop insurance, and state farm subsidies.',
      },
    ],
    officialWebsiteName: 'PM-KISAN / PMFBY / e-NAM / Bhoomi Karnataka',
    officialWebsiteUrl: 'https://pmkisan.gov.in/',
    officialApplyUrl: 'https://pmfby.gov.in/',
    sourceUrl: 'https://landrecords.karnataka.gov.in/',
  }),

  // ================= EDUCATION & SCHOLARSHIPS SERVICES =================
  makeService({
    slug: 'pm-vidyalaxmi-education-loan-portal',
    title: 'PM-Vidyalaxmi & Vidya Lakshmi Education Loan Portal Guide',
    category: 'Education & Scholarships',
    subcategory: 'Education Loans & Financial Aid',
    departmentOrAuthority: 'Ministry of Finance & Dept. of Higher Education (PM-Vidyalaxmi)',
    summary:
      'Step-by-step guide to applying for collateral-free education loans, PM-Vidyalaxmi Interest Subvention, and Central Sector Interest Subsidy (CSIS) through a single common form.',
    overview:
      'PM-Vidyalaxmi (and Vidya Lakshmi) lets students admitted to Quality Higher Educational Institutions (QHEIs) or recognized universities submit a Common Education Loan Application Form (CELAF) to multiple scheduled banks simultaneously, along with interest subvention benefits for eligible families.',
    whoCanApply:
      'Indian students who have secured admission to recognized undergraduate, postgraduate, engineering, medical, or management programs.',
    eligibilityRequirements:
      'Confirmed merit-based admission offer; family income thresholds apply for PM-Vidyalaxmi 3% interest subvention (up to ₹8 lakh/yr) and CSIS full moratorium subsidy (up to ₹4.5 lakh/yr).',
    documentsRequired: [
      'Admission Offer Letter & Institute Fee Structure Breakdown',
      'Academic Marks Cards (Class 10, Class 12 & Entrance Rank Card)',
      'Student & Co-Applicant KYC (PAN, Address Proof) — entered strictly on bank/PM-Vidyalaxmi portal',
      'Family Income Certificate issued by Competent Authority (for Interest Subvention / CSIS)',
    ],
    applicationSteps: [
      'Register on pmvidyalaxmi.co.in with student mobile and email verification.',
      'Fill the Common Education Loan Application Form (CELAF) with course, fee, and institution details.',
      'Select up to 3 preferred banks/branches (or search QHEI-eligible interest subvention options).',
      'Upload supporting admission/fee schedule PDFs and submit to chosen bank branches.',
      'Track sanction progress directly on your PM-Vidyalaxmi dashboard and complete physical/video KYC with the sanctioning bank.',
    ],
    officialFees: 'PM-Vidyalaxmi portal registration and application submission are 100% Free.',
    trackingGuidance:
      'Log in to pmvidyalaxmi.co.in to monitor bank-level loan processing status and interest subvention claims.',
    commonMistakes: [
      'Applying before obtaining the official college fee schedule and admission allotment letter.',
      'Paying third-party loan agents for a free government portal application.',
    ],
    faqs: [
      {
        q: 'What is the difference between PM-Vidyalaxmi and Vidya Lakshmi?',
        a: 'PM-Vidyalaxmi is the upgraded central portal providing collateral-free, guarantor-free education loan support and 3% interest subvention for students admitted to listed Quality Higher Educational Institutions alongside standard Vidya Lakshmi bank routing.',
      },
    ],
    officialWebsiteName: 'PM-Vidyalaxmi Portal',
    officialWebsiteUrl: 'https://pmvidyalaxmi.co.in/',
    officialApplyUrl: 'https://pmvidyalaxmi.co.in/',
    sourceUrl: 'https://www.vidyalakshmi.co.in/',
  }),
  makeService({
    slug: 'abc-id-academic-bank-of-credits-digilocker-nad',
    title: 'Academic Bank of Credits (ABC ID) & DigiLocker NAD Verification Guide',
    category: 'Education & Scholarships',
    subcategory: 'Student Academic Documents',
    departmentOrAuthority: 'University Grants Commission (UGC) / Ministry of Education / DigiLocker',
    summary:
      'Create your mandatory 12-digit APAAR / Academic Bank of Credits (ABC ID) and access verified digital marksheets and degree certificates via NAD DigiLocker.',
    overview:
      'The Academic Bank of Credits (ABC / APAAR ID) is mandatory for Indian college and university admissions, exam registrations, and credit transfer under NEP 2020, allowing students to store and verify digital academic credits seamlessly via DigiLocker.',
    whoCanApply:
      'All school, PU, undergraduate, postgraduate, polytechnic, and doctoral students in India.',
    eligibilityRequirements:
      'Enrollment or admission in any UGC/AICTE/state board institution registered on the NAD/ABC portal.',
    documentsRequired: [
      'DigiLocker Account linked with verified mobile number',
      'College / University Roll Number, Registration Number & Year of Admission',
    ],
    applicationSteps: [
      'Visit abc.gov.in or open DigiLocker (digilocker.gov.in) -> Search "Academic Bank of Credits".',
      'Select your University/Board name and enter your Admission Year and Student Roll/Registration Number.',
      'Generate your unique 12-digit ABC / APAAR ID instantly.',
      'Submit the generated ABC ID to your college examination portal or scholarship profile as requested.',
    ],
    officialFees: 'Creating and accessing an ABC ID and NAD digital marksheets is 100% Free.',
    trackingGuidance:
      'Check accumulated semester credits anytime inside abc.gov.in or your DigiLocker "Issued Documents" tab.',
    commonMistakes: [
      'Selecting the wrong autonomous college vs. affiliating university name (e.g., VTU vs. autonomous institute) while generating the ABC ID.',
    ],
    faqs: [
      {
        q: 'Do VTU and state university students need an ABC ID?',
        a: 'Yes. Nearly all central, state, deemed, and affiliating universities including VTU, Bengaluru City University, and Mumbai University require an ABC/APAAR ID for semester exam forms and credit storage.',
      },
    ],
    officialWebsiteName: 'Academic Bank of Credits (UGC)',
    officialWebsiteUrl: 'https://www.abc.gov.in/',
    officialApplyUrl: 'https://www.abc.gov.in/',
    sourceUrl: 'https://nad.digilocker.gov.in/',
  }),

  // ================= GOVERNMENT JOBS SERVICES =================
  makeService({
    slug: 'national-career-service-ncs-employment-portal',
    title: 'National Career Service (NCS) Registration & Govt Employment Exchange Guide',
    category: 'Government Jobs',
    subcategory: 'Employment Exchange & Career Portals',
    departmentOrAuthority: 'Ministry of Labour & Employment, Government of India',
    summary:
      'Register as a Job Seeker on the official National Career Service (NCS) portal to generate your Universal Employment ID, attend Rozgar Melas, and browse verified govt & private openings.',
    overview:
      'National Career Service (ncs.gov.in) is India’s official employment portal integrating state employment exchanges, career counselling centers, skill providers, and verified central/private job vacancies without any registration fee.',
    whoCanApply:
      'Indian citizens aged 14+ (or 18+ for adult roles) across Class 10, ITI, Diploma, Graduate, and Postgraduate qualifications.',
    eligibilityRequirements:
      'Valid mobile number, email ID, educational qualification records, and skills summary.',
    documentsRequired: [
      'Mobile number & Email ID for OTP login on ncs.gov.in',
      'Educational qualification certificates & marksheets (reference details)',
      'Category / PwD certificate details (if applicable for reserved job alerts)',
    ],
    applicationSteps: [
      'Visit ncs.gov.in -> Click Register -> Choose "Jobseeker".',
      'Complete profile details including highest education, skills, preferred locations, and UAN/ID details directly on ncs.gov.in.',
      'Generate your downloadable NCS Registration Card / Unique Jobseeker ID.',
      'Search verified vacancies, apply to Government/PSU postings, or book free career counselling sessions.',
    ],
    officialFees: 'NCS Jobseeker Registration, Career Counselling & Rozgar Mela participation are 100% Free.',
    trackingGuidance:
      'Log in to ncs.gov.in -> Jobseeker Dashboard to monitor applied jobs and interview invites.',
    commonMistakes: [
      'Paying fraudulent job websites or agents claiming "NCS paid placement fees". Official NCS services never charge jobseekers.',
    ],
    faqs: [
      {
        q: 'Is NCS registration free for students and job seekers?',
        a: 'Yes. Registration, career guidance, and applying to jobs on ncs.gov.in are completely free of cost.',
      },
    ],
    officialWebsiteName: 'National Career Service (NCS)',
    officialWebsiteUrl: 'https://www.ncs.gov.in/',
    officialApplyUrl: 'https://www.ncs.gov.in/',
    sourceUrl: 'https://labour.gov.in/',
  }),
  makeService({
    slug: 'karnataka-kpsc-kea-one-time-registration-kaushalkar',
    title: 'KPSC, KEA & Karnataka Kaushalkar Job Portal Registration Guide',
    category: 'Government Jobs',
    subcategory: 'Karnataka State Recruitment & Skill Connect',
    departmentOrAuthority: 'Karnataka Public Service Commission (KPSC) / Skill Development Dept.',
    jurisdiction: 'State',
    state: 'Karnataka',
    summary:
      'Guide to KPSC One-Time Registration (OTR), KEA Group A/B/C/D direct recruitment portals, and Karnataka Kaushalkar Skill Connect employment matching.',
    overview:
      'Aspirants applying for Karnataka State Government vacancies (KAS, FDA, SDA, PDO, Police, Assistant Engineer, Group C/D) must maintain an accurate KPSC One-Time Registration profile and track official KPSC/KEA recruitment notifications alongside state Skill Connect (Kaushalkar) drives.',
    whoCanApply:
      'Candidates meeting Karnataka state recruitment domicile, Kannada language requirement, and educational eligibility criteria.',
    eligibilityRequirements:
      'SSLC / PUC / Diploma / Degree / PG as notified per post, plus Kannada language proficiency and valid Karnataka reservation/rural/Kannada medium certificates if claimed.',
    documentsRequired: [
      'SSLC Marks Card (proof of Date of Birth & Kannada language)',
      'Degree / Diploma Provisional or Convocation Certificate',
      'Caste, Income, Rural Study (1–10th), Kannada Medium & Hyderabad-Karnataka (371J) certificates if applicable',
    ],
    applicationSteps: [
      'Visit kpsc.kar.nic.in and complete the KPSC One-Time Registration (OTR) profile with accurate photograph and signature.',
      'Carefully claim applicable Karnataka reservation categories (GM / 2A / 2B / 3A / 3B / SC / ST / 371J / Rural / Kannada Medium) only if valid RD certificates are already issued.',
      'Apply for active recruitment notifications before fee-challan / online payment cutoff.',
      'For state skill-matched private & apprenticeship jobs in Karnataka, register on kaushalkar.com (Karnataka Skill Connect).',
    ],
    officialFees:
      'Kaushalkar registration is Free. KPSC recruitment fees vary by category (typically ₹600 GM, ₹300 Cat 2A/2B/3A/3B, exempted for SC/ST/Cat-1/PwD as per notification).',
    trackingGuidance:
      'Download Hall Tickets, Provisional Key Answers, and Final Selection Lists directly from kpsc.kar.nic.in or cetonline.karnataka.gov.in/kea.',
    commonMistakes: [
      'Claiming Rural/Kannada Medium/371J reservation before getting the official Tahsildar certificate signed with RD number.',
    ],
    faqs: [
      {
        q: 'Where do I check official Karnataka Govt vacancies besides KPSC?',
        a: 'Monitor kpsc.kar.nic.in, cetonline.karnataka.gov.in/kea, ksp-recruitment.in (Karnataka State Police), and kaushalkar.com.',
      },
    ],
    officialWebsiteName: 'KPSC Karnataka / Kaushalkar',
    officialWebsiteUrl: 'https://kpsc.kar.nic.in/',
    officialApplyUrl: 'https://kpsc.kar.nic.in/',
    sourceUrl: 'https://kaushalkar.com/',
  }),
];

export async function ensureExpandedPublicServices(): Promise<void> {
  await db
    .insert(publicServices)
    .values(EXPANDED_PUBLIC_SERVICES)
    .onConflictDoNothing({ target: publicServices.slug });
}
