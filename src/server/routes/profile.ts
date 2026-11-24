import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.ts';
import { studentProfiles, users } from '../../db/schema.ts';
import { requireAuth, type AuthRequest } from '../../middleware/auth.ts';
import { getUserSessionData } from '../../db/users.ts';
import { computeProfileCompletion } from '../../services/eligibility.ts';

const router = Router();

const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(120),
  state: z.string().trim().max(80).nullable().optional(),
  district: z.string().trim().max(80).nullable().optional(),
  educationLevel: z
    .enum(['School', 'PUC', 'Diploma', 'Undergraduate', 'Postgraduate', 'Professional'])
    .nullable()
    .optional(),
  course: z.string().trim().max(120).nullable().optional(),
  institution: z.string().trim().max(180).nullable().optional(),
  academicYear: z.string().trim().max(40).nullable().optional(),
  marksPercentage: z.number().min(0).max(100).nullable().optional(),
  annualFamilyIncome: z.number().int().min(0).max(100000000).nullable().optional(),
  category: z
    .enum(['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority', 'Prefer not to say'])
    .nullable()
    .optional(),
  disabilityStatus: z.boolean().optional(),
  gender: z.enum(['Female', 'Male', 'Other', 'Prefer not to say']).nullable().optional(),
});

router.get('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const session = await getUserSessionData(req.dbUser!.id);
    res.json({
      profile: session.profile,
      profileCompletion: computeProfileCompletion(session.profile),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Unable to load student profile.' });
  }
});

router.put('/profile', requireAuth, async (req: AuthRequest, res) => {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid profile details.',
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }

  const data = parsed.data;

  try {
    await db
      .update(studentProfiles)
      .set({
        fullName: data.fullName,
        state: data.state ?? null,
        district: data.district ?? null,
        educationLevel: data.educationLevel ?? null,
        course: data.course ?? null,
        institution: data.institution ?? null,
        academicYear: data.academicYear ?? null,
        marksPercentage: data.marksPercentage ?? null,
        annualFamilyIncome: data.annualFamilyIncome ?? null,
        category: data.category === 'Prefer not to say' ? null : (data.category ?? null),
        disabilityStatus: data.disabilityStatus ?? false,
        gender: data.gender === 'Prefer not to say' ? null : (data.gender ?? null),
        updatedAt: new Date(),
      })
      .where(eq(studentProfiles.userId, req.dbUser!.id));

    await db
      .update(users)
      .set({
        displayName: data.fullName,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.dbUser!.id));

    const session = await getUserSessionData(req.dbUser!.id);
    res.json({
      ...session,
      profileCompletion: computeProfileCompletion(session.profile),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to save student profile.' });
  }
});

export default router;
