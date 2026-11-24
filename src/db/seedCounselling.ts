import { db } from './index.ts';
import { counsellingGuides } from './schema.ts';

type CounsellingSeed = typeof counsellingGuides.$inferInsert;

const now = new Date();

function makeGuide(input: {
  slug: string;
  authorityCode: string;
  title: string;
  stream: string;
  scope?: 'Central' | 'State' | 'Private';
  state?: string;
  conductingBody: string;
  overview: string;
  whoIsEligible: string;
  registrationProcess: string;
  documentsRequired: string[];
  choiceFillingGuide: string;
  seatAllotmentProcess: string;
  reportingProcess: string;
  feePaymentInfo: string;
  subsequentRoundsInfo: string;
  importantDeadlinesText?: string;
  commonMistakes: string[];
  officialWebsiteUrl: string;
  sourceUrl?: string;
}): CounsellingSeed {
  return {
    slug: input.slug,
    authorityCode: input.authorityCode,
    title: input.title,
    stream: input.stream,
    scope: input.scope ?? 'Central',
    state: input.state ?? 'All India',
    conductingBody: input.conductingBody,
    overview: input.overview,
    whoIsEligible: input.whoIsEligible,
    registrationProcess: input.registrationProcess,
    documentsRequired: input.documentsRequired,
    choiceFillingGuide: input.choiceFillingGuide,
    seatAllotmentProcess: input.seatAllotmentProcess,
    reportingProcess: input.reportingProcess,
    feePaymentInfo: input.feePaymentInfo,
    subsequentRoundsInfo: input.subsequentRoundsInfo,
    importantDeadlinesText:
      input.importantDeadlinesText ??
      'Dates not announced — check official counselling schedule notification after entrance exam results.',
    commonMistakes: input.commonMistakes,
    officialWebsiteUrl: input.officialWebsiteUrl,
    sourceUrl: input.sourceUrl ?? input.officialWebsiteUrl,
    verificationStatus: 'verified',
    publishStatus: 'published',
    lastVerifiedAt: now,
  };
}

export const VERIFIED_COUNSELLING_GUIDES: CounsellingSeed[] = [
  makeGuide({
    slug: 'josaa-centralized-counselling',
    authorityCode: 'JoSAA',
    title: 'JoSAA Counselling — IITs, NITs, IIITs & GFTIs Seat Allocation',
    stream: 'Engineering',
    scope: 'Central',
    state: 'All India',
    conductingBody: 'Joint Seat Allocation Authority (Ministry of Education)',
    overview:
      'Single-window centralized seat allocation for B.Tech, B.E., B.Arch, B.Plan, and Dual Degree seats across 23 IITs, 31 NITs, IIEST Shibpur, 26 IIITs, and 35+ GFTIs.',
    whoIsEligible:
      'Candidates with a valid JEE Main CRL/Category rank (for NITs, IIITs, GFTIs) and/or JEE Advanced rank (for IITs) meeting Class 12 75% (65% SC/ST) or Top-20 percentile board criteria.',
    registrationProcess:
      'Log in on josaa.nic.in using your JEE Main Application Number and Password, verify personal/category details, and confirm academic marks.',
    documentsRequired: [
      'JEE Main / JEE Advanced Admit Card & Score Card',
      'Class 10 Marksheet/Certificate (Date of Birth proof)',
      'Class 12 Marksheet & Passing Certificate (75% / Top 20 percentile proof)',
      'Valid GEN-EWS / OBC-NCL certificate issued on or after April 1 of admission year (central format)',
      'SC / ST / PwD certificate in prescribed JoSAA format',
      'Medical Fitness Certificate in JoSAA Annexure-7 format',
    ],
    choiceFillingGuide:
      'Arrange Institute + Branch choices strictly in true order of preference (from most-desired dream choice #1 downward). Participate in both Mock Seat Allocations before locking choices.',
    seatAllotmentProcess:
      'Conducted across 5 rounds. Whenever allotted a seat for the first time, select Freeze (keep current seat), Float (accept and seek higher preferences across all institutes), or Slide (seek higher branch within same institute).',
    reportingProcess:
      'Complete Online Reporting inside JoSAA portal: upload required certificates, pay Seat Acceptance Fee (SAF), and respond promptly to any Verification Officer queries within the deadline.',
    feePaymentInfo:
      'Zero JoSAA registration fee. Seat Acceptance Fee (SAF) + Partial Admission Fee (PAF for NIT+) apply only upon seat allotment and are adjusted against institute tuition fees.',
    subsequentRoundsInfo:
      'Candidates holding NIT+ seats can exit before Round 5 (or withdraw within notified window) or enter CSAB Special Rounds for vacant NIT/IIIT/GFTI seats.',
    commonMistakes: [
      'Missing OBC-NCL / EWS post-April-1 central certificate renewal deadline',
      'Failing to respond to Document Verification Officer queries within 24 hours (leads to seat cancellation)',
      'Locking unrealistic choices without checking Mock Allocation cutoffs',
    ],
    officialWebsiteUrl: 'https://josaa.nic.in/',
  }),
  makeGuide({
    slug: 'csab-special-rounds',
    authorityCode: 'CSAB',
    title: 'CSAB Special Rounds & CSAB NEUT — Vacant NIT, IIIT & GFTI Seats',
    stream: 'Engineering',
    scope: 'Central',
    state: 'All India',
    conductingBody: 'Central Seat Allocation Board (CSAB)',
    overview:
      'Conducts Special Rounds (I & II) for leftover vacant seats in NITs, IIEST, IIITs, and GFTIs after JoSAA concludes (IIT seats are NOT part of CSAB). Also handles CSAB NEUT and Supernumerary UT rounds.',
    whoIsEligible:
      'All JEE Main rank holders meeting NIT+ Class 12 eligibility — whether they did not register in JoSAA, did not get a seat, or want to upgrade their JoSAA NIT+ seat.',
    registrationProcess:
      'Fresh registration on csab.nic.in after JoSAA Round 5/PAF, payment of CSAB Special Round Enrollment Fee, and fresh choice filling among available vacant seats.',
    documentsRequired: [
      'JEE Main Admit Card & Rank Card',
      'Class 10 & Class 12 Marks Cards',
      'Category / PwD / EWS Certificate (updated central format)',
      'JoSAA Provisional Admission / Document Verification Letter (if previously verified)',
    ],
    choiceFillingGuide:
      'Fill ONLY choices you genuinely prefer OVER any JoSAA seat you already hold — in CSAB, if a new seat is allotted, your previous JoSAA seat is automatically surrendered.',
    seatAllotmentProcess:
      'Two Special Rounds: Special Round 1 allows Freeze / Slide / Float / Surrender & Participate in Round 2; Special Round 2 is final allotment.',
    reportingProcess:
      'Upload documents (if not verified in JoSAA), pay Balance Institute Fee, and complete physical reporting at the allotted NIT/IIIT/GFTI on notified dates.',
    feePaymentInfo:
      'Upfront CSAB Special Round Enrollment Fee (adjusted against tuition if allotted; processing fee deducted on withdrawal/refund per CSAB brochure).',
    subsequentRoundsInfo:
      'After CSAB Special Round 2, check individual institute portals only if spot rounds are officially notified.',
    commonMistakes: [
      'Assuming CSAB includes IIT seats (IITs do not participate in CSAB)',
      'Adding lower-priority colleges in CSAB choice list when already holding a better JoSAA seat',
    ],
    officialWebsiteUrl: 'https://csab.nic.in/',
  }),
  makeGuide({
    slug: 'kea-karnataka-kcet-counselling',
    authorityCode: 'KEA KCET',
    title: 'KEA Karnataka UGCET (KCET) & DCET Engineering / Farm / Pharmacy Counselling',
    stream: 'Engineering',
    scope: 'State',
    state: 'Karnataka',
    conductingBody: 'Karnataka Examinations Authority (KEA)',
    overview:
      'State centralized counselling for Engineering, Architecture, B.Pharm, Pharm.D, B.Sc Nursing, Agriculture & Veterinary seats in Karnataka government, aided, VTU-affiliated, and private colleges.',
    whoIsEligible:
      'Candidates with a valid KCET rank (or DCET for diploma lateral entry / NATA for B.Arch) fulfilling KEA Karnataka Eligibility Clauses (Clause A through Clause O).',
    registrationProcess:
      'Complete KCET application & clause verification on cetonline.karnataka.gov.in/kea/, verify Study/RD caste-income certificates (online SATS/RD verification or BEO/KEA block verification), and download Verification Slip.',
    documentsRequired: [
      'KCET Application Printout & Verification Slip (with secret key)',
      'SSLC / Class 10 & 2nd PUC / Class 12 Marks Cards',
      '7-Year Karnataka Study Certificate countersigned by BEO/DDPU (Clause A)',
      'RD-Number Caste, Income, Rural, Kannada Medium & HK 371(J) Certificates (if applicable)',
    ],
    choiceFillingGuide:
      'Enter unlimited college-course priority options in Option Entry using your Verification Slip secret key. Review Mock Allotment results carefully and rearrange options before Round 1.',
    seatAllotmentProcess:
      'Round 1 Allotment -> Mandatory Choice Selection among Choice 1 (Accept & Freeze + Pay Fee), Choice 2 (Hold & Try Higher Options), Choice 3 (Reject & Try All Higher/Lower Options), or Choice 4 (Exit KEA).',
    reportingProcess:
      'For Choice 1, pay prescribed KEA fee via challan/online payment, download Admission Order, and physically report at the allotted college before deadline.',
    feePaymentInfo:
      'No separate option-entry fee for general verification; tuition fee depends on Government / Aided / Private KCET / SNQ supernumerary seat category.',
    subsequentRoundsInfo:
      'Round 2 and Second Extended Round fill vacant/surrendered seats. Strictly follow KEA forfeiture & penalty notices before opting into later rounds.',
    commonMistakes: [
      'Not getting 7-year study certificates countersigned by the BEO/DDPU before verification',
      'Missing the mandatory Choice 1–4 entry window after Round 1 (results in automatic exit from KEA)',
    ],
    officialWebsiteUrl: 'https://cetonline.karnataka.gov.in/kea/',
  }),
  makeGuide({
    slug: 'kea-karnataka-neet-medical-counselling',
    authorityCode: 'KEA NEET',
    title: 'KEA Karnataka NEET UG & PG Counselling (MBBS, BDS, BAMS/BHMS, MD/MS)',
    stream: 'Medical & AYUSH',
    scope: 'State',
    state: 'Karnataka',
    conductingBody: 'Karnataka Examinations Authority (KEA)',
    overview:
      'Allocates 85% Karnataka State Quota seats in Government Medical/Dental colleges plus Government, Private Open, NRI, and Institutional quota seats in Private Karnataka Medical, Dental, and AYUSH colleges (including St. John’s Medical College).',
    whoIsEligible:
      'NEET UG / NEET PG qualified candidates: Karnataka domicile students for 85% Govt & Karnataka Private seats, AND All-India non-Karnataka candidates for Private Open Merit / NRI seats.',
    registrationProcess:
      'Register separately on cetonline.karnataka.gov.in/kea/ under UGNEET/PGNEET portal (even if you registered for KCET earlier, follow KEA NEET registration instructions), upload NEET Scorecard, and complete physical/online document verification.',
    documentsRequired: [
      'NEET UG / PG Admit Card & Score Card',
      'KEA UGNEET Registration Application & Verification Slip',
      'Class 10 & Class 12 Marks Cards (+ MBBS/Internship certs for PG)',
      'Karnataka Study / Domicile / RD Caste-Income / Linguistic or Religious Minority proof (if claimed)',
    ],
    choiceFillingGuide:
      'Distinguish carefully between Government Seat (G), Private Quota (P), Open/Other Quota (Q/OPN), and NRI codes — tuition fees vary significantly across seat codes!',
    seatAllotmentProcess:
      'Mock Allotment -> Round 1 -> Round 2 -> Mop-Up & Stray Vacancy Rounds conducted strictly per NMC/KEA rules.',
    reportingProcess:
      'Pay KEA fee, submit original documents at KEA (where notified) / allotted medical college, collect Admission Order, and report physically before closing hour.',
    feePaymentInfo:
      'Refundable/adjustable security caution deposit applies for Private/Mop-Up rounds; strictly check KEA fee structure table for G vs. P vs. Q/NRI quotas.',
    subsequentRoundsInfo:
      'Once a seat is joined in Round 2 (or later per NMC rules), upgradation/resignation restrictions apply strictly.',
    commonMistakes: [
      'Confusing KEA Private Seat (P) fees with Government Seat (G) fees during option entry',
      'All-India candidates missing KEA registration thinking MCC covers Karnataka private non-deemed colleges',
    ],
    officialWebsiteUrl: 'https://cetonline.karnataka.gov.in/kea/',
  }),
  makeGuide({
    slug: 'mcc-neet-aiq-deemed-counselling',
    authorityCode: 'MCC NEET',
    title: 'MCC Counselling — 15% AIQ, AIIMS, JIPMER, Central & Deemed Medical/Dental Seats',
    stream: 'Medical & AYUSH',
    scope: 'Central',
    state: 'All India',
    conductingBody: 'Medical Counselling Committee (MCC), DGHS, Ministry of Health & Family Welfare',
    overview:
      'Centralized national medical counselling for 15% All India Quota (Government Medical/Dental), 100% AIIMS & JIPMER, Central Universities (BHU, AMU, DU), ESIC, and 100% Deemed Universities (KMC Manipal, Symbiosis, SRM, etc.).',
    whoIsEligible:
      'NEET UG qualified candidates (for MBBS/BDS/B.Sc Nursing) and NEET PG / NEET MDS / NEET SS qualified doctors (for PG/Super-Speciality).',
    registrationProcess:
      'Register online at mcc.nic.in using NEET Roll Number, select counselling streams (AIQ / Central / Deemed / AFMC), and pay registration + refundable security deposit.',
    documentsRequired: [
      'NEET Admit Card & Rank Letter / Score Card',
      'MCC Provisional Allotment Letter',
      'Class 10 & Class 12 Marks Cards & Passing Certificates',
      'Category / EWS / PwD certificate issued by designated authority',
      '8–10 Passport photographs & Valid Government Photo ID',
    ],
    choiceFillingGuide:
      'Order AIIMS, Central Universities, Government 15% AIQ colleges, and Deemed Universities by priority and verified fee affordability. Save and lock choices before the deadline.',
    seatAllotmentProcess:
      'Round 1 (Free Exit available if not joined) -> Round 2 (Upgradation allowed; forfeiture if joined and vacated after cutoff) -> Round 3 -> Online Stray Vacancy Round.',
    reportingProcess:
      'Download Provisional Allotment Letter from mcc.nic.in and report physically with original documents & tuition fee at the allotted Medical/Dental College.',
    feePaymentInfo:
      'Non-refundable Registration Fee + Refundable Security Deposit (higher deposit required if selecting Deemed Universities; forfeited only if seat allotted in Round 2+ is abandoned).',
    subsequentRoundsInfo:
      'Round 3 & Stray Vacancy rules strictly bar candidates already holding a joined Round 2/3 AIQ or State seat from participating in Stray rounds.',
    commonMistakes: [
      'Forgetting to click "Lock Choices" or verify Deemed University fees before adding Deemed codes',
      'Holding a joined state quota seat while entering MCC Stray Vacancy (can lead to cancellation/debarment)',
    ],
    officialWebsiteUrl: 'https://mcc.nic.in/',
  }),
  makeGuide({
    slug: 'aaccc-ayush-counselling',
    authorityCode: 'AACCC',
    title: 'AACCC Counselling — AIQ, Central & Deemed AYUSH (BAMS, BHMS, BUMS, BSMS & PG)',
    stream: 'Medical & AYUSH',
    scope: 'Central',
    state: 'All India',
    conductingBody: 'AYUSH Admissions Central Counseling Committee (Ministry of AYUSH)',
    overview:
      'Centralized counselling for 15% All India Quota seats in Govt/Govt-Aided AYUSH colleges and 100% seats in National Institutes (NIA Jaipur, ITRA Jamnagar, AIIA New Delhi, NIH Kolkata, NIUM Bengaluru) & Deemed Universities.',
    whoIsEligible:
      'NEET UG qualifiers (for BAMS/BHMS/BUMS/BSMS) and AIAPGET qualifiers (for MD/MS AYUSH PG).',
    registrationProcess:
      'Register online at aaccc.gov.in, choose participating quotas (AIQ Govt / Central / National Institute / Deemed), and pay registration & security deposit.',
    documentsRequired: [
      'NEET UG (or AIAPGET) Admit Card & Score Card',
      'Class 10 & 12 Certificates (+ BAMS/BHMS/BUMS degree & internship for PG)',
      'Valid Category / PwD / EWS Certificate',
      'AACCC Provisional Allotment Letter',
    ],
    choiceFillingGuide:
      'Prioritize National Institutes (AIIA, NIA, ITRA, NIUM) and Govt AIQ colleges before Deemed AYUSH universities based on clinical exposure and fee structure.',
    seatAllotmentProcess:
      'Round 1 -> Round 2 -> Round 3 -> Stray Vacancy Round conducted online.',
    reportingProcess:
      'Report physically at the allotted AYUSH Institute with original documents and tuition fee within notified reporting days.',
    feePaymentInfo:
      'Registration fee + refundable security deposit (higher deposit for Deemed AYUSH Universities).',
    subsequentRoundsInfo:
      '85% State Quota & State Private AYUSH seats are handled separately by respective state authorities (such as KEA in Karnataka).',
    commonMistakes: [
      'Assuming AACCC covers 85% State Private AYUSH seats (state portals like KEA handle those separately)',
    ],
    officialWebsiteUrl: 'https://aaccc.gov.in/',
  }),
  makeGuide({
    slug: 'comedk-uget-counselling',
    authorityCode: 'COMEDK',
    title: 'COMEDK UGET Online Engineering Counselling (Karnataka Private Colleges)',
    stream: 'Engineering',
    scope: 'Private',
    state: 'Karnataka',
    conductingBody: 'Consortium of Medical, Engineering and Dental Colleges of Karnataka (COMEDK)',
    overview:
      'All-India online counselling for B.E./B.Tech seats across 150+ unaided private & autonomous engineering colleges in Karnataka including RVCE, BMSCE, MSRIT, DSCE, and SJCE/NIE.',
    whoIsEligible:
      'All COMEDK UGET rank holders who passed 10+2 / 2nd PUC with Physics, Chemistry, and Mathematics (minimum 45% PCM; 40% Karnataka SC/ST/OBC).',
    registrationProcess:
      'Log in on comedk.org Counselling tab after rank card release, pay counselling registration fee, and upload Class 10/12 marks & ID documents for online verification.',
    documentsRequired: [
      'COMEDK UGET Rank Card & Test Admission Ticket (TAT)',
      'Class 10 & Class 12 Marks Cards',
      'Valid Government Photo ID (Passport/Aadhaar/PAN/Voter ID)',
      'Kalyana Karnataka (HK) 371(J) Certificate (if claiming HK seats)',
    ],
    choiceFillingGuide:
      'Use Mock Allotment round to check cutoffs. Rank colleges & branches strictly by genuine preference because upward-only upgrades apply in Round 2 & Round 3.',
    seatAllotmentProcess:
      'Round 1 -> Decision options: Accept & Freeze, Accept & Upgrade, Reject & Upgrade, or Reject & Withdraw. Note strict Round 2/3 cancellation & fee forfeiture rules!',
    reportingProcess:
      'On selecting Accept & Freeze, pay total notified first-year COMEDK tuition fee online, download Allotment Letter, and physically report at the allotted Karnataka college.',
    feePaymentInfo:
      'Counselling registration fee + Full first-year tuition fee collected online upon acceptance (verify exact college fee in COMEDK Fee Circular).',
    subsequentRoundsInfo:
      'Round 3 is the final round; candidates allotted a seat in Round 3 cannot cancel without forfeiting full tuition fee / penalty as notified by COMEDK.',
    commonMistakes: [
      'Missing the narrow 48-hour document upload verification deadline before choice filling',
      'Not understanding Reject & Upgrade vs. Round 3 mandatory joining penalties',
    ],
    officialWebsiteUrl: 'https://www.comedk.org/',
  }),
  makeGuide({
    slug: 'mht-cet-cap-counselling',
    authorityCode: 'MHT-CET CAP',
    title: 'Maharashtra CET Cell CAP Counselling (Engineering, Pharmacy & Architecture)',
    stream: 'Engineering',
    scope: 'State',
    state: 'Maharashtra',
    conductingBody: 'State Common Entrance Test Cell, Government of Maharashtra',
    overview:
      'Centralized Admission Process (CAP) allocating B.E./B.Tech, B.Pharm, and B.Arch seats across COEP Tech Pune, VJTI Mumbai, ICT Mumbai, SPIT, PICT, and Maharashtra colleges via MHT CET & JEE Main scores.',
    whoIsEligible:
      'MHT CET qualifiers (Maharashtra State Candidature) and JEE Main qualifiers (All India Candidature seats).',
    registrationProcess:
      'Register on cetcell.mahacet.org CAP portal, select E-Scrutiny or Physical Scrutiny Center (FC) verification, and await Provisional & Final Merit Lists.',
    documentsRequired: [
      'MHT CET / JEE Main Score Card',
      'Class 10 & Class 12 Marks Cards & School Leaving Certificate',
      'Maharashtra Domicile / Nationality / Birth Certificate (for MS seats)',
      'Caste, Caste Validity & Non-Creamy Layer Certificate (for Maharashtra reserved categories)',
    ],
    choiceFillingGuide:
      'Note: If Option #1 is allotted in CAP Round I, it is AUTO-FROZEN — you must confirm admission and cannot float to Round II!',
    seatAllotmentProcess:
      'CAP Rounds I, II, and III. For options #2 onward, select Freeze or Betterment (Not Freeze) by paying Seat Acceptance Fee.',
    reportingProcess:
      'Pay Seat Acceptance Fee online, select Freeze, and report physically to the allotted Institute Admission Reporting Center (ARC) with original documents.',
    feePaymentInfo:
      'Nominal CAP application fee (waived if registered via MHT CET) + Rs. 1,000 Seat Acceptance Fee; tuition payable at college upon reporting.',
    subsequentRoundsInfo:
      'Vacant seats after CAP Round III are filled via Institutional/ACAP spot rounds conducted transparently by respective colleges.',
    commonMistakes: [
      'Putting a lower-choice college as Preference #1 and getting auto-frozen in CAP Round I',
      'Missing Caste Validity / Non-Creamy Layer verification deadlines at Scrutiny Centers',
    ],
    officialWebsiteUrl: 'https://cetcell.mahacet.org/',
  }),
  makeGuide({
    slug: 'keam-cee-kerala-counselling',
    authorityCode: 'KEAM CEE',
    title: 'KEAM CEE Kerala Centralized Allotment Process (CAP)',
    stream: 'Engineering',
    scope: 'State',
    state: 'Kerala',
    conductingBody: 'Commissioner for Entrance Examinations (CEE), Kerala',
    overview:
      'Centralized allotment for Engineering (CET Trivandrum, GEC Thrissur, MEC Kochi, TKM, etc.), Architecture (NATA), B.Pharm, and State Medical/AYUSH/Allied seats in Kerala.',
    whoIsEligible:
      'KEAM rank holders (Engineering/Pharmacy), NATA + Plus Two (B.Arch), and NEET UG (Medical/AYUSH) registered on CEE Kerala portal under Keralite / Non-Keralite Category I & II.',
    registrationProcess:
      'Apply on cee.kerala.gov.in, submit Plus Two marks for equal-weightage KEAM Engineering rank preparation, and complete memo verification.',
    documentsRequired: [
      'KEAM Admit Card & Rank Card',
      'SSLC & Plus Two / Class 12 Marks Cards',
      'Nativity Proof (Birth Certificate / SSLC / Passport) & Community/NCL/Income Certificates',
    ],
    choiceFillingGuide:
      'Add options in Candidate Portal during Trial & Phase 1 Option Registration; delete unwanted lower options after each phase.',
    seatAllotmentProcess:
      'Trial Allotment -> Phase 1 -> Phase 2 -> Phase 3 / Mop-Up allotments conducted online.',
    reportingProcess:
      'Pay CEE Kerala specified fee via e-payment/Head Post Office within deadline and join the allotted college physically.',
    feePaymentInfo:
      'CEE collects initial seat acceptance/token fee online; balance tuition adjusted at the college.',
    subsequentRoundsInfo:
      'Spot allotments are announced on cee.kerala.gov.in after regular CAP phases.',
    commonMistakes: [
      'Forgetting to upload Class 12 PCM marks on CEE portal on time (which blocks KEAM Engineering rank generation)',
    ],
    officialWebsiteUrl: 'https://cee.kerala.gov.in/',
  }),
  makeGuide({
    slug: 'ap-ts-eapcet-counselling',
    authorityCode: 'AP & TS EAPCET',
    title: 'Andhra Pradesh (APSCHE) & Telangana (TGCHE) EAPCET Web Counselling',
    stream: 'Engineering',
    scope: 'State',
    state: 'Andhra Pradesh & Telangana',
    conductingBody: 'APSCHE (Andhra Pradesh) & TGCHE (Telangana)',
    overview:
      'Separate state web counselling portals for Engineering, Biotechnology, Pharmacy, and Agriculture admissions across JNTU, AU, OU, SVU, and private colleges in AP and Telangana.',
    whoIsEligible:
      'AP EAPCET qualifiers (for AP admissions) and TS EAPCET qualifiers (for Telangana admissions) meeting 10+2 MPC/BiPC and local/non-local residency norms.',
    registrationProcess:
      'Pay processing fee online -> Slot booking / Online Certificate Verification -> Exercise Web Options on cets.apsche.ap.gov.in (AP) or tgeapcet.nic.in (Telangana).',
    documentsRequired: [
      'EAPCET Rank Card & Hall Ticket',
      'SSC (10th) & Intermediate (10+2) Marks Memos',
      'Study / Bonafide Certificates (Class VI to Intermediate for Local Status proof)',
      'Transfer Certificate (TC), Caste, Income / EWS Certificates',
    ],
    choiceFillingGuide:
      'Select District, College Type (University/Private), and Branch codes carefully; save options repeatedly and freeze before cutoff.',
    seatAllotmentProcess:
      'Phase 1 -> Phase 2 -> Final Phase + Internal Sliding / Spot Admissions.',
    reportingProcess:
      'Complete Online Self-Reporting first, pay tuition fee challan (unless eligible for full state fee reimbursement), and report physically at college.',
    feePaymentInfo:
      'Processing fee (~Rs. 1,200 OC/BC; Rs. 600 SC/ST — verify active notification); eligible state-scholarship students receive tuition reimbursement.',
    subsequentRoundsInfo:
      'Always complete Self-Reporting on portal even if waiting for Phase 2 sliding, or your Phase 1 seat gets cancelled.',
    commonMistakes: [
      'Skipping mandatory Online Self-Reporting after Phase 1 while waiting for Phase 2',
      'Missing Class VI–XII study certificates required for AP/TS Local Status verification',
    ],
    officialWebsiteUrl: 'https://cets.apsche.ap.gov.in/',
    sourceUrl: 'https://eapcet.tgche.ac.in/',
  }),
  makeGuide({
    slug: 'wbjeeb-e-counselling',
    authorityCode: 'WBJEEB',
    title: 'WBJEEB Centralized e-Counselling (Jadavpur Univ & West Bengal Colleges)',
    stream: 'Engineering',
    scope: 'State',
    state: 'West Bengal',
    conductingBody: 'West Bengal Joint Entrance Examinations Board (WBJEEB)',
    overview:
      'Single centralized counselling covering WBJEE rank seats (Jadavpur University, IEM, Heritage, Calcutta Univ, Govt Engineering Colleges) as well as JEE Main seats in West Bengal.',
    whoIsEligible:
      'WBJEE GMR/PMR rank holders and JEE Main qualifiers meeting 10+2 PCM 45% (Jadavpur Univ requires 60%).',
    registrationProcess:
      'Register on wbjeeb.nic.in, enter academic scores & domicile status, pay counselling registration fee, and lock college-branch choices.',
    documentsRequired: [
      'WBJEE / JEE Main Rank Card & Admit Card',
      'Class 10 & Class 12 Marks Sheets',
      'West Bengal Domicile Certificate (Proforma a1/a2/b) for state-reserved seats',
      'Category / TFW (Tuition Fee Waiver) Income Certificate',
    ],
    choiceFillingGuide:
      'Order choices across Government, University, and Self-Financed institutes; lock choices before deadline (auto-locks if saved).',
    seatAllotmentProcess:
      'Round 1 (Allotment -> Pay Seat Acceptance Fee -> Physical Verification at allotted institute -> Opt Yes/No Upgradation) -> Round 2 -> Mop-Up Round.',
    reportingProcess:
      'Physical document verification at the Round 1 allotted institute is mandatory even if you opt for YES Upgradation to Round 2!',
    feePaymentInfo:
      'Counselling fee + Rs. 5,000 Seat Acceptance Fee (adjusted against college fees).',
    subsequentRoundsInfo:
      'Candidates must register freshly/pay nominal fee to enter Mop-Up Round if interested.',
    commonMistakes: [
      'Skipping physical reporting at the Round 1 institute while wanting Round 2 upgradation (immediately cancels candidature)',
    ],
    officialWebsiteUrl: 'https://wbjeeb.nic.in/',
  }),
  makeGuide({
    slug: 'tnea-tamil-nadu-counselling',
    authorityCode: 'TNEA',
    title: 'TNEA Single-Window Engineering Counselling (Anna University & TN Colleges)',
    stream: 'Engineering',
    scope: 'State',
    state: 'Tamil Nadu',
    conductingBody: 'Directorate of Technical Education (DoTE), Tamil Nadu',
    overview:
      '10+2 PCM mark-based centralized counselling (no entrance exam) for B.E./B.Tech seats across Anna University departments (CEG, MIT, ACT), Government Colleges, and Self-Financing colleges in Tamil Nadu.',
    whoIsEligible:
      'Class 12 PCM passed students satisfying Tamil Nadu nativity / study criteria (or Other State quota norms).',
    registrationProcess:
      'Register online at tneaonline.org, upload scanned certificates, obtain Random Number, and complete TFC Online Certificate Verification.',
    documentsRequired: [
      'Class 10, Class 11 & Class 12 Mark Sheets',
      'Transfer Certificate & Nativity Certificate (where applicable)',
      'Permanent Community Certificate (BC/BCM/MBC/DNC/SC/SCA/ST)',
      'First Graduate Certificate (if claiming TN First Graduate fee concession)',
    ],
    choiceFillingGuide:
      'Round 1, 2, and 3 are scheduled strictly by Overall Rank brackets. Check previous year TNEA closing cutoffs out of 200 before locking choices.',
    seatAllotmentProcess:
      'Tentative Allotment -> Mandatory Confirmation among Accept & Join, Accept & Upward, Decline & Upward, Decline & Move to Next Round -> Provisional Allotment.',
    reportingProcess:
      'Download Provisional Allotment Order and report to the allotted college (or TFC for upward confirmation) within 5 days.',
    feePaymentInfo:
      'TNEA application registration fee + Initial Deposit during counselling (adjusted into tuition).',
    subsequentRoundsInfo:
      'Supplementary Counselling and SCA-to-SC conversion rounds follow Round 3 for remaining vacant seats.',
    commonMistakes: [
      'Missing the strict 2-day Tentative Allotment Confirmation window (leads to cancellation of seat)',
    ],
    officialWebsiteUrl: 'https://www.tneaonline.org/',
  }),
  makeGuide({
    slug: 'uptac-acpc-reap-state-counselling',
    authorityCode: 'UPTAC / ACPC / REAP',
    title: 'State Engineering Counselling via JEE Main / State CET (UPTAC, Gujarat ACPC & Rajasthan REAP)',
    stream: 'Engineering',
    scope: 'State',
    state: 'UP, Gujarat & Rajasthan',
    conductingBody: 'AKTU (UPTAC) / ACPC (Gujarat) / CEG DTE (Rajasthan)',
    overview:
      'Covers three major northern/western state engineering admission portals: UPTAC (UP colleges via JEE Main), ACPC Gujarat (via GUJCET + JEE Main 50:50 / PCM merit), and REAP Rajasthan (via JEE Main & Class 12 merit).',
    whoIsEligible:
      'Candidates holding valid JEE Main ranks (and GUJCET for Gujarat ACPC) fulfilling respective state domicile/all-India quotas.',
    registrationProcess:
      'Register separately on uptac.admissions.nic.in (UP), gujacpc.admissions.nic.in (Gujarat), or cegrajasthan.org / hte.rajasthan.gov.in (Rajasthan).',
    documentsRequired: [
      'JEE Main Score Card (and GUJCET Score Card for Gujarat)',
      'Class 10 & Class 12 Mark Sheets',
      'State Domicile / Income (TFW) / Category Certificate in state format',
    ],
    choiceFillingGuide:
      'Use Mock Rounds (especially ACPC & UPTAC) to benchmark branch closing ranks across State Govt institutes (IET Lucknow, LDCE Ahmedabad, MBM Jodhpur) and private colleges.',
    seatAllotmentProcess:
      'Multi-round allotment with Freeze / Float options and Seat Confirmation Fee payment online.',
    reportingProcess:
      'Download Provisional Seat Allotment Letter and complete physical document verification at the allotted college.',
    feePaymentInfo:
      'State counselling registration fee + Seat Acceptance Confirmation Fee (adjusted into first semester tuition).',
    subsequentRoundsInfo:
      'Special / Spot Rounds fill vacant seats at state govt & private institutes after regular rounds conclude.',
    commonMistakes: [
      'Confusing UPTAC (UP state counselling) with JoSAA — AKTU/MMMUT/HBTU seats are NOT in JoSAA',
    ],
    officialWebsiteUrl: 'https://uptac.admissions.nic.in/',
    sourceUrl: 'https://gujacpc.admissions.nic.in/',
  }),
  makeGuide({
    slug: 'cuet-and-private-university-counselling',
    authorityCode: 'CUET & Private Univ',
    title: 'CUET University Portals (DU CSAS / BHU) & Private University Counselling (BITSAT, VITEEE, MET, AEEE)',
    stream: 'University Admissions',
    scope: 'Private',
    state: 'All India',
    conductingBody: 'Individual Participating Universities (DU, BHU, BITS, VIT, SRM, MAHE, Amrita)',
    overview:
      'Important rule: NTA conducts CUET UG/PG only for scoring — it does NOT allocate college seats. Similarly, BITSAT, VITEEE, SRMJEEE, MET, and AEEE each run separate university counselling portals.',
    whoIsEligible:
      'CUET UG/PG scorers (applying to Central/State/Private universities) and BITSAT/VITEEE/SRMJEEE/MET/AEEE rank holders.',
    registrationProcess:
      'After exam score declaration, apply SEPARATELY on each target university admission portal (e.g., admission.uod.ac.in for DU CSAS, bhuonline.in for BHU, bitsadmission.com for BITS).',
    documentsRequired: [
      'Exam Score Card / Rank Card (CUET / BITSAT / VITEEE / MET / SRMJEEE / AEEE)',
      'Class 10 & Class 12 Marks Cards (exact board percentage)',
      'Migration / Transfer Certificate & Category / Income proof (if claiming scholarship or reservation)',
    ],
    choiceFillingGuide:
      'For DU CSAS, map only CUET subjects matching your Class 12 board subjects and submit maximum eligible college-course pairs. For VIT/Amrita/BITS, choose campus + branch + fee-slab carefully.',
    seatAllotmentProcess:
      'Iterative online allotments (e.g., CSAS Rounds 1–3, BITS Iterations 1–6, Amrita CSAP Rounds, MAHE Rounds).',
    reportingProcess:
      'Accept allocated seat before the short university deadline, pay initial advance/semester tuition fee online, and attend physical orientation/document check.',
    feePaymentInfo:
      'University-specific counselling & seat-blocking fees apply; carefully check AICTE/UGC refund deadline policies before paying multiple private universities.',
    subsequentRoundsInfo:
      'Track spot/mop-up rounds directly on each university’s official admissions webpage.',
    commonMistakes: [
      'Thinking registering for CUET UG automatically enters you into Delhi University or BHU counselling (you MUST register separately on DU CSAS / BHU portal)',
      'Ignoring private university refund cutoff dates when awaiting JoSAA or KCET results',
    ],
    officialWebsiteUrl: 'https://exams.nta.ac.in/CUET-UG/',
    sourceUrl: 'https://admission.uod.ac.in/',
  }),
];

export async function ensureVerifiedCounsellingGuides(): Promise<void> {
  await db
    .insert(counsellingGuides)
    .values(VERIFIED_COUNSELLING_GUIDES)
    .onConflictDoNothing({ target: counsellingGuides.slug });
}
