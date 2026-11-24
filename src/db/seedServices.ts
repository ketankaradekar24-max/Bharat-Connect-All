import { count } from 'drizzle-orm';
import { db } from './index.ts';
import { publicServices } from './schema.ts';

export const VERIFIED_PUBLIC_SERVICES = [
  {
    slug: 'driving-licence-learners-and-permanent-parivahan',
    title: "Driving Licence (Learner's & Permanent DL) — Parivahan Sarathi",
    category: 'Driving Licence & Transport',
    subcategory: "Learner's & Permanent Driving Licence",
    departmentOrAuthority: 'Ministry of Road Transport & Highways / State Transport Department (RTO)',
    jurisdiction: 'Central',
    state: 'All India',
    country: null,
    summary:
      'Step-by-step official guidance to apply for a Learner Licence, book an RTO driving test, renew an expired licence, or request a duplicate DL through Parivahan.',
    overview:
      'In India, Learner Licences, Permanent Driving Licences, renewals, address changes, and International Driving Permits are processed online through the official Sarathi Parivahan portal connected to your state RTO (including Karnataka RTOs).',
    whoCanApply:
      'Indian residents meeting minimum age rules: 16+ for gearless scooters up to 50cc (with guardian consent), 18+ for standard motorcycles and light motor vehicles (LMV), and 20+ for transport vehicles.',
    eligibilityRequirements:
      'Must satisfy age criteria, hold a valid Learner Licence for at least 30 days (and within 180 days) before taking the Permanent DL driving skill test, and meet basic medical fitness norms (Form 1 / Form 1A for age 40+).',
    documentsRequired: [
      'Proof of Age (SSLC marks card, Birth Certificate, PAN, or Passport)',
      'Proof of Address (Voter ID, Passport, utility bill, or official address proof)',
      'Passport-size photographs & scanned signature',
      'Form 1 Self-Declaration of Physical Fitness (Form 1A medical certificate if age >= 40)',
      'Valid Learner Licence number (when applying for Permanent DL)',
    ],
    applicationSteps: [
      'Visit sarathi.parivahan.gov.in and select your State (e.g., Karnataka).',
      'Choose "Apply for Learner Licence" (or "Apply for Driving Licence" if you already hold an LL).',
      'Fill personal, address, and vehicle class details (MCWG / LMV) accurately.',
      'Upload scanned documents, photo, and signature as instructed for your state RTO.',
      'Pay the official RTO application fee directly on the Parivahan payment gateway.',
      'Complete the online LL test (where contactless enabled) or book an RTO slot for driving skill test.',
    ],
    officialFees:
      'Official Central/State RTO fees apply per vehicle class and test slot. Always verify exact fee breakdown shown inside sarathi.parivahan.gov.in before paying.',
    appointmentProcess:
      'After fee payment, book an RTO test slot under "Appointments -> Slot Booking" on Sarathi Parivahan. Carry original documents to the RTO track on your slot date.',
    trackingGuidance:
      'Use "Application Status" on sarathi.parivahan.gov.in with your Application Number and Date of Birth to check official RTO verification and smart-card dispatch status.',
    commonMistakes: [
      'Booking a Permanent DL test before completing 30 days on your Learner Licence.',
      'Uploading blurry address proof or mismatched name spellings across documents.',
      'Using unofficial agent websites instead of the official .gov.in Parivahan portal.',
    ],
    faqs: [
      {
        q: 'Can I apply for a Karnataka Driving Licence through Parivahan?',
        a: 'Yes. Select Karnataka on sarathi.parivahan.gov.in to access Karnataka RTO Learner Licence, Permanent DL, renewal, and duplicate services.',
      },
      {
        q: 'Does Bharat Connect submit my driving licence application?',
        a: 'No. Bharat Connect only explains the steps and checklists. You must authenticate, upload documents, pay fees, and submit directly on sarathi.parivahan.gov.in.',
      },
    ],
    translations: {
      kn: {
        title: 'ಚಾಲನಾ ಪರವಾನಗಿ (ಲರ್ನರ್ ಮತ್ತು ಪರ್ಮನೆಂಟ್ DL) — ಪರಿವಾಹನ್ ಸಾರಥಿ',
        summary:
          'ಪರಿವಾಹನ್ ಸಾರಥಿ ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಮೂಲಕ ಲರ್ನರ್ ಲೈಸೆನ್ಸ್, ಪರ್ಮನೆಂಟ್ ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್, ನವೀಕರಣ ಮತ್ತು RTO ಸ್ಲಾಟ್ ಬುಕಿಂಗ್ ಮಾರ್ಗದರ್ಶಿ.',
        overview:
          'ಕರ್ನಾಟಕ ಸೇರಿದಂತೆ ಭಾರತದಾದ್ಯಂತ ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ಅರ್ಜಿಗಳನ್ನು ಅಧಿಕೃತ sarathi.parivahan.gov.in ಪೋರ್ಟಲ್ ಮೂಲಕ ಸಲ್ಲಿಸಬೇಕು.',
      },
      hi: {
        title: 'ड्राइविंग लाइसेंस (लर्नर और स्थायी DL) — परिवहन सारथी',
        summary:
          'आधिकारिक परिवहन सारथी पोर्टल के माध्यम से लर्नर लाइसेंस, स्थायी ड्राइविंग लाइसेंस, नवीनीकरण और RTO टेस्ट स्लॉट की चरणबद्ध जानकारी।',
        overview:
          'भारत में ड्राइविंग लाइसेंस और वाहन संबंधी सभी आधिकारिक सेवाएं parivahan.gov.in और sarathi.parivahan.gov.in पर उपलब्ध हैं।',
      },
    },
    officialWebsiteName: 'Parivahan Sewa (Ministry of Road Transport & Highways)',
    officialWebsiteUrl: 'https://parivahan.gov.in/',
    officialApplyUrl: 'https://sarathi.parivahan.gov.in/',
    sourceUrl: 'https://parivahan.gov.in/',
    isThirdParty: false,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'indian-passport-new-and-renewal-passport-seva',
    title: 'Passport Services (New Passport, Reissue & Police Verification) — Passport Seva',
    category: 'Passport & Visa',
    subcategory: 'Passport Application & Reissue',
    departmentOrAuthority: 'Ministry of External Affairs, Government of India',
    jurisdiction: 'Central',
    state: 'All India',
    country: null,
    summary:
      'Official step-by-step guidance for fresh passport applications, passport renewal/reissue, PSK appointment booking, and police verification.',
    overview:
      'All Indian citizen passport applications (Fresh, Reissue, Lost/Damaged, Address Change, and Tatkaal) are handled exclusively through the Ministry of External Affairs Passport Seva portal and Passport Seva Kendras (PSK / POPSK).',
    whoCanApply:
      'Indian citizens applying for a first-time passport, renewing an expiring/expired passport, updating personal particulars, or replacing a lost/damaged passport.',
    eligibilityRequirements:
      'Applicant must be an Indian citizen with valid identity, address, and date-of-birth proof as listed by the Passport Seva Document Advisor.',
    documentsRequired: [
      'Proof of Present Address (Electricity/Water/Telephone bill, Bank Passbook, Rent Agreement, or Voter ID)',
      'Proof of Date of Birth (Birth Certificate, SSLC/Class 10 Certificate, PAN, or Transfer Certificate)',
      'Old Passport in original (for Reissue / Renewal)',
      'FIR copy & Annexure F (only in case of Lost / Damaged passport)',
      'Student Bonafide / Hostel letter (if applying at college city address)',
    ],
    applicationSteps: [
      'Register and log in at the official portal passportindia.gov.in.',
      'Select "Apply for Fresh Passport / Re-issue of Passport" and fill the online application form.',
      'Verify every spelling carefully against your educational and identity documents.',
      'Pay the official Passport Seva fee online and schedule an appointment at your nearest PSK or POPSK.',
      'Print your Appointment Receipt and attend the PSK in person with all original documents.',
      'Complete Police Verification at your local police station / home visit when notified.',
    ],
    officialFees:
      'Standard 36-page / 60-page booklet and Tatkaal fees are published in the Official Fee Calculator on passportindia.gov.in.',
    appointmentProcess:
      'Appointments are booked online on passportindia.gov.in after fee payment. Arrive 15 minutes before your reporting time at the PSK/POPSK with original documents.',
    trackingGuidance:
      'Track your File Number on passportindia.gov.in ("Track Application Status") for PSK processing, Police Verification, and India Post Speed Post dispatch updates.',
    commonMistakes: [
      'Mismatch between current residential address and address proof provided for police verification.',
      'Paying third-party consultant sites that charge extra fees for free portal forms.',
      'Ignoring SMS/email updates from your local police station during verification.',
    ],
    faqs: [
      {
        q: 'Can students apply using their college hostel address?',
        a: 'Yes, students staying away from their permanent home can check the Passport Seva Document Advisor for hostel/bonafide address requirements.',
      },
      {
        q: 'Does Bharat Connect handle passport appointments or payments?',
        a: 'No. Always pay fees and book PSK appointments only on passportindia.gov.in.',
      },
    ],
    translations: {
      kn: {
        title: 'ಭಾರತೀಯ ಪಾಸ್‌ಪೋರ್ಟ್ (ಹೊಸ ಅರ್ಜಿ ಮತ್ತು ನವೀಕರಣ) — ಪಾಸ್‌ಪೋರ್ಟ್ ಸೇವಾ',
        summary:
          'ಹೊಸ ಪಾಸ್‌ಪೋರ್ಟ್, ನವೀಕರಣ, PSK ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಮತ್ತು ಪೊಲೀಸ್ ಪರಿಶೀಲನೆಗೆ ಅಧಿಕೃತ passportindia.gov.in ಮಾರ್ಗದರ್ಶಿ.',
        overview:
          'ಭಾರತೀಯ ಪಾಸ್‌ಪೋರ್ಟ್ ಸೇವೆಗಳು ವಿದೇಶಾಂಗ ವ್ಯವಹಾರಗಳ ಸಚಿವಾಲಯದ ಅಧಿಕೃತ passportindia.gov.in ಪೋರ್ಟಲ್ ಮೂಲಕ ಮಾತ್ರ ಲಭ್ಯವಿದೆ.',
      },
      hi: {
        title: 'भारतीय पासपोर्ट (नया आवेदन और नवीनीकरण) — पासपोर्ट सेवा',
        summary:
          'नए पासपोर्ट, रिन्यूअल, PSK अपॉइंटमेंट बुकिंग और पुलिस वेरिफिकेशन के लिए आधिकारिक passportindia.gov.in मार्गदर्शन।',
        overview:
          'सभी भारतीय पासपोर्ट सेवाएं विदेश मंत्रालय के आधिकारिक पोर्टल passportindia.gov.in के माध्यम से संचालित होती हैं।',
      },
    },
    officialWebsiteName: 'Passport Seva (Ministry of External Affairs)',
    officialWebsiteUrl: 'https://www.passportindia.gov.in/',
    officialApplyUrl: 'https://www.passportindia.gov.in/',
    sourceUrl: 'https://www.passportindia.gov.in/',
    isThirdParty: false,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'pan-card-application-and-correction-india',
    title: 'PAN Card Application, Correction & Reprint Guidance',
    category: 'Government Documents',
    subcategory: 'PAN Card Services',
    departmentOrAuthority: 'Income Tax Department, Government of India',
    jurisdiction: 'Central',
    state: 'All India',
    country: null,
    summary:
      'Understand official routes to apply for a new PAN card, correct name/DOB errors, or request a PAN reprint without collecting Aadhaar or OTPs on third-party sites.',
    overview:
      'Permanent Account Number (PAN) is issued by the Income Tax Department of India. Citizens can apply through authorized official portals (Income Tax Instant e-PAN, Protean/NSDL e-Gov, or UTIITSL).',
    whoCanApply:
      'Indian citizens, students opening bank/scholarship accounts, professionals, and organizations needing a 10-character PAN.',
    eligibilityRequirements:
      'Valid proof of identity, proof of address, and proof of date of birth.',
    documentsRequired: [
      'Proof of Identity (Voter ID, Passport, Driving Licence, or official photo ID)',
      'Proof of Address (Passport, Utility Bill, Bank Statement, or Voter ID)',
      'Proof of Date of Birth (SSLC marks card, Birth Certificate, or Passport)',
      'Existing PAN copy (if applying for correction or reprint)',
    ],
    applicationSteps: [
      'Visit incometax.gov.in to review authorized PAN services and Instant e-PAN options.',
      'Select Form 49A (for Indian citizens) for a new PAN, or the PAN Correction/Reprint form.',
      'Enter your legal name, date of birth, and address exactly as on your supporting documents.',
      'Complete verification and official fee payment directly on the Income Tax / authorized portal.',
      'Save your 15-digit Acknowledgement Number to track dispatch status.',
    ],
    officialFees:
      'Instant e-PAN on incometax.gov.in is free; physical PAN card dispatch via Protean/UTIITSL carries standard notified government processing fees.',
    appointmentProcess: null,
    trackingGuidance:
      'Use your 15-digit Acknowledgement Number on the official Income Tax / Protean / UTIITSL status tracker.',
    commonMistakes: [
      'Sharing Aadhaar OTPs or bank details on unofficial lookalike websites.',
      'Entering initials differently from your Class 10 marks card or bank account.',
    ],
    faqs: [
      {
        q: 'Should I enter my Aadhaar number on Bharat Connect for PAN guidance?',
        a: 'Never. Bharat Connect does not collect Aadhaar numbers or OTPs. Enter identity details only on official Income Tax / authorized portals.',
      },
    ],
    translations: {
      kn: {
        title: 'ಪ್ಯಾನ್ ಕಾರ್ಡ್ (PAN) ಅರ್ಜಿ ಮತ್ತು ತಿದ್ದುಪಡಿ ಮಾರ್ಗದರ್ಶಿ',
        summary:
          'ಹೊಸ ಪ್ಯಾನ್ ಕಾರ್ಡ್ ಅರ್ಜಿ, ಹೆಸರು/ಜನ್ಮದಿನಾಂಕ ತಿದ್ದುಪಡಿ ಮತ್ತು ಮರುಮುದ್ರಣಕ್ಕಾಗಿ ಅಧಿಕೃತ ಆದಾಯ ತೆರಿಗೆ ಇಲಾಖೆಯ ಮಾರ್ಗದರ್ಶಿ.',
      },
      hi: {
        title: 'पैन कार्ड (PAN) आवेदन और सुधार मार्गदर्शन',
        summary:
          'नया पैन कार्ड बनवाने, नाम/जन्मतिथि सुधार और रीप्रिंट के लिए आधिकारिक आयकर विभाग पोर्टल की चरणबद्ध जानकारी।',
      },
    },
    officialWebsiteName: 'Income Tax Department e-Filing Portal',
    officialWebsiteUrl: 'https://www.incometax.gov.in/',
    officialApplyUrl: 'https://www.incometax.gov.in/',
    sourceUrl: 'https://www.incometax.gov.in/',
    isThirdParty: false,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'voter-id-registration-and-correction-eci',
    title: 'Voter ID Registration (Form 6) & Corrections (Form 8) — ECI',
    category: 'Government Documents',
    subcategory: 'Voter ID Services',
    departmentOrAuthority: 'Election Commission of India (ECI)',
    jurisdiction: 'Central',
    state: 'All India',
    country: null,
    summary:
      'Official guide to register as a new voter at age 18+, transfer constituency address, or correct personal details on the Voter Services Portal.',
    overview:
      'The Election Commission of India provides online voter registration (Form 6), correction/address shifting (Form 8), and EPIC download via voters.eci.gov.in.',
    whoCanApply:
      'Indian citizens who have attained 18 years of age (or applying in advance as eligible) and ordinarily reside in the constituency.',
    eligibilityRequirements:
      'Indian citizenship, age 18+ on qualifying date, and proof of ordinary residence in the polling area.',
    documentsRequired: [
      'Recent passport-size photograph',
      'Proof of Age (Birth Certificate, SSLC/Class 10 certificate, Passport, or PAN)',
      'Proof of Residence (Electricity/Gas/Water bill, Bank Passbook, Rent Agreement, or Passport)',
    ],
    applicationSteps: [
      'Create an account on voters.eci.gov.in.',
      'Select Form 6 for new voter registration, or Form 8 for address shift/correction.',
      'Fill state, district, assembly constituency, and personal particulars.',
      'Upload age and residence documents and submit to receive your Reference ID.',
    ],
    officialFees: 'Free — there is zero official government fee for Voter ID registration.',
    appointmentProcess:
      'A Booth Level Officer (BLO) may verify residence details locally after online submission.',
    trackingGuidance:
      'Check status anytime under "Track Application Status" on voters.eci.gov.in using your Reference ID.',
    commonMistakes: [
      'Submitting multiple Form 6 applications instead of Form 8 when changing address.',
      'Uploading unreadable utility bills without applicant or parent name.',
    ],
    faqs: [
      {
        q: 'Is there any fee to register for a Voter ID?',
        a: 'No. Voter registration and updates on voters.eci.gov.in are completely free.',
      },
    ],
    translations: {
      kn: {
        title: 'ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ (Voter ID) ನೋಂದಣಿ ಮತ್ತು ತಿದ್ದುಪಡಿ — ECI',
        summary:
          'voters.eci.gov.in ಮೂಲಕ ಹೊಸ ಮತದಾರರ ನೋಂದಣಿ (ಫಾರ್ಮ್ 6) ಮತ್ತು ವಿಳಾಸ/ಹೆಸರು ತಿದ್ದುಪಡಿ (ಫಾರ್ಮ್ 8) ಉಚಿತ ಸೇವೆಗಳ ಮಾರ್ಗದರ್ಶಿ.',
      },
      hi: {
        title: 'मतदाता पहचान पत्र (वोटर आईडी) पंजीकरण और सुधार — ECI',
        summary:
          'voters.eci.gov.in पर नए वोटर पंजीकरण (फॉर्म 6) और पता या नाम सुधार (फॉर्म 8) की निःशुल्क आधिकारिक प्रक्रिया।',
      },
    },
    officialWebsiteName: 'Voters Service Portal (Election Commission of India)',
    officialWebsiteUrl: 'https://voters.eci.gov.in/',
    officialApplyUrl: 'https://voters.eci.gov.in/',
    sourceUrl: 'https://voters.eci.gov.in/',
    isThirdParty: false,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'karnataka-caste-income-residence-certificates-nadakacheri',
    title: 'Karnataka Caste, Income & Residence Certificates (Nadakacheri / Seva Sindhu)',
    category: 'Government Documents',
    subcategory: 'Karnataka State Certificates',
    departmentOrAuthority: 'Revenue Department (Atalji Janasnehi Kendra), Government of Karnataka',
    jurisdiction: 'State',
    state: 'Karnataka',
    country: null,
    summary:
      'Essential Karnataka guide for obtaining RD-numbered Caste, Income, Domicile/Residence, and EWS certificates required for SSP scholarships and admissions.',
    overview:
      'Students applying for Karnataka SSP scholarships, KCET counselling, or state fee concessions need valid RD-numbered Caste and Income certificates issued by the Revenue Department through Nadakacheri or Seva Sindhu.',
    whoCanApply:
      'Residents and students domiciled in Karnataka needing official Revenue Department certificates.',
    eligibilityRequirements:
      'Must reside in the Karnataka taluk/hobli jurisdiction where the application is submitted, with valid family ration/residence and income proof.',
    documentsRequired: [
      'Applicant and parent identity / residence proof',
      'Ration Card / Residence proof / Electricity bill',
      'Self-declaration / family income proof (salary slip or employer/revenue verification)',
      'School / College study certificate or SSLC marks card (for caste/domicile verification)',
    ],
    applicationSteps: [
      'Visit nadakacheri.karnataka.gov.in (or sevasindhu.karnataka.gov.in / nearest Nada Kacheri / KarnatakaOne / GramaOne centre).',
      'Select the required certificate (Caste, Income, Caste & Income, Residence/Domicile, or EWS).',
      'Verify applicant details, taluk, hobli, and village/ward accurately.',
      'Upload required supporting proofs and pay the nominal prescribed state service fee.',
      'Save the acknowledgement number; once approved, note the 15-character RD Number for SSP/KCET.',
    ],
    officialFees:
      'Nominal prescribed Karnataka Revenue Department / Seva Sindhu user charges apply (confirm exact receipt fee on the official portal).',
    appointmentProcess:
      'Online applications go to the local Village Accountant / Revenue Inspector for field verification before Tahsildar digital signature.',
    trackingGuidance:
      'Check application approval and verify certificate authenticity using the Application / RD Number on nadakacheri.karnataka.gov.in.',
    commonMistakes: [
      'Waiting until the final week of SSP scholarship deadlines to apply for a new RD certificate.',
      'Applying under the wrong taluk/hobli or spelling the student name differently from SSLC records.',
    ],
    faqs: [
      {
        q: 'Why is the RD number important in Karnataka?',
        a: 'Portals like Karnataka SSP and KCET verify your Caste and Income certificates digitally using the unique RD number issued by Nadakacheri.',
      },
    ],
    translations: {
      kn: {
        title: 'ಕರ್ನಾಟಕ ಜಾತಿ, ಆದಾಯ ಮತ್ತು ವಾಸಸ್ಥಳ ಪ್ರಮಾಣಪತ್ರಗಳು (ನಾಡಕಚೇರಿ / ಸೇವಾ ಸಿಂಧು)',
        summary:
          'SSP ವಿದ್ಯಾರ್ಥಿವೇತನ ಮತ್ತು KCET ಪ್ರವೇಶಕ್ಕೆ ಅಗತ್ಯವಿರುವ RD ಸಂಖ್ಯೆಯ ಜಾತಿ, ಆದಾಯ ಮತ್ತು ವಾಸಸ್ಥಳ ಪ್ರಮಾಣಪತ್ರ ಪಡೆಯುವ ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ.',
        overview:
          'ಕರ್ನಾಟಕ ಕಂದಾಯ ಇಲಾಖೆಯ ನಾಡಕಚೇರಿ (nadakacheri.karnataka.gov.in) ಅಥವಾ ಸೇವಾ ಸಿಂಧು ಮೂಲಕ ಅಧಿಕೃತ ಪ್ರಮಾಣಪತ್ರಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು.',
      },
      hi: {
        title: 'कर्नाटक जाति, आय और निवास प्रमाण पत्र (नाडकाचेरी / सेवा सिंधु)',
        summary:
          'कर्नाटक SSP छात्रवृत्ति और प्रवेश के लिए आवश्यक RD नंबर वाले जाति, आय और निवास प्रमाण पत्र प्राप्त करने की जानकारी।',
      },
    },
    officialWebsiteName: 'Nadakacheri — Government of Karnataka',
    officialWebsiteUrl: 'https://nadakacheri.karnataka.gov.in/',
    officialApplyUrl: 'https://nadakacheri.karnataka.gov.in/',
    sourceUrl: 'https://nadakacheri.karnataka.gov.in/',
    isThirdParty: false,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'karnataka-seva-sindhu-citizen-and-welfare-portal',
    title: 'Karnataka Seva Sindhu — State Welfare Schemes & Citizen Services',
    category: 'Government Schemes',
    subcategory: 'Karnataka State Welfare Schemes',
    departmentOrAuthority: 'Directorate of Electronic Delivery of Citizen Services (EDCS), Govt. of Karnataka',
    jurisdiction: 'State',
    state: 'Karnataka',
    country: null,
    summary:
      'Central Karnataka state gateway for guarantee schemes, citizen certificates, transport services, and department welfare applications.',
    overview:
      'Seva Sindhu is the Government of Karnataka single-window citizen service portal hosting hundreds of state government services across Revenue, Transport, Labour, Women & Child Welfare, and Food & Civil Supplies.',
    whoCanApply:
      'Karnataka residents, students, women beneficiaries, senior citizens, and workers eligible under specific Karnataka state schemes.',
    eligibilityRequirements:
      'Eligibility varies by specific scheme (e.g., family ration card status, Karnataka domicile, income limits, or age criteria).',
    documentsRequired: [
      'Karnataka Ration Card (for household/welfare schemes)',
      'Bank account details linked for DBT',
      'Relevant department proof (e.g., college admission, disability UDID, or residence proof)',
    ],
    applicationSteps: [
      'Open the official Seva Sindhu portal at sevasindhu.karnataka.gov.in.',
      'Log in or visit an authorized KarnatakaOne / BengaluruOne / GramaOne centre.',
      'Search for the exact department scheme or certificate you need.',
      'Review the scheme-specific eligibility notice and upload required proofs.',
      'Submit and retain your Seva Sindhu Acknowledgement ID.',
    ],
    officialFees:
      'Most welfare scheme applications are free online; nominal service charges apply at citizen centres as notified by EDCS.',
    appointmentProcess: null,
    trackingGuidance:
      'Use "Track Your Application Status" on sevasindhu.karnataka.gov.in with your Application Reference Number.',
    commonMistakes: [
      'Using unofficial lookalike URLs instead of sevasindhu.karnataka.gov.in.',
      'Submitting with an unseeded bank account for Direct Benefit Transfer schemes.',
    ],
    faqs: [
      {
        q: 'Are all Karnataka state schemes free to apply online?',
        a: 'Welfare scheme submissions on Seva Sindhu generally carry zero application fee; always check the official service fee notice on sevasindhu.karnataka.gov.in.',
      },
    ],
    translations: {
      kn: {
        title: 'ಕರ್ನಾಟಕ ಸೇವಾ ಸಿಂಧು — ರಾಜ್ಯ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು ಮತ್ತು ನಾಗರಿಕ ಸೇವೆಗಳು',
        summary:
          'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು, ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ನಾಗರಿಕ ಸೇವೆಗಳಿಗಾಗಿ ಅಧಿಕೃತ sevasindhu.karnataka.gov.in ಮಾರ್ಗದರ್ಶಿ.',
      },
      hi: {
        title: 'कर्नाटक सेवा सिंधु — राज्य कल्याण योजनाएं और नागरिक सेवाएं',
        summary:
          'कर्नाटक सरकार की कल्याणकारी योजनाओं और नागरिक सेवाओं के लिए आधिकारिक sevasindhu.karnataka.gov.in मार्गदर्शन।',
      },
    },
    officialWebsiteName: 'Seva Sindhu — Government of Karnataka',
    officialWebsiteUrl: 'https://sevasindhu.karnataka.gov.in/',
    officialApplyUrl: 'https://sevasindhu.karnataka.gov.in/',
    sourceUrl: 'https://sevasindhu.karnataka.gov.in/',
    isThirdParty: false,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'udyam-msme-registration-india',
    title: 'Udyam Registration for Small Businesses & Startups (MSME)',
    category: 'Business & Entrepreneurship',
    subcategory: 'Business & MSME Registration',
    departmentOrAuthority: 'Ministry of Micro, Small and Medium Enterprises, Government of India',
    jurisdiction: 'Central',
    state: 'All India',
    country: null,
    summary:
      'Official free MSME Udyam registration guide for entrepreneurs, freelancers, manufacturers, and service startups in India.',
    overview:
      'Udyam Registration is the official Government of India registration for Micro, Small, and Medium Enterprises. It provides an Udyam Registration Certificate required to access MSME schemes, priority banking, and government tender benefits.',
    whoCanApply:
      'Proprietorships, partnerships, LLPs, private limited companies, and self-employed entrepreneurs meeting MSME investment and turnover thresholds.',
    eligibilityRequirements:
      'Valid enterprise PAN/GST details (as applicable) and qualifying MSME classification limits.',
    documentsRequired: [
      'PAN of the proprietor / business entity',
      'GSTIN (if applicable under GST rules)',
      'Bank account number & IFSC of the business',
      'NIC business activity code and employee count details',
    ],
    applicationSteps: [
      'Visit only the official portal udyamregistration.gov.in.',
      'Select "For New Entrepreneurs who are not Registered yet as MSME".',
      'Enter entrepreneur/entity details, bank info, and NIC activity classification directly on the .gov.in portal.',
      'Submit and download your Udyam Registration Certificate.',
    ],
    officialFees:
      'FREE — Udyam Registration is 100% free on udyamregistration.gov.in. Beware of private websites charging money.',
    appointmentProcess: null,
    trackingGuidance:
      'Verify or print your Udyam Certificate anytime on udyamregistration.gov.in under "Print / Verify".',
    commonMistakes: [
      'Paying fees on private consultancy websites that mimic the official MSME portal.',
      'Selecting incorrect NIC activity codes for your primary business service.',
    ],
    faqs: [
      {
        q: 'Does Udyam registration guarantee a business loan or grant?',
        a: 'No. Udyam is an official enterprise registration certificate; loans or grants are evaluated separately by banks and scheme authorities.',
      },
    ],
    translations: {
      kn: {
        title: 'ಉದ್ಯಮ್ (Udyam) MSME ಸಣ್ಣ ವ್ಯಾಪಾರ ನೋಂದಣಿ ಮಾರ್ಗದರ್ಶಿ',
        summary:
          'udyamregistration.gov.in ನಲ್ಲಿ ಸಣ್ಣ ವ್ಯಾಪಾರಗಳು ಮತ್ತು ಸ್ಟಾರ್ಟ್‌ಅಪ್‌ಗಳಿಗೆ ಸಂಪೂರ್ಣ ಉಚಿತ MSME ನೋಂದಣಿ ಮಾರ್ಗದರ್ಶಿ.',
      },
      hi: {
        title: 'उद्यम (Udyam) MSME व्यवसाय पंजीकरण मार्गदर्शन',
        summary:
          'आधिकारिक udyamregistration.gov.in पोर्टल पर छोटे व्यवसायों और स्टार्टअप्स के लिए पूरी तरह निःशुल्क MSME पंजीकरण जानकारी।',
      },
    },
    officialWebsiteName: 'Udyam Registration Portal (Ministry of MSME)',
    officialWebsiteUrl: 'https://udyamregistration.gov.in/',
    officialApplyUrl: 'https://udyamregistration.gov.in/',
    sourceUrl: 'https://udyamregistration.gov.in/',
    isThirdParty: false,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'upsc-ssc-government-jobs-and-exams-guide',
    title: 'UPSC & SSC Government Recruitment & Competitive Exam Portals',
    category: 'Competitive Exams',
    subcategory: 'Central Civil Services & SSC Exams',
    departmentOrAuthority: 'Union Public Service Commission (UPSC) & Staff Selection Commission (SSC)',
    jurisdiction: 'Central',
    state: 'All India',
    country: null,
    summary:
      'Direct access to verified UPSC and SSC official notifications, One-Time Registration (OTR), exam schedules, admit cards, and results.',
    overview:
      'Aspirants preparing for central government jobs and competitive exams (UPSC Civil Services, CDS, NDA, SSC CGL, CHSL, MTS, GD) should rely strictly on official commission websites for notifications, eligibility cutoffs, and admit cards.',
    whoCanApply:
      'Eligible Indian graduates, 12th pass, or 10th pass candidates meeting age, nationality, and educational rules stated in each official notification PDF.',
    eligibilityRequirements:
      'Varies by examination: typically Class 10/12 for SSC MTS/CHSL, Bachelor degree for UPSC CSE / SSC CGL, with official age relaxations where applicable.',
    documentsRequired: [
      'One-Time Registration (OTR) profile on upsconline.nic.in or ssc.gov.in',
      'Educational qualification certificates & marks cards',
      'Recent photograph & scanned signature matching exact notification dimensions',
      'Valid Category / EWS / PwBD certificate (if claiming reservation/fee exemption)',
    ],
    applicationSteps: [
      'Download and read the complete official notification PDF from upsc.gov.in or ssc.gov.in.',
      'Complete One-Time Registration (OTR) if applying for the first time.',
      'Fill the exam application form and select exam city preferences early.',
      'Pay exam fee (if applicable) and download your submitted application confirmation.',
    ],
    officialFees:
      'Official commission fee applies per exam (commonly exempted for women, SC, ST, and PwBD candidates as per official notification).',
    appointmentProcess:
      'Admit cards are released before the Computer Based Test / Written Exam exclusively on the official commission portals.',
    trackingGuidance:
      'Verify application acceptance, admit card release dates, and final result PDFs on upsc.gov.in and ssc.gov.in.',
    commonMistakes: [
      'Relying on rumour blogs for exam dates instead of checking official commission calendars.',
      'Uploading photos with blur, spectacles glare, or wrong background violating notification specs.',
    ],
    faqs: [
      {
        q: 'Are dates on Bharat Connect guaranteed to be the latest exam dates?',
        a: 'Always verify the latest addendum or revised exam calendar PDF directly on upsc.gov.in or ssc.gov.in.',
      },
    ],
    translations: {
      kn: {
        title: 'UPSC ಮತ್ತು SSC ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ಸರ್ಕಾರಿ ಉದ್ಯೋಗ ಪೋರ್ಟಲ್‌ಗಳು',
        summary:
          'ಅಧಿಕೃತ upsc.gov.in ಮತ್ತು ssc.gov.in ಅಧಿಸೂಚನೆಗಳು, OTR ನೋಂದಣಿ ಮತ್ತು ಪ್ರವೇಶ ಪತ್ರಗಳ ಮಾರ್ಗದರ್ಶಿ.',
      },
      hi: {
        title: 'UPSC और SSC प्रतियोगी परीक्षा और सरकारी भर्ती पोर्टल',
        summary:
          'आधिकारिक upsc.gov.in और ssc.gov.in परीक्षा अधिसूचना, OTR पंजीकरण, प्रवेश पत्र और परिणाम की सटीक जानकारी।',
      },
    },
    officialWebsiteName: 'Union Public Service Commission (UPSC) / SSC',
    officialWebsiteUrl: 'https://upsc.gov.in/',
    officialApplyUrl: 'https://upsconline.nic.in/',
    sourceUrl: 'https://ssc.gov.in/',
    isThirdParty: false,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'ayushman-bharat-pmjay-public-health-scheme',
    title: 'Ayushman Bharat (PM-JAY) Public Health Assurance Guidance',
    category: 'Health & Public Services',
    subcategory: 'Public Health Insurance Scheme',
    departmentOrAuthority: 'National Health Authority, Ministry of Health & Family Welfare',
    jurisdiction: 'Central',
    state: 'All India',
    country: null,
    summary:
      'General public information on eligibility checks, empanelled hospitals, and Ayushman Card verification under PM-JAY. (Informational only — not medical advice.)',
    overview:
      'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY) provides cashless secondary and tertiary hospitalization cover for eligible families at empanelled public and private hospitals across India (and integrates with state health schemes such as Karnataka Arogya Karnataka).',
    whoCanApply:
      'Economically vulnerable families listed under SECC eligibility criteria or eligible state-integrated health assurance categories (including senior citizens 70+ under expanded rules — verify current rules on pmjay.gov.in).',
    eligibilityRequirements:
      'Check family eligibility directly on beneficiary.nha.gov.in or pmjay.gov.in.',
    documentsRequired: [
      'Family Ration Card or state family ID',
      'Valid government photo ID for hospital verification',
    ],
    applicationSteps: [
      'Visit pmjay.gov.in or beneficiary.nha.gov.in to check if your family is listed as eligible.',
      'Search empanelled hospitals in your district using the official Hospital Search directory.',
      'For hospital care, visit the Ayushman Mitra helpdesk at an empanelled hospital with valid ID.',
    ],
    officialFees: 'Free — checking eligibility and generating an Ayushman Card on official NHA portals has zero fee.',
    appointmentProcess: null,
    trackingGuidance:
      'Verify card status and empanelled hospitals directly on pmjay.gov.in. For medical emergencies in India, call 112 or 108.',
    commonMistakes: [
      'Assuming every private clinic is empanelled without checking the official hospital list first.',
      'Confusing general scheme information with medical diagnosis—always consult a qualified doctor.',
    ],
    faqs: [
      {
        q: 'Does Bharat Connect provide medical advice?',
        a: 'No. This page provides general public scheme information only and is never a substitute for licensed medical care.',
      },
    ],
    translations: {
      kn: {
        title: 'ಆಯುಷ್ಮಾನ್ ಭಾರತ್ (PM-JAY) ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಯೋಜನೆ ಮಾರ್ಗದರ್ಶಿ',
        summary:
          'PM-JAY ಅರ್ಹತೆ ಪರಿಶೀಲನೆ ಮತ್ತು ಆಸ್ಪತ್ರೆ ಪಟ್ಟಿಗಾಗಿ ಅಧಿಕೃತ pmjay.gov.in ಮಾಹಿತಿ (ತುರ್ತು ಸಹಾಯಕ್ಕೆ 112 / 108).',
      },
      hi: {
        title: 'आयुष्मान भारत (PM-JAY) जन स्वास्थ्य योजना मार्गदर्शन',
        summary:
          'PM-JAY पात्रता जांच और सूचीबद्ध अस्पतालों की जानकारी के लिए आधिकारिक pmjay.gov.in गाइड (आपातकाल में 112 / 108)।',
      },
    },
    officialWebsiteName: 'National Health Authority (PM-JAY)',
    officialWebsiteUrl: 'https://pmjay.gov.in/',
    officialApplyUrl: 'https://beneficiary.nha.gov.in/',
    sourceUrl: 'https://pmjay.gov.in/',
    isThirdParty: false,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'student-visa-guidance-germany-official-missions',
    title: 'Student Visa Guidance — Germany (Official German Missions & APS India)',
    category: 'Passport & Visa',
    subcategory: 'Student Visa (Country Guide)',
    departmentOrAuthority: 'German Missions in India & Academic Evaluation Centre (APS India)',
    jurisdiction: 'Central',
    state: 'All India',
    country: 'Germany',
    summary:
      'Independent informational checklist for Indian students preparing for a German National Student Visa (APS certificate, university admission, blocked account, and official embassy appointment).',
    overview:
      'Indian students admitted to recognized German universities require a National Visa (Type D) prior to travel. Before booking a visa appointment, most Indian applicants must obtain an APS certificate verifying their Indian academic credentials. Bharat Connect is an independent information guide and is NOT an embassy, consulate, or visa agency.',
    whoCanApply:
      'Students holding an official admission letter (or conditional admission / Studienkolleg invitation) from a recognized German higher education institution.',
    eligibilityRequirements:
      'Valid Indian passport, recognized German university admission letter, APS certificate (where applicable), proof of financial means (blocked account / scholarship award), and health insurance.',
    documentsRequired: [
      'Valid Indian Passport (meeting validity rules on india.diplo.de)',
      'Official University Admission Letter (Zulassungsbescheid)',
      'APS Certificate (from aps-india.de, where required)',
      'Academic marks cards & degree certificates',
      'Proof of financial resources (Blocked Account confirmation or official scholarship letter)',
      'Travel / Health insurance confirmation & SOP / CV as listed on the official checklist',
    ],
    applicationSteps: [
      'Review the official Student Visa checklist on india.diplo.de for your jurisdictional Consulate/Embassy.',
      'Apply early for your APS certificate via aps-india.de if required for your qualification.',
      'Arrange proof of funds (Blocked Account / scholarship) and gather original academic documents.',
      'Book an official visa appointment through the German Missions / authorized VFS portal linked from india.diplo.de.',
      'Attend your biometrics and document submission appointment in person.',
    ],
    officialFees:
      'Official National Visa fee and APS verification fee are published on india.diplo.de and aps-india.de (check current EUR/INR rate before applying).',
    appointmentProcess:
      'Visa appointments are scheduled strictly through the official booking system referenced on india.diplo.de. Processing times vary and are never guaranteed.',
    trackingGuidance:
      'Use only the official tracking reference provided at your visa appointment centre. Bharat Connect cannot check or guarantee visa outcomes.',
    commonMistakes: [
      'Applying for university visa slots without obtaining the mandatory APS certificate first.',
      'Trusting agents who promise "guaranteed visa approval" or faster embassy decisions.',
    ],
    faqs: [
      {
        q: 'Can Bharat Connect guarantee a German student visa or estimate exact processing days?',
        a: 'No. Visa eligibility, appointment availability, and decisions rest solely with the German Missions in India.',
      },
    ],
    translations: {
      kn: {
        title: 'ವಿದ್ಯಾರ್ಥಿ ವೀಸಾ ಮಾರ್ಗದರ್ಶಿ — ಜರ್ಮನಿ (ಅಧಿಕೃತ ಮಿಷನ್‌ಗಳು ಮತ್ತು APS)',
        summary:
          'ಜರ್ಮನಿ ವಿದ್ಯಾರ್ಥಿ ವೀಸಾ, APS ಪ್ರಮಾಣಪತ್ರ ಮತ್ತು ಅಗತ್ಯ ದಾಖಲೆಗಳ ಮಾಹಿತಿ ಪಟ್ಟಿ. (ಭಾರತ್ ಕನೆಕ್ಟ್ ವೀಸಾ ಏಜೆನ್ಸಿ ಅಲ್ಲ).',
      },
      hi: {
        title: 'छात्र वीज़ा मार्गदर्शन — जर्मनी (आधिकारिक दूतावास और APS)',
        summary:
          'जर्मनी छात्र वीज़ा, APS सर्टिफिकेट और आधिकारिक दस्तावेज़ चेकलिस्ट की जानकारी। (भारत कनेक्ट कोई वीज़ा एजेंसी नहीं है)।',
      },
    },
    officialWebsiteName: 'German Missions in India',
    officialWebsiteUrl: 'https://india.diplo.de/',
    officialApplyUrl: 'https://india.diplo.de/in-en/service/05-VisaEinreise',
    sourceUrl: 'https://aps-india.de/',
    isThirdParty: false,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
  {
    slug: 'income-tax-itr-filing-awareness-guide',
    title: 'Income Tax Basics & Official ITR e-Filing Portal Guidance',
    category: 'Tax & Financial',
    subcategory: 'ITR Filing & Tax Awareness',
    departmentOrAuthority: 'Income Tax Department, Ministry of Finance, Government of India',
    jurisdiction: 'Central',
    state: 'All India',
    country: null,
    summary:
      'Educational overview of PAN-based tax basics, Form 26AS / AIS checks, and using the official Income Tax e-Filing portal. (General awareness only — not financial advice.)',
    overview:
      'Citizens, salaried professionals, freelancers, and small business owners can check their Annual Information Statement (AIS), Form 26AS, and file Income Tax Returns directly through the official Income Tax e-Filing portal without middlemen. Bharat Connect never collects banking credentials or gives regulated tax advice.',
    whoCanApply:
      'Individuals, students with taxable stipends/income, salaried employees, and businesses required or opting to file an Income Tax Return.',
    eligibilityRequirements:
      'Valid PAN, active bank account for refunds, and income/TDS statements (Form 16 / AIS / 26AS).',
    documentsRequired: [
      'PAN & e-Filing Portal login (maintained directly on incometax.gov.in)',
      'Form 16 (from employer) or interest/freelance income records',
      'Form 26AS & AIS summary (accessible inside incometax.gov.in)',
      'Bank account details (for refund credit, entered only on incometax.gov.in)',
    ],
    applicationSteps: [
      'Log in directly at incometax.gov.in.',
      'Review your AIS and Form 26AS to verify TDS and interest credits.',
      'Select the appropriate Assessment Year and ITR form.',
      'Verify income, deductions, and bank account details before e-Verifying your return.',
    ],
    officialFees:
      'Filing an ITR on the official incometax.gov.in portal is free (statutory late fees apply only if filing after due dates under tax law).',
    appointmentProcess: null,
    trackingGuidance:
      'Track ITR processing and refund status directly under "e-File -> Income Tax Returns -> View Filed Returns" on incometax.gov.in.',
    commonMistakes: [
      'Forgetting to e-Verify the ITR within 30 days of submission.',
      'Entering bank passwords or OTPs on unofficial websites.',
    ],
    faqs: [
      {
        q: 'Does Bharat Connect provide personalized tax or investment advice?',
        a: 'No. Bharat Connect shares general educational awareness only; consult a qualified Chartered Accountant or official tax helpdesk for personal filings.',
      },
    ],
    translations: {
      kn: {
        title: 'ಆದಾಯ ತೆರಿಗೆ (ITR) ಮತ್ತು ತೆರಿಗೆ ಜಾಗೃತಿ ಮಾರ್ಗದರ್ಶಿ',
        summary:
          'ಅಧಿಕೃತ incometax.gov.in ಪೋರ್ಟಲ್ ಮೂಲಕ AIS, Form 26AS ಮತ್ತು ITR ಸಲ್ಲಿಕೆಯ ಸಾಮಾನ್ಯ ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿ.',
      },
      hi: {
        title: 'आयकर (ITR) और कर जागरूकता मार्गदर्शन',
        summary:
          'आधिकारिक incometax.gov.in पोर्टल पर AIS, फॉर्म 26AS और ITR फाइलिंग की सामान्य शैक्षणिक जानकारी।',
      },
    },
    officialWebsiteName: 'Income Tax Department e-Filing Portal',
    officialWebsiteUrl: 'https://www.incometax.gov.in/',
    officialApplyUrl: 'https://www.incometax.gov.in/',
    sourceUrl: 'https://www.incometax.gov.in/',
    isThirdParty: false,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: new Date(),
  },
];

export async function ensureBaselinePublicServices(): Promise<number> {
  const existing = await db.select({ value: count() }).from(publicServices);
  const total = Number(existing[0]?.value ?? 0);
  if (total > 0) {
    return 0;
  }

  await db.insert(publicServices).values(VERIFIED_PUBLIC_SERVICES).onConflictDoNothing();
  return VERIFIED_PUBLIC_SERVICES.length;
}
