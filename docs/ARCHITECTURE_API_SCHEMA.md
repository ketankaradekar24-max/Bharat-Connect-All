# Bharat Connect — Architecture, Schema & API Reference

## Runtime Architecture
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React (`en`, `kn`, `hi` LanguageContext)
- **Backend**: Express (`server.ts` on port `3000`) with Helmet security headers, `express-rate-limit`, Zod request validation, and Firebase Admin ID token verification
- **Database**: Managed Cloud SQL (PostgreSQL) via Drizzle ORM (`src/db/schema.ts`) — 10 tables (`users`, `student_profiles`, `scholarships`, `saved_scholarships`, `scholarship_applications`, `notifications`, `user_notification_preferences`, `admin_audit_logs`, `public_services`, `user_service_tracker`)

## API Endpoints
### Public
- `GET /api/health` — Service health status
- `GET /api/public/stats` — Live database counts (`verifiedScholarships`, `verifiedServices`, `registeredStudents`, `trackedApplications`, `scholarshipCategories`)
- `GET /api/scholarships` — Verified & published scholarship catalog with search and filter query params (`q`, `state`, `educationLevel`, `category`, `providerType`)
- `GET /api/scholarships/:slug` — Detailed scholarship view with optional eligibility pre-check when authenticated
- `GET /api/search/unified` — Unified keyword & token search across verified `public_services` and `scholarships` (`q`, `state`)
- `GET /api/services` — Verified & published public services directory (`q`, `category`, `state`, `jurisdiction`, `country`)
- `GET /api/services/:slug` — Standardized 12-section service guide with optional user tracker state

### Authentication & Profile (`Bearer <Firebase ID Token>`)
- `POST /api/auth/session` — Verifies Firebase ID token, upserts user/profile/preferences, returns session payload
- `POST /api/admin/bootstrap` — One-time promotion to `admin` allowed only when zero admins exist
- `GET /api/profile` — Fetch student profile and completion percentage
- `PUT /api/profile` — Update student profile (Zod-validated, data-minimized)

### Student & Citizen Workspace (`Bearer <Firebase ID Token>`)
- `GET /api/student/dashboard` — Profile completion, recommended matches, saved items, applications, deadlines, notifications, next steps
- `POST /api/student/saved/:scholarshipId` / `DELETE /api/student/saved/:scholarshipId` — Save/remove scholarship
- `GET /api/student/applications` / `POST /api/student/applications` / `PATCH /api/student/applications/:id` / `DELETE /api/student/applications/:id` — Manual scholarship application tracker with status history
- `GET /api/student/services/tracker` / `PUT /api/student/services/:serviceId/tracker` / `DELETE /api/student/services/:serviceId/tracker` — Saved public services, interactive document & step checklists, manual reference numbers, appointment dates, reminders, and notes
- `GET /api/student/notifications` / `PATCH /api/student/notifications/:id/read` / `PATCH /api/student/notifications/read-all`
- `GET /api/student/notification-preferences` / `PUT /api/student/notification-preferences`

### Administrator Console (`Bearer <Firebase ID Token>` + `role === 'admin'`)
- `GET /api/admin/overview` — Platform stats, recent audit logs, user directory summary
- `GET /api/admin/scholarships` / `POST /api/admin/scholarships` / `PUT /api/admin/scholarships/:id` — Scholarship CRUD + audit log
- `POST /api/admin/scholarships/:id/workflow` — Execute `verify`, `publish`, `verify_and_publish`, `unpublish`, `reject`, or `archive` + audit log + student notifications on publish
- `GET /api/admin/services` / `POST /api/admin/services` / `PUT /api/admin/services/:id` — Public Service CRUD + audit log
- `POST /api/admin/services/:id/workflow` — Execute `verify`, `publish`, `verify_and_publish`, `unpublish`, `reject`, or `retire` + audit log + 3-month `nextReviewAt` calculation

