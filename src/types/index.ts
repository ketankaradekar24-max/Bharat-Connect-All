export type UserRole = 'student' | 'admin';

export interface DbUser {
  id: number;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isSuspended: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: number;
  userId: number;
  fullName: string;
  state: string | null;
  district: string | null;
  educationLevel: string | null;
  course: string | null;
  institution: string | null;
  academicYear: string | null;
  marksPercentage: number | null;
  annualFamilyIncome: number | null;
  category: string | null;
  disabilityStatus: boolean;
  gender: string | null;
  updatedAt: string;
}

export interface ProfileCompletion {
  percentage: number;
  missingFields: string[];
}

export interface NotificationPreferences {
  id: number;
  userId: number;
  inAppNewScholarships: boolean;
  inAppDeadlineReminders: boolean;
  inAppAnnouncements: boolean;
}

export interface EligibilityAssessment {
  outcome: 'Potentially Eligible' | 'Not Eligible' | 'Insufficient Information';
  matchedReasons: string[];
  failedReasons: string[];
  missingFields: string[];
  disclaimer: string;
}

export interface Scholarship {
  id: number;
  slug: string;
  title: string;
  providerName: string;
  providerType: string;
  department: string | null;
  category: string;
  state: string;
  district: string | null;
  educationLevels: string[];
  eligibleCourses: string[];
  minMarksPercentage: number | null;
  maxFamilyIncome: number | null;
  eligibleCategories: string[];
  requiresDisability: boolean;
  genderEligibility?: string | null;
  amountDisplay?: string | null;
  summary: string;
  overview: string;
  whoCanApply: string;
  eligibilityDetails: string;
  benefitsSummary: string;
  requiredDocuments: string[];
  applicationProcedure: string;
  importantDatesText: string | null;
  deadlineDate: string | null;
  officialSourceName: string;
  officialSourceUrl: string;
  officialApplyUrl: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'incomplete';
  publishStatus: 'draft' | 'published' | 'unpublished' | 'archived';
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  eligibility?: EligibilityAssessment | null;
  isSaved?: boolean;
  applicationStatus?: string | null;
}

export type ApplicationStatus =
  | 'Interested'
  | 'Preparing Documents'
  | 'Ready to Apply'
  | 'Applied'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Closed';

export interface StatusHistoryEntry {
  status: string;
  note?: string;
  changedAt: string;
}

export interface ScholarshipApplication {
  id: number;
  userId: number;
  scholarshipId: number;
  status: ApplicationStatus;
  notes: string | null;
  statusHistory: StatusHistoryEntry[];
  updatedAt: string;
  createdAt: string;
  scholarship: Scholarship;
}

export interface NotificationItem {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PublicStats {
  verifiedScholarships: number;
  verifiedServices: number;
  verifiedExams: number;
  verifiedJobs: number;
  verifiedInstitutions: number;
  verifiedCounsellingGuides: number;
  registeredStudents: number;
  trackedApplications: number;
  scholarshipCategories: number;
}

export type SupportedLanguage = 'en' | 'kn' | 'hi';

export type ServiceTrackerStatus =
  | 'Saved'
  | 'Preparing Documents'
  | 'Appointment Scheduled'
  | 'Submitted Externally'
  | 'Completed';

export interface UserServiceTracker {
  id: number;
  userId: number;
  serviceId: number;
  isSaved: boolean;
  status: ServiceTrackerStatus;
  completedSteps: number[];
  checkedDocuments: number[];
  referenceNumber: string | null;
  appointmentDate: string | null;
  reminderDate: string | null;
  notes: string | null;
  updatedAt: string;
  createdAt: string;
  service?: PublicService;
}

export interface PublicService {
  id: number;
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  departmentOrAuthority: string;
  jurisdiction: string;
  state: string;
  country: string | null;
  summary: string;
  overview: string;
  whoCanApply: string;
  eligibilityRequirements: string;
  documentsRequired: string[];
  applicationSteps: string[];
  officialFees: string;
  appointmentProcess: string | null;
  trackingGuidance: string;
  commonMistakes: string[];
  faqs: Array<{ q: string; a: string }>;
  translations: {
    kn?: { title?: string; summary?: string; overview?: string };
    hi?: { title?: string; summary?: string; overview?: string };
  } | null;
  officialWebsiteName: string;
  officialWebsiteUrl: string;
  officialApplyUrl: string;
  sourceUrl: string;
  isThirdParty: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'incomplete';
  publishStatus: 'draft' | 'published' | 'unpublished' | 'retired';
  lastVerifiedAt: string | null;
  nextReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
  tracker?: UserServiceTracker | null;
}

export type ItemTrackerStatus =
  | 'Interested'
  | 'Preparing'
  | 'Documents Ready'
  | 'Applied'
  | 'Under Review'
  | 'Selected'
  | 'Rejected'
  | 'Completed';

export interface UserExamTracker {
  id: number;
  userId: number;
  examId: number;
  isSaved: boolean;
  status: string;
  checkedDocuments: number[];
  completedSteps: number[];
  reminderDate: string | null;
  notes: string | null;
  updatedAt: string;
  createdAt: string;
  exam?: Exam;
}

export interface Exam {
  id: number;
  slug: string;
  examName: string;
  fullName: string;
  category: string;
  subcategory: string;
  tags: string[];
  conductingAuthority: string;
  jurisdiction: string;
  state: string;
  examPurpose: string;
  whoShouldApply: string;
  eligibility: string;
  ageLimit: string;
  qualificationRequirements: string;
  examPattern: string;
  syllabusSummary: string;
  importantDatesText: string;
  nextExamDate: string | null;
  registrationInfo: string;
  applicationFee: string;
  requiredDocuments: string[];
  applicationSteps: string[];
  admitCardInfo: string;
  prepResources: Array<{ title: string; url: string; source: string }>;
  previousPapersInfo: string;
  previousPapersUrl: string | null;
  resultsInfo: string;
  counsellingProcess: string;
  officialWebsiteUrl: string;
  officialApplyUrl: string;
  officialNotificationUrl: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'incomplete';
  publishStatus: 'draft' | 'published' | 'unpublished' | 'archived';
  lastVerifiedAt: string | null;
  nextReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
  tracker?: UserExamTracker | null;
}

export interface UserJobTracker {
  id: number;
  userId: number;
  jobId: number;
  isSaved: boolean;
  status: string;
  reminderDate: string | null;
  notes: string | null;
  updatedAt: string;
  createdAt: string;
  job?: JobListing;
}

export interface JobListing {
  id: number;
  slug: string;
  title: string;
  organization: string;
  category: string;
  state: string;
  location: string;
  qualification: string;
  ageCriteria: string;
  vacancyInfo: string;
  salaryPayScale: string;
  experienceLevel: string;
  deadlineText: string;
  deadlineDate: string | null;
  summary: string;
  applicationSteps: string[];
  requiredDocuments: string[];
  officialNotificationUrl: string;
  officialApplyUrl: string;
  officialSourceName: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'incomplete';
  publishStatus: 'draft' | 'published' | 'unpublished' | 'archived';
  lastVerifiedAt: string | null;
  nextReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
  tracker?: UserJobTracker | null;
}

export interface CommunityReply {
  id: number;
  postId: number;
  userId: number;
  authorName: string;
  body: string;
  helpfulCount: number;
  status: string;
  createdAt: string;
  hasVoted?: boolean;
}

export interface CommunityPost {
  id: number;
  userId: number;
  authorName: string;
  category: string;
  title: string;
  body: string;
  tags: string[];
  helpfulCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  replyCount?: number;
  hasVoted?: boolean;
  isBookmarked?: boolean;
  replies?: CommunityReply[];
}

export interface AuditLogEntry {
  id: number;
  actorUserId: number;
  actorName: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdmissionRouteEntry {
  routeName: string;
  examOrBasis: string;
  counsellingAuthority: string;
  eligibility: string;
  notes: string;
}

export interface Institution {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  institutionType: string;
  primaryStream: string;
  streams: string[];
  state: string;
  city: string;
  campuses: string[];
  coursesOffered: string[];
  entranceExamsAccepted: string[];
  admissionRoutes: AdmissionRouteEntry[];
  overview: string;
  affiliatedCollegesInfo: string | null;
  ugAdmissionsInfo: string;
  pgAdmissionsInfo: string | null;
  lateralEntryInfo: string | null;
  quotaAndCounsellingInfo: string;
  feesInfo: string;
  feesReliability: 'verified_range' | 'official_bulletin' | string;
  scholarshipsInfo: string;
  officialWebsiteUrl: string;
  officialAdmissionUrl: string;
  sourceUrl: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'incomplete';
  publishStatus: 'draft' | 'published' | 'unpublished' | 'archived';
  lastVerifiedAt: string | null;
  nextReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CounsellingGuide {
  id: number;
  slug: string;
  authorityCode: string;
  title: string;
  stream: string;
  scope: string;
  state: string;
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
  importantDeadlinesText: string;
  commonMistakes: string[];
  officialWebsiteUrl: string;
  sourceUrl: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'incomplete';
  publishStatus: 'draft' | 'published' | 'unpublished' | 'archived';
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

