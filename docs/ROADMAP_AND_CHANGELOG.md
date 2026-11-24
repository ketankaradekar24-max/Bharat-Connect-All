# Bharat Connect — Project Roadmap & Changelog

## Implemented (Phase 1, Core Phase 2 & Section 28 Public Services Hub)
- **Database (Cloud SQL PostgreSQL + Drizzle ORM)**:
  - Tables provisioned and verified: `users`, `student_profiles`, `scholarships`, `saved_scholarships`, `scholarship_applications`, `notifications`, `user_notification_preferences`, `admin_audit_logs`, `public_services`, `user_service_tracker`.
- **Authentication & Role-Based Access Control**:
  - Firebase Google Sign-In (`signInWithPopup`) with backend ID token verification (`firebase-admin`) and in-memory tokens.
  - Student profile onboarding and data-minimized profile management (never collecting Aadhaar numbers, OTPs, bank credentials, payment cards, or portal passwords).
  - Secure one-time zero-admin bootstrap (`POST /api/admin/bootstrap`) permanently locked once the first admin exists.
- **Scholarship Discovery & Eligibility Engine**:
  - Verified baseline official portal records seeded (Karnataka SSP Post-Matric, NSP Central Sector Scheme, AICTE Pragati, AICTE Saksham, Karnataka Vidyasiri).
  - Search and filters by state, education level, category, and provider type.
  - Deterministic rule-based eligibility engine returning `Potentially Eligible`, `Not Eligible`, or `Insufficient Information` with explicit matched/failed/missing reasons.
- **All-in-One Public Services Hub (Section 28)**:
  - **Explore Services Directory (`/services`)**: Covers 10 core service categories (Education & Scholarships, Driving Licence & Transport, Passport & Visa, Government Documents, Government Schemes, Government Jobs, Competitive Exams, Business & Entrepreneurship, Tax & Financial, Health & Public Services) with Karnataka-first & All India state prioritization.
  - **Unified Search (`GET /api/search/unified`)**: Single search bar returning matched official service guides and verified scholarships.
  - **Standardized 12-Section Application Assistant (`/services/:slug`)**: Interactive document & step checklists, official fee/appointment/tracking guidance, common mistakes, FAQs, and `ExternalPortalModal` confirmation before leaving Bharat Connect for official portals.
  - **11 Verified Baseline Service Guides**: Parivahan Driving Licence, Passport Seva, PAN Card, Voter ID (ECI), Karnataka Nadakacheri Certificates, Karnataka Seva Sindhu, Udyam MSME, UPSC/SSC Jobs & Exams, Ayushman Bharat PM-JAY, Germany Student Visa & APS, and Income Tax ITR Guidance.
  - **Language Accessibility**: English (`en`), Kannada (`kn`), and Hindi (`hi`) interface and service guide summaries with explicit official-English legal primacy notice.
- **User & Admin Workflows**:
  - Student/Citizen Dashboard: profile completion, recommended scholarships, saved scholarships, manual Application Tracker (8 statuses), Saved Services tab (`user_service_tracker` checklists, reference numbers, appointments, reminders, notes), in-app notifications, and preferences.
  - Admin Dashboard: platform statistics, create/edit & verify/publish/reject/archive workflows for both Scholarships and Public Services, audit logs, and user directory.
- **Public & Brand Foundation**:
  - Public homepage with unified search, language switcher, 10 service category cards, live database metrics, safety & independence disclosures, and FAQ.
  - About Us with editable Founder/Co-founder placeholder section, Contact info, Privacy Policy, Terms of Service, and Scholarship/Service Disclaimer.

## Remaining Phases (Next Iterations)
- **Phase 3**: Expand verified state-level service guides beyond Karnataka, deadline & appointment notification jobs, and mobile usability audits.
- **Phase 4**: Moderated Student & Citizen Community Forum (posts, comments, reactions, bookmarks, follows, reports, moderation queue), Education Resource Center, and Admin Announcements.
- **Phase 5**: Finalize Founder/Co-founder verified details, official support email/social links, and brand assets.
- **Phase 6**: Technical & Educational SEO (`sitemap.xml`, `robots.txt`, JSON-LD, original guides), shareable referrals with anti-abuse checks, Student Ambassador program, and privacy-conscious Analytics Dashboard.
- **Phase 7**: End-to-end user journey tests across viewports, security checklist sign-off, and production deployment configuration.

