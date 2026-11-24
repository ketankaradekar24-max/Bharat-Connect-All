import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    uid: text('uid').notNull().unique(),
    email: text('email').notNull(),
    displayName: text('display_name').notNull(),
    role: text('role').notNull().default('student'),
    isSuspended: boolean('is_suspended').notNull().default(false),
    onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('users_role_idx').on(table.role)]
);

export const studentProfiles = pgTable('student_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  fullName: text('full_name').notNull(),
  state: text('state'),
  district: text('district'),
  educationLevel: text('education_level'),
  course: text('course'),
  institution: text('institution'),
  academicYear: text('academic_year'),
  marksPercentage: doublePrecision('marks_percentage'),
  annualFamilyIncome: integer('annual_family_income'),
  category: text('category'),
  disabilityStatus: boolean('disability_status').notNull().default(false),
  gender: text('gender'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const scholarships = pgTable(
  'scholarships',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    providerName: text('provider_name').notNull(),
    providerType: text('provider_type').notNull(),
    department: text('department'),
    category: text('category').notNull(),
    state: text('state').notNull().default('All India'),
    district: text('district'),
    educationLevels: jsonb('education_levels').$type<string[]>().notNull(),
    eligibleCourses: jsonb('eligible_courses').$type<string[]>().notNull(),
    minMarksPercentage: doublePrecision('min_marks_percentage'),
    maxFamilyIncome: integer('max_family_income'),
    eligibleCategories: jsonb('eligible_categories').$type<string[]>().notNull(),
    requiresDisability: boolean('requires_disability').notNull().default(false),
    genderEligibility: text('gender_eligibility').default('All'),
    amountDisplay: text('amount_display'),
    summary: text('summary').notNull(),
    overview: text('overview').notNull(),
    whoCanApply: text('who_can_apply').notNull(),
    eligibilityDetails: text('eligibility_details').notNull(),
    benefitsSummary: text('benefits_summary').notNull(),
    requiredDocuments: jsonb('required_documents').$type<string[]>().notNull(),
    applicationProcedure: text('application_procedure').notNull(),
    importantDatesText: text('important_dates_text'),
    deadlineDate: text('deadline_date'),
    officialSourceName: text('official_source_name').notNull(),
    officialSourceUrl: text('official_source_url').notNull(),
    officialApplyUrl: text('official_apply_url').notNull(),
    verificationStatus: text('verification_status').notNull().default('pending'),
    publishStatus: text('publish_status').notNull().default('draft'),
    lastVerifiedAt: timestamp('last_verified_at'),
    verifiedByUserId: integer('verified_by_user_id').references(() => users.id),
    createdByUserId: integer('created_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('scholarships_publish_verify_idx').on(table.publishStatus, table.verificationStatus),
    index('scholarships_state_idx').on(table.state),
    index('scholarships_category_idx').on(table.category),
  ]
);

export const savedScholarships = pgTable(
  'saved_scholarships',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    scholarshipId: integer('scholarship_id')
      .references(() => scholarships.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('saved_user_scholarship_uidx').on(table.userId, table.scholarshipId)]
);

export const scholarshipApplications = pgTable(
  'scholarship_applications',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    scholarshipId: integer('scholarship_id')
      .references(() => scholarships.id, { onDelete: 'cascade' })
      .notNull(),
    status: text('status').notNull().default('Interested'),
    notes: text('notes'),
    statusHistory: jsonb('status_history')
      .$type<Array<{ status: string; note?: string; changedAt: string }>>()
      .notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('app_user_scholarship_uidx').on(table.userId, table.scholarshipId)]
);

export const notifications = pgTable(
  'notifications',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: text('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    linkUrl: text('link_url'),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('notifications_user_read_idx').on(table.userId, table.isRead)]
);

export const userNotificationPreferences = pgTable('user_notification_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  inAppNewScholarships: boolean('in_app_new_scholarships').notNull().default(true),
  inAppDeadlineReminders: boolean('in_app_deadline_reminders').notNull().default(true),
  inAppAnnouncements: boolean('in_app_announcements').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const adminAuditLogs = pgTable(
  'admin_audit_logs',
  {
    id: serial('id').primaryKey(),
    actorUserId: integer('actor_user_id')
      .references(() => users.id)
      .notNull(),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    details: jsonb('details').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('audit_actor_idx').on(table.actorUserId)]
);

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  savedScholarships: many(savedScholarships),
  applications: many(scholarshipApplications),
  notifications: many(notifications),
  notificationPreferences: one(userNotificationPreferences, {
    fields: [users.id],
    references: [userNotificationPreferences.userId],
  }),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
}));

export const scholarshipsRelations = relations(scholarships, ({ many }) => ({
  savedBy: many(savedScholarships),
  applications: many(scholarshipApplications),
}));

export const savedScholarshipsRelations = relations(savedScholarships, ({ one }) => ({
  user: one(users, {
    fields: [savedScholarships.userId],
    references: [users.id],
  }),
  scholarship: one(scholarships, {
    fields: [savedScholarships.scholarshipId],
    references: [scholarships.id],
  }),
}));

export const scholarshipApplicationsRelations = relations(scholarshipApplications, ({ one }) => ({
  user: one(users, {
    fields: [scholarshipApplications.userId],
    references: [users.id],
  }),
  scholarship: one(scholarships, {
    fields: [scholarshipApplications.scholarshipId],
    references: [scholarships.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const publicServices = pgTable(
  'public_services',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    category: text('category').notNull(),
    subcategory: text('subcategory').notNull(),
    departmentOrAuthority: text('department_or_authority').notNull(),
    jurisdiction: text('jurisdiction').notNull().default('Central'),
    state: text('state').notNull().default('All India'),
    country: text('country'),
    summary: text('summary').notNull(),
    overview: text('overview').notNull(),
    whoCanApply: text('who_can_apply').notNull(),
    eligibilityRequirements: text('eligibility_requirements').notNull(),
    documentsRequired: jsonb('documents_required').$type<string[]>().notNull(),
    applicationSteps: jsonb('application_steps').$type<string[]>().notNull(),
    officialFees: text('official_fees').notNull(),
    appointmentProcess: text('appointment_process'),
    trackingGuidance: text('tracking_guidance').notNull(),
    commonMistakes: jsonb('common_mistakes').$type<string[]>().notNull(),
    faqs: jsonb('faqs').$type<Array<{ q: string; a: string }>>().notNull(),
    translations: jsonb('translations').$type<{
      kn?: { title?: string; summary?: string; overview?: string };
      hi?: { title?: string; summary?: string; overview?: string };
    }>(),
    officialWebsiteName: text('official_website_name').notNull(),
    officialWebsiteUrl: text('official_website_url').notNull(),
    officialApplyUrl: text('official_apply_url').notNull(),
    sourceUrl: text('source_url').notNull(),
    isThirdParty: boolean('is_third_party').notNull().default(false),
    verificationStatus: text('verification_status').notNull().default('pending'),
    publishStatus: text('publish_status').notNull().default('draft'),
    lastVerifiedAt: timestamp('last_verified_at'),
    nextReviewAt: timestamp('next_review_at'),
    verifiedByUserId: integer('verified_by_user_id').references(() => users.id),
    createdByUserId: integer('created_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('services_publish_verify_idx').on(table.publishStatus, table.verificationStatus),
    index('services_category_idx').on(table.category),
    index('services_state_idx').on(table.state),
  ]
);

export const userServiceTracker = pgTable(
  'user_service_tracker',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    serviceId: integer('service_id')
      .references(() => publicServices.id, { onDelete: 'cascade' })
      .notNull(),
    isSaved: boolean('is_saved').notNull().default(true),
    status: text('status').notNull().default('Saved'),
    completedSteps: jsonb('completed_steps').$type<number[]>().notNull(),
    checkedDocuments: jsonb('checked_documents').$type<number[]>().notNull(),
    referenceNumber: text('reference_number'),
    appointmentDate: text('appointment_date'),
    reminderDate: text('reminder_date'),
    notes: text('notes'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('tracker_user_service_uidx').on(table.userId, table.serviceId)]
);

export const publicServicesRelations = relations(publicServices, ({ many }) => ({
  trackers: many(userServiceTracker),
}));

export const userServiceTrackerRelations = relations(userServiceTracker, ({ one }) => ({
  user: one(users, {
    fields: [userServiceTracker.userId],
    references: [users.id],
  }),
  service: one(publicServices, {
    fields: [userServiceTracker.serviceId],
    references: [publicServices.id],
  }),
}));

export const exams = pgTable(
  'exams',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    examName: text('exam_name').notNull(),
    fullName: text('full_name').notNull(),
    category: text('category').notNull(),
    subcategory: text('subcategory').notNull(),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    conductingAuthority: text('conducting_authority').notNull(),
    jurisdiction: text('jurisdiction').notNull().default('Central'),
    state: text('state').notNull().default('All India'),
    examPurpose: text('exam_purpose').notNull(),
    whoShouldApply: text('who_should_apply').notNull(),
    eligibility: text('eligibility').notNull(),
    ageLimit: text('age_limit').notNull(),
    qualificationRequirements: text('qualification_requirements').notNull(),
    examPattern: text('exam_pattern').notNull(),
    syllabusSummary: text('syllabus_summary').notNull(),
    importantDatesText: text('important_dates_text').notNull(),
    nextExamDate: text('next_exam_date'),
    registrationInfo: text('registration_info').notNull(),
    applicationFee: text('application_fee').notNull(),
    requiredDocuments: jsonb('required_documents').$type<string[]>().notNull(),
    applicationSteps: jsonb('application_steps').$type<string[]>().notNull(),
    admitCardInfo: text('admit_card_info').notNull(),
    prepResources: jsonb('prep_resources')
      .$type<Array<{ title: string; url: string; source: string }>>()
      .notNull(),
    previousPapersInfo: text('previous_papers_info').notNull(),
    previousPapersUrl: text('previous_papers_url'),
    resultsInfo: text('results_info').notNull(),
    counsellingProcess: text('counselling_process').notNull(),
    officialWebsiteUrl: text('official_website_url').notNull(),
    officialApplyUrl: text('official_apply_url').notNull(),
    officialNotificationUrl: text('official_notification_url').notNull(),
    verificationStatus: text('verification_status').notNull().default('pending'),
    publishStatus: text('publish_status').notNull().default('draft'),
    lastVerifiedAt: timestamp('last_verified_at'),
    nextReviewAt: timestamp('next_review_at'),
    verifiedByUserId: integer('verified_by_user_id').references(() => users.id),
    createdByUserId: integer('created_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('exams_publish_verify_idx').on(table.publishStatus, table.verificationStatus),
    index('exams_category_idx').on(table.category),
    index('exams_state_idx').on(table.state),
  ]
);

export const userExamTrackers = pgTable(
  'user_exam_trackers',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    examId: integer('exam_id')
      .references(() => exams.id, { onDelete: 'cascade' })
      .notNull(),
    isSaved: boolean('is_saved').notNull().default(true),
    status: text('status').notNull().default('Interested'),
    checkedDocuments: jsonb('checked_documents').$type<number[]>().notNull(),
    completedSteps: jsonb('completed_steps').$type<number[]>().notNull(),
    reminderDate: text('reminder_date'),
    notes: text('notes'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('tracker_user_exam_uidx').on(table.userId, table.examId)]
);

export const jobs = pgTable(
  'jobs',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    organization: text('organization').notNull(),
    category: text('category').notNull(),
    state: text('state').notNull().default('All India'),
    location: text('location').notNull(),
    qualification: text('qualification').notNull(),
    ageCriteria: text('age_criteria').notNull(),
    vacancyInfo: text('vacancy_info').notNull(),
    salaryPayScale: text('salary_pay_scale').notNull(),
    experienceLevel: text('experience_level').notNull().default('Freshers & Experienced'),
    deadlineText: text('deadline_text').notNull(),
    deadlineDate: text('deadline_date'),
    summary: text('summary').notNull(),
    applicationSteps: jsonb('application_steps').$type<string[]>().notNull(),
    requiredDocuments: jsonb('required_documents').$type<string[]>().notNull(),
    officialNotificationUrl: text('official_notification_url').notNull(),
    officialApplyUrl: text('official_apply_url').notNull(),
    officialSourceName: text('official_source_name').notNull(),
    verificationStatus: text('verification_status').notNull().default('pending'),
    publishStatus: text('publish_status').notNull().default('draft'),
    lastVerifiedAt: timestamp('last_verified_at'),
    nextReviewAt: timestamp('next_review_at'),
    verifiedByUserId: integer('verified_by_user_id').references(() => users.id),
    createdByUserId: integer('created_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('jobs_publish_verify_idx').on(table.publishStatus, table.verificationStatus),
    index('jobs_category_idx').on(table.category),
    index('jobs_state_idx').on(table.state),
  ]
);

export const userJobTrackers = pgTable(
  'user_job_trackers',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    jobId: integer('job_id')
      .references(() => jobs.id, { onDelete: 'cascade' })
      .notNull(),
    isSaved: boolean('is_saved').notNull().default(true),
    status: text('status').notNull().default('Interested'),
    reminderDate: text('reminder_date'),
    notes: text('notes'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('tracker_user_job_uidx').on(table.userId, table.jobId)]
);

export const communityPosts = pgTable(
  'community_posts',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    authorName: text('author_name').notNull(),
    category: text('category').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    tags: jsonb('tags').$type<string[]>().notNull(),
    helpfulCount: integer('helpful_count').notNull().default(0),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('community_posts_category_idx').on(table.category),
    index('community_posts_status_idx').on(table.status),
  ]
);

export const communityReplies = pgTable(
  'community_replies',
  {
    id: serial('id').primaryKey(),
    postId: integer('post_id')
      .references(() => communityPosts.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    authorName: text('author_name').notNull(),
    body: text('body').notNull(),
    helpfulCount: integer('helpful_count').notNull().default(0),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('community_replies_post_idx').on(table.postId)]
);

export const communityVotes = pgTable(
  'community_votes',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    targetType: text('target_type').notNull(),
    targetId: integer('target_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('community_vote_uidx').on(table.userId, table.targetType, table.targetId),
  ]
);

export const communityBookmarks = pgTable(
  'community_bookmarks',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    postId: integer('post_id')
      .references(() => communityPosts.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('community_bookmark_uidx').on(table.userId, table.postId)]
);

export const communityReports = pgTable(
  'community_reports',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    targetType: text('target_type').notNull(),
    targetId: integer('target_id').notNull(),
    reason: text('reason').notNull(),
    status: text('status').notNull().default('open'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('community_reports_status_idx').on(table.status)]
);

export const examsRelations = relations(exams, ({ many }) => ({
  trackers: many(userExamTrackers),
}));

export const userExamTrackersRelations = relations(userExamTrackers, ({ one }) => ({
  user: one(users, { fields: [userExamTrackers.userId], references: [users.id] }),
  exam: one(exams, { fields: [userExamTrackers.examId], references: [exams.id] }),
}));

export const jobsRelations = relations(jobs, ({ many }) => ({
  trackers: many(userJobTrackers),
}));

export const userJobTrackersRelations = relations(userJobTrackers, ({ one }) => ({
  user: one(users, { fields: [userJobTrackers.userId], references: [users.id] }),
  job: one(jobs, { fields: [userJobTrackers.jobId], references: [jobs.id] }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  user: one(users, { fields: [communityPosts.userId], references: [users.id] }),
  replies: many(communityReplies),
}));

export const communityRepliesRelations = relations(communityReplies, ({ one }) => ({
  post: one(communityPosts, { fields: [communityReplies.postId], references: [communityPosts.id] }),
  user: one(users, { fields: [communityReplies.userId], references: [users.id] }),
}));

export const institutions = pgTable(
  'institutions',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    shortName: text('short_name').notNull(),
    category: text('category').notNull(),
    institutionType: text('institution_type').notNull(),
    primaryStream: text('primary_stream').notNull(),
    streams: jsonb('streams').$type<string[]>().notNull(),
    state: text('state').notNull(),
    city: text('city').notNull(),
    campuses: jsonb('campuses').$type<string[]>().notNull(),
    coursesOffered: jsonb('courses_offered').$type<string[]>().notNull(),
    entranceExamsAccepted: jsonb('entrance_exams_accepted').$type<string[]>().notNull(),
    admissionRoutes: jsonb('admission_routes')
      .$type<
        Array<{
          routeName: string;
          examOrBasis: string;
          counsellingAuthority: string;
          eligibility: string;
          notes: string;
        }>
      >()
      .notNull(),
    overview: text('overview').notNull(),
    affiliatedCollegesInfo: text('affiliated_colleges_info'),
    ugAdmissionsInfo: text('ug_admissions_info').notNull(),
    pgAdmissionsInfo: text('pg_admissions_info'),
    lateralEntryInfo: text('lateral_entry_info'),
    quotaAndCounsellingInfo: text('quota_and_counselling_info').notNull(),
    feesInfo: text('fees_info').notNull(),
    feesReliability: text('fees_reliability').notNull().default('official_bulletin'),
    scholarshipsInfo: text('scholarships_info').notNull(),
    officialWebsiteUrl: text('official_website_url').notNull(),
    officialAdmissionUrl: text('official_admission_url').notNull(),
    sourceUrl: text('source_url').notNull(),
    verificationStatus: text('verification_status').notNull().default('pending'),
    publishStatus: text('publish_status').notNull().default('draft'),
    lastVerifiedAt: timestamp('last_verified_at'),
    nextReviewAt: timestamp('next_review_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('institutions_publish_verify_idx').on(table.publishStatus, table.verificationStatus),
    index('institutions_state_idx').on(table.state),
    index('institutions_stream_idx').on(table.primaryStream),
    index('institutions_type_idx').on(table.institutionType),
  ]
);

export const counsellingGuides = pgTable(
  'counselling_guides',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    authorityCode: text('authority_code').notNull(),
    title: text('title').notNull(),
    stream: text('stream').notNull(),
    scope: text('scope').notNull().default('Central'),
    state: text('state').notNull().default('All India'),
    conductingBody: text('conducting_body').notNull(),
    overview: text('overview').notNull(),
    whoIsEligible: text('who_is_eligible').notNull(),
    registrationProcess: text('registration_process').notNull(),
    documentsRequired: jsonb('documents_required').$type<string[]>().notNull(),
    choiceFillingGuide: text('choice_filling_guide').notNull(),
    seatAllotmentProcess: text('seat_allotment_process').notNull(),
    reportingProcess: text('reporting_process').notNull(),
    feePaymentInfo: text('fee_payment_info').notNull(),
    subsequentRoundsInfo: text('subsequent_rounds_info').notNull(),
    importantDeadlinesText: text('important_deadlines_text').notNull(),
    commonMistakes: jsonb('common_mistakes').$type<string[]>().notNull(),
    officialWebsiteUrl: text('official_website_url').notNull(),
    sourceUrl: text('source_url').notNull(),
    verificationStatus: text('verification_status').notNull().default('pending'),
    publishStatus: text('publish_status').notNull().default('draft'),
    lastVerifiedAt: timestamp('last_verified_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('counselling_publish_verify_idx').on(table.publishStatus, table.verificationStatus),
    index('counselling_stream_idx').on(table.stream),
    index('counselling_state_idx').on(table.state),
  ]
);

export const contentReports = pgTable(
  'content_reports',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    entityType: text('entity_type').notNull(),
    entitySlug: text('entity_slug'),
    entityTitle: text('entity_title').notNull(),
    reportType: text('report_type').notNull().default('outdated_info'),
    reportedUrl: text('reported_url'),
    description: text('description').notNull(),
    contactEmail: text('contact_email'),
    status: text('status').notNull().default('open'),
    resolutionNote: text('resolution_note'),
    resolvedByUserId: integer('resolved_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('content_reports_status_idx').on(table.status),
    index('content_reports_entity_idx').on(table.entityType, table.entitySlug),
  ]
);

export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: serial('id').primaryKey(),
    eventType: text('event_type').notNull(),
    path: text('path').notNull(),
    label: text('label'),
    visitorHash: text('visitor_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('analytics_event_type_idx').on(table.eventType),
    index('analytics_created_at_idx').on(table.createdAt),
    index('analytics_visitor_hash_idx').on(table.visitorHash),
  ]
);

