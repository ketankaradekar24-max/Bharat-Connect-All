import type { scholarships, studentProfiles } from '../db/schema.ts';

export type ScholarshipRecord = typeof scholarships.$inferSelect;
export type StudentProfileRecord = typeof studentProfiles.$inferSelect;

export type EligibilityOutcome =
  | 'Potentially Eligible'
  | 'Not Eligible'
  | 'Insufficient Information';

export interface EligibilityAssessment {
  outcome: EligibilityOutcome;
  matchedReasons: string[];
  failedReasons: string[];
  missingFields: string[];
  disclaimer: string;
}

const DISCLAIMER =
  'Rule-based pre-check only. Final eligibility is always determined by the official scholarship provider on their portal.';

export function computeProfileCompletion(profile: StudentProfileRecord | null): {
  percentage: number;
  missingFields: string[];
} {
  if (!profile) {
    return {
      percentage: 0,
      missingFields: [
        'Full Name',
        'State',
        'District',
        'Education Level',
        'Course / Stream',
        'Institution',
        'Academic Year',
        'Marks Percentage',
        'Annual Family Income',
      ],
    };
  }

  const checks: Array<{ label: string; filled: boolean }> = [
    { label: 'Full Name', filled: Boolean(profile.fullName?.trim()) },
    { label: 'State', filled: Boolean(profile.state?.trim()) },
    { label: 'District', filled: Boolean(profile.district?.trim()) },
    { label: 'Education Level', filled: Boolean(profile.educationLevel?.trim()) },
    { label: 'Course / Stream', filled: Boolean(profile.course?.trim()) },
    { label: 'Institution', filled: Boolean(profile.institution?.trim()) },
    { label: 'Academic Year', filled: Boolean(profile.academicYear?.trim()) },
    {
      label: 'Marks Percentage',
      filled: profile.marksPercentage !== null && profile.marksPercentage !== undefined,
    },
    {
      label: 'Annual Family Income',
      filled: profile.annualFamilyIncome !== null && profile.annualFamilyIncome !== undefined,
    },
  ];

  const completed = checks.filter((c) => c.filled).length;
  const missingFields = checks.filter((c) => !c.filled).map((c) => c.label);

  return {
    percentage: Math.round((completed / checks.length) * 100),
    missingFields,
  };
}

export function evaluateEligibility(
  profile: StudentProfileRecord | null,
  scholarship: ScholarshipRecord
): EligibilityAssessment {
  const matchedReasons: string[] = [];
  const failedReasons: string[] = [];
  const missingFields: string[] = [];

  if (!profile) {
    return {
      outcome: 'Insufficient Information',
      matchedReasons: [],
      failedReasons: [],
      missingFields: [
        'State',
        'Education Level',
        'Course / Stream',
        'Marks Percentage',
        'Annual Family Income',
      ],
      disclaimer: DISCLAIMER,
    };
  }

  // 1. State / Domicile check
  if (scholarship.state && scholarship.state !== 'All India') {
    if (!profile.state) {
      missingFields.push('State');
    } else if (profile.state.toLowerCase() === scholarship.state.toLowerCase()) {
      matchedReasons.push(`Domicile state matches (${scholarship.state}).`);
    } else {
      failedReasons.push(
        `Restricted to students from ${scholarship.state} (your profile lists ${profile.state}).`
      );
    }
  } else {
    matchedReasons.push('Open to students across all Indian states and UTs.');
  }

  // 2. Education Level check
  const levels = scholarship.educationLevels ?? [];
  if (levels.length > 0 && !levels.includes('All')) {
    if (!profile.educationLevel) {
      missingFields.push('Education Level');
    } else if (
      levels.some((lvl) => lvl.toLowerCase() === profile.educationLevel!.toLowerCase())
    ) {
      matchedReasons.push(`Education level matches (${profile.educationLevel}).`);
    } else {
      failedReasons.push(
        `Requires ${levels.join(' / ')} level (your profile lists ${profile.educationLevel}).`
      );
    }
  }

  // 3. Course check
  const courses = scholarship.eligibleCourses ?? [];
  if (courses.length > 0 && !courses.includes('All')) {
    if (!profile.course) {
      missingFields.push('Course / Stream');
    } else {
      const normalizedStudentCourse = profile.course.toLowerCase();
      const matchesCourse = courses.some(
        (c) =>
          normalizedStudentCourse.includes(c.toLowerCase()) ||
          c.toLowerCase().includes(normalizedStudentCourse)
      );
      if (matchesCourse) {
        matchedReasons.push(`Course matches eligible streams (${profile.course}).`);
      } else {
        failedReasons.push(
          `Targeted at ${courses.join(', ')} courses (your profile lists ${profile.course}).`
        );
      }
    }
  }

  // 4. Minimum marks check
  if (scholarship.minMarksPercentage !== null && scholarship.minMarksPercentage !== undefined) {
    if (profile.marksPercentage === null || profile.marksPercentage === undefined) {
      missingFields.push('Marks Percentage');
    } else if (profile.marksPercentage >= scholarship.minMarksPercentage) {
      matchedReasons.push(
        `Academic marks (${profile.marksPercentage}%) meet minimum ${scholarship.minMarksPercentage}%.`
      );
    } else {
      failedReasons.push(
        `Requires at least ${scholarship.minMarksPercentage}% marks (your profile lists ${profile.marksPercentage}%).`
      );
    }
  }

  // 5. Maximum family income check
  if (scholarship.maxFamilyIncome !== null && scholarship.maxFamilyIncome !== undefined) {
    if (profile.annualFamilyIncome === null || profile.annualFamilyIncome === undefined) {
      missingFields.push('Annual Family Income');
    } else if (profile.annualFamilyIncome <= scholarship.maxFamilyIncome) {
      matchedReasons.push(
        `Annual family income (INR ${profile.annualFamilyIncome.toLocaleString('en-IN')}) is within the INR ${scholarship.maxFamilyIncome.toLocaleString('en-IN')} limit.`
      );
    } else {
      failedReasons.push(
        `Annual family income limit is INR ${scholarship.maxFamilyIncome.toLocaleString('en-IN')} (your profile lists INR ${profile.annualFamilyIncome.toLocaleString('en-IN')}).`
      );
    }
  }

  // 6. Category check (when restricted)
  const categories = scholarship.eligibleCategories ?? [];
  if (categories.length > 0 && !categories.includes('All')) {
    if (!profile.category) {
      missingFields.push('Category');
    } else if (
      categories.some((cat) => cat.toLowerCase() === profile.category!.toLowerCase())
    ) {
      matchedReasons.push(`Category matches eligible group (${profile.category}).`);
    } else {
      failedReasons.push(
        `Designated for ${categories.join(', ')} category (your profile lists ${profile.category}).`
      );
    }
  }

  // 7. Disability status check (when specifically required)
  if (scholarship.requiresDisability) {
    if (profile.disabilityStatus) {
      matchedReasons.push('Matches disability support eligibility requirement.');
    } else {
      failedReasons.push('Specifically designated for students with benchmark disabilities.');
    }
  }

  let outcome: EligibilityOutcome = 'Potentially Eligible';
  if (failedReasons.length > 0) {
    outcome = 'Not Eligible';
  } else if (missingFields.length > 0) {
    outcome = 'Insufficient Information';
  }

  return {
    outcome,
    matchedReasons,
    failedReasons,
    missingFields,
    disclaimer: DISCLAIMER,
  };
}
