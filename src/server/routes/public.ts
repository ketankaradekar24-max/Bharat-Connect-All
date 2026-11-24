import { Router } from 'express';
import { and, count, eq } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import {
  counsellingGuides,
  exams,
  institutions,
  jobs,
  publicServices,
  scholarshipApplications,
  scholarships,
  users,
} from '../../db/schema.ts';
import { ensureBaselineScholarships } from '../../db/seed.ts';
import { ensureExpandedScholarships } from '../../db/seedScholarshipsExpanded.ts';
import { ensureBaselinePublicServices } from '../../db/seedServices.ts';
import { ensureExpandedPublicServices } from '../../db/seedServicesExpanded.ts';
import { ensureBaselineExams } from '../../db/seedExams.ts';
import { ensureExpandedExams } from '../../db/seedExamsExpanded.ts';
import { ensureVerifiedInstitutions } from '../../db/seedInstitutions.ts';
import { ensureVerifiedCounsellingGuides } from '../../db/seedCounselling.ts';
import { ensureBaselineJobs } from '../../db/seedJobs.ts';

const router = Router();
let baselinePromise: Promise<void> | null = null;

export async function initBaselineOnce(): Promise<void> {
  if (!baselinePromise) {
    baselinePromise = (async () => {
      await ensureBaselineScholarships();
      await ensureExpandedScholarships();
      await ensureBaselinePublicServices();
      await ensureExpandedPublicServices();
      await ensureBaselineExams();
      await ensureExpandedExams();
      await ensureVerifiedInstitutions();
      await ensureVerifiedCounsellingGuides();
      await ensureBaselineJobs();
    })().catch((error) => {
      baselinePromise = null;
      console.error('Baseline seed check error:', error);
    });
  }
  await baselinePromise;
}

router.get('/public/stats', async (_req, res) => {
  try {
    await initBaselineOnce();

    const [
      verifiedCountRows,
      verifiedServiceRows,
      verifiedExamRows,
      verifiedJobRows,
      verifiedInstitutionRows,
      verifiedCounsellingRows,
      studentCountRows,
      trackedCountRows,
      categoryRows,
    ] = await Promise.all([
      db
        .select({ value: count() })
        .from(scholarships)
        .where(
          and(
            eq(scholarships.verificationStatus, 'verified'),
            eq(scholarships.publishStatus, 'published')
          )
        ),
      db
        .select({ value: count() })
        .from(publicServices)
        .where(
          and(
            eq(publicServices.verificationStatus, 'verified'),
            eq(publicServices.publishStatus, 'published')
          )
        ),
      db
        .select({ value: count() })
        .from(exams)
        .where(
          and(eq(exams.verificationStatus, 'verified'), eq(exams.publishStatus, 'published'))
        ),
      db
        .select({ value: count() })
        .from(jobs)
        .where(and(eq(jobs.verificationStatus, 'verified'), eq(jobs.publishStatus, 'published'))),
      db
        .select({ value: count() })
        .from(institutions)
        .where(
          and(
            eq(institutions.verificationStatus, 'verified'),
            eq(institutions.publishStatus, 'published')
          )
        ),
      db
        .select({ value: count() })
        .from(counsellingGuides)
        .where(
          and(
            eq(counsellingGuides.verificationStatus, 'verified'),
            eq(counsellingGuides.publishStatus, 'published')
          )
        ),
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(scholarshipApplications),
      db
        .selectDistinct({ category: scholarships.category })
        .from(scholarships)
        .where(
          and(
            eq(scholarships.verificationStatus, 'verified'),
            eq(scholarships.publishStatus, 'published')
          )
        ),
    ]);

    res.json({
      verifiedScholarships: Number(verifiedCountRows[0]?.value ?? 0),
      verifiedServices: Number(verifiedServiceRows[0]?.value ?? 0),
      verifiedExams: Number(verifiedExamRows[0]?.value ?? 0),
      verifiedJobs: Number(verifiedJobRows[0]?.value ?? 0),
      verifiedInstitutions: Number(verifiedInstitutionRows[0]?.value ?? 0),
      verifiedCounsellingGuides: Number(verifiedCounsellingRows[0]?.value ?? 0),
      registeredStudents: Number(studentCountRows[0]?.value ?? 0),
      trackedApplications: Number(trackedCountRows[0]?.value ?? 0),
      scholarshipCategories: categoryRows.length,
    });
  } catch (error) {
    console.error('Public stats error:', error);
    res.status(500).json({ error: 'Unable to load platform statistics.' });
  }
});

export default router;
