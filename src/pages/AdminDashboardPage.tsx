import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Award,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Flag,
  GraduationCap,
  History,
  LayoutDashboard,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiFetch } from '../lib/api.ts';
import type {
  AuditLogEntry,
  Exam,
  JobListing,
  PublicService,
  Scholarship,
} from '../types/index.ts';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

interface AdminOverview {
  stats: {
    totalScholarships: number;
    publishedScholarships: number;
    pendingVerification: number;
    registeredStudents: number;
    trackedApplications: number;
  };
  auditLogs: AuditLogEntry[];
  users: Array<{
    id: number;
    displayName: string;
    email: string;
    role: string;
    onboardingCompleted: boolean;
    isSuspended: boolean;
    createdAt: string;
  }>;
}

interface CommunityReportItem {
  id: number;
  userId: number;
  targetType: 'post' | 'reply';
  targetId: number;
  reason: string;
  status: string;
  createdAt: string;
}

interface ContentReportItem {
  id: number;
  entityType: string;
  entitySlug: string | null;
  entityTitle: string;
  reportType: string;
  reportedUrl: string | null;
  description: string;
  contactEmail: string | null;
  status: string;
  resolutionNote: string | null;
  createdAt: string;
}

interface AdminAnalyticsPayload {
  totalPageViews: number;
  last7DaysPageViews: number;
  uniqueAnonymousVisitors: number;
  officialPortalClicks: number;
  registeredUsers: number;
  topPages: Array<{ path: string; views: number }>;
  topSearches: Array<{ query: string; count: number }>;
}

type AdminSection =
  | 'overview'
  | 'scholarships'
  | 'services'
  | 'exams'
  | 'jobs'
  | 'moderation'
  | 'queue'
  | 'audit'
  | 'users';

const EMPTY_FORM = {
  title: '',
  providerName: '',
  providerType: 'Government - State',
  department: '',
  category: 'State',
  state: 'Karnataka',
  educationLevels: 'PUC, Undergraduate',
  eligibleCourses: 'All',
  minMarksPercentage: '',
  maxFamilyIncome: '',
  eligibleCategories: 'All',
  requiresDisability: false,
  summary: '',
  overview: '',
  whoCanApply: '',
  eligibilityDetails: '',
  benefitsSummary: '',
  requiredDocuments: 'Qualifying marks card, Income certificate, Institution bonafide',
  applicationProcedure: '',
  importantDatesText: 'Check official portal for current academic year cycle dates.',
  deadlineDate: '',
  officialSourceName: '',
  officialSourceUrl: '',
  officialApplyUrl: '',
};

const SERVICE_CATEGORIES = [
  'Education & Scholarships',
  'College Admissions & Counselling',
  'Driving Licence & Transport',
  'Passport & Visa',
  'Government Documents',
  'Government Schemes',
  'Government Jobs',
  'Competitive Exams',
  'Skill Development & Learning',
  'Business & Entrepreneurship',
  'Tax & Financial',
  'Health & Public Services',
  'Agriculture & Rural Services',
];

const EXAM_CATEGORIES = [
  'Engineering',
  'Medical & Healthcare',
  'University Admissions',
  'Law',
  'Management',
  'UPSC',
  'SSC',
  'Banking',
  'Railway',
  'Defence',
  'Karnataka Exams',
  'State Examinations',
  'Research & Teaching',
  'Professional Entrances',
];

const EMPTY_EXAM_FORM = {
  examName: '',
  fullName: '',
  category: 'Engineering',
  subcategory: 'Entrance Examination',
  conductingAuthority: '',
  jurisdiction: 'Central' as 'Central' | 'State' | 'Private / Deemed',
  state: 'All India',
  examPurpose: '',
  whoShouldApply: '',
  eligibility: '',
  ageLimit: 'Check official notification',
  qualificationRequirements: '10+2 or equivalent from recognized board',
  examPattern: 'CBT / Written Examination — check official information bulletin.',
  syllabusSummary: 'Official prescribed syllabus published by conducting authority.',
  importantDatesText: 'Information not yet verified for the current cycle — check official portal.',
  nextExamDate: '',
  registrationInfo: 'Online registration on official authority portal.',
  applicationFee: 'Refer official notification for category-wise fee schedule.',
  requiredDocuments: 'Photo ID proof\nPassport photograph\nQualifying marks statement',
  applicationSteps: 'Visit official exam portal\nComplete registration & fee payment\nDownload confirmation page',
  admitCardInfo: 'Download e-Admit Card from official portal using application number.',
  previousPapersInfo: 'Available on official portal archive.',
  previousPapersUrl: '',
  resultsInfo: 'Scorecard published on official portal.',
  counsellingProcess: 'Centralized or state-level online counselling after result declaration.',
  officialWebsiteUrl: '',
  officialApplyUrl: '',
  officialNotificationUrl: '',
};

const EMPTY_JOB_FORM = {
  title: '',
  organization: '',
  category: 'Central Govt',
  state: 'All India',
  location: 'All India',
  qualification: 'Graduate / Equivalent',
  ageCriteria: 'Check official notification',
  vacancyInfo: 'Check current recruitment advertisement.',
  salaryPayScale: 'As per 7th CPC / organization norms.',
  experienceLevel: 'Freshers & Experienced',
  deadlineText: 'Check official recruitment portal for cycle dates.',
  deadlineDate: '',
  summary: '',
  applicationSteps: 'Review official advertisement\nApply online on official portal\nSave acknowledgement',
  requiredDocuments: 'Photo ID proof\nEducational certificates\nCategory certificate (if applicable)',
  officialNotificationUrl: '',
  officialApplyUrl: '',
  officialSourceName: '',
};

const EMPTY_SERVICE_FORM = {
  title: '',
  category: 'Government Documents',
  subcategory: '',
  departmentOrAuthority: '',
  jurisdiction: 'State' as 'Central' | 'State',
  state: 'Karnataka',
  country: '',
  officialWebsiteName: '',
  officialWebsiteUrl: '',
  officialApplyUrl: '',
  sourceUrl: '',
  isThirdParty: false,
  summary: '',
  overview: '',
  whoCanApply: '',
  eligibilityRequirements: '',
  documentsRequired: 'Aadhaar or valid photo ID (checked at official portal)\nAddress proof',
  applicationSteps:
    'Review official eligibility and prepare required documents\nVisit the official portal and complete the application form',
  officialFees: 'Check official portal fee schedule before payment.',
  appointmentProcess: '',
  trackingGuidance: 'Track application status using your acknowledgment number on the official portal.',
  commonMistakes: 'Entering mismatched name or date of birth details across identity records',
};

export function AdminDashboardPage({ navigate }: AdminDashboardPageProps) {
  const { dbUser, openAuthModal } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [examsList, setExamsList] = useState<Exam[]>([]);
  const [jobsList, setJobsList] = useState<JobListing[]>([]);
  const [reportsList, setReportsList] = useState<CommunityReportItem[]>([]);
  const [contentReports, setContentReports] = useState<ContentReportItem[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<AdminSection>('overview');
  const [adminSearch, setAdminSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'pending'>('all');

  const [confirmState, setConfirmState] = useState<{
    type: 'scholarship' | 'service' | 'exam' | 'job';
    id: number;
    title: string;
    action: string;
  } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE_FORM);
  const [savingService, setSavingService] = useState(false);
  const [serviceFormError, setServiceFormError] = useState<string | null>(null);

  const [examModalOpen, setExamModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const [examForm, setExamForm] = useState(EMPTY_EXAM_FORM);
  const [savingExam, setSavingExam] = useState(false);
  const [examFormError, setExamFormError] = useState<string | null>(null);

  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [jobForm, setJobForm] = useState(EMPTY_JOB_FORM);
  const [savingJob, setSavingJob] = useState(false);
  const [jobFormError, setJobFormError] = useState<string | null>(null);

  const loadAdminData = useCallback(async () => {
    if (!dbUser || dbUser.role !== 'admin') {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [ov, sc, sv, ex, jb, rp, cr, an] = await Promise.all([
        apiFetch<AdminOverview>('/api/admin/overview'),
        apiFetch<{ scholarships: Scholarship[] }>('/api/admin/scholarships'),
        apiFetch<{ services: PublicService[] }>('/api/admin/services'),
        apiFetch<{ exams: Exam[] }>('/api/admin/exams'),
        apiFetch<{ jobs: JobListing[] }>('/api/admin/jobs'),
        apiFetch<{ reports: CommunityReportItem[] }>('/api/admin/community/reports'),
        apiFetch<{ reports: ContentReportItem[] }>('/api/admin/content-reports'),
        apiFetch<{ analytics: AdminAnalyticsPayload }>('/api/admin/analytics'),
      ]);
      setOverview(ov);
      setScholarships(sc.scholarships);
      setServices(sv.services);
      setExamsList(ex.exams);
      setJobsList(jb.jobs);
      setReportsList(rp.reports);
      setContentReports(cr.reports);
      setAnalytics(an.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load admin console.');
    } finally {
      setLoading(false);
    }
  }, [dbUser]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const filteredScholarships = useMemo(() => {
    return scholarships.filter((s) => {
      if (statusFilter === 'published' && s.publishStatus !== 'published') return false;
      if (
        statusFilter === 'pending' &&
        s.verificationStatus === 'verified' &&
        s.publishStatus === 'published'
      ) {
        return false;
      }
      if (adminSearch.trim()) {
        const hay = `${s.title} ${s.providerName} ${s.state} ${s.category}`.toLowerCase();
        if (!hay.includes(adminSearch.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [scholarships, statusFilter, adminSearch]);

  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      if (statusFilter === 'published' && svc.publishStatus !== 'published') return false;
      if (
        statusFilter === 'pending' &&
        svc.verificationStatus === 'verified' &&
        svc.publishStatus === 'published'
      ) {
        return false;
      }
      if (adminSearch.trim()) {
        const hay =
          `${svc.title} ${svc.departmentOrAuthority} ${svc.state} ${svc.category}`.toLowerCase();
        if (!hay.includes(adminSearch.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [services, statusFilter, adminSearch]);

  const pendingScholarships = useMemo(
    () =>
      scholarships.filter(
        (s) => s.verificationStatus !== 'verified' || s.publishStatus !== 'published'
      ),
    [scholarships]
  );

  const pendingServices = useMemo(
    () =>
      services.filter(
        (svc) => svc.verificationStatus !== 'verified' || svc.publishStatus !== 'published'
      ),
    [services]
  );

  const filteredExams = useMemo(() => {
    return examsList.filter((ex) => {
      if (statusFilter === 'published' && ex.publishStatus !== 'published') return false;
      if (
        statusFilter === 'pending' &&
        ex.verificationStatus === 'verified' &&
        ex.publishStatus === 'published'
      ) {
        return false;
      }
      if (adminSearch.trim()) {
        const hay = `${ex.examName} ${ex.fullName} ${ex.conductingAuthority} ${ex.category} ${ex.state}`.toLowerCase();
        if (!hay.includes(adminSearch.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [examsList, statusFilter, adminSearch]);

  const filteredJobs = useMemo(() => {
    return jobsList.filter((jb) => {
      if (statusFilter === 'published' && jb.publishStatus !== 'published') return false;
      if (
        statusFilter === 'pending' &&
        jb.verificationStatus === 'verified' &&
        jb.publishStatus === 'published'
      ) {
        return false;
      }
      if (adminSearch.trim()) {
        const hay = `${jb.title} ${jb.organization} ${jb.category} ${jb.state}`.toLowerCase();
        if (!hay.includes(adminSearch.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [jobsList, statusFilter, adminSearch]);

  const pendingExams = useMemo(
    () =>
      examsList.filter(
        (ex) => ex.verificationStatus !== 'verified' || ex.publishStatus !== 'published'
      ),
    [examsList]
  );

  const pendingJobs = useMemo(
    () =>
      jobsList.filter(
        (jb) => jb.verificationStatus !== 'verified' || jb.publishStatus !== 'published'
      ),
    [jobsList]
  );

  const openReports = useMemo(
    () => reportsList.filter((r) => r.status === 'pending' || r.status === 'open'),
    [reportsList]
  );

  const openContentReports = useMemo(
    () => contentReports.filter((r) => r.status === 'open' || r.status === 'investigating'),
    [contentReports]
  );

  if (!dbUser) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          title="Administrator Authentication Required"
          description="Sign in with an authorized Bharat Connect administrator account to manage verified records."
          action={<Button onClick={openAuthModal}>Sign In</Button>}
        />
      </div>
    );
  }

  if (dbUser.role !== 'admin') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          title="Access Restricted"
          description="Your account has a citizen/student role. Only verified administrators can manage and publish directory records."
          action={
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Return to Personal Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (s: Scholarship) => {
    setEditingId(s.id);
    setForm({
      title: s.title,
      providerName: s.providerName,
      providerType: s.providerType,
      department: s.department || '',
      category: s.category,
      state: s.state,
      educationLevels: (s.educationLevels || []).join(', '),
      eligibleCourses: (s.eligibleCourses || []).join(', '),
      minMarksPercentage: s.minMarksPercentage !== null ? String(s.minMarksPercentage) : '',
      maxFamilyIncome: s.maxFamilyIncome !== null ? String(s.maxFamilyIncome) : '',
      eligibleCategories: (s.eligibleCategories || []).join(', '),
      requiresDisability: s.requiresDisability,
      summary: s.summary,
      overview: s.overview,
      whoCanApply: s.whoCanApply,
      eligibilityDetails: s.eligibilityDetails,
      benefitsSummary: s.benefitsSummary,
      requiredDocuments: (s.requiredDocuments || []).join(', '),
      applicationProcedure: s.applicationProcedure,
      importantDatesText: s.importantDatesText || '',
      deadlineDate: s.deadlineDate || '',
      officialSourceName: s.officialSourceName,
      officialSourceUrl: s.officialSourceUrl,
      officialApplyUrl: s.officialApplyUrl,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveScholarship = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload = {
      title: form.title,
      providerName: form.providerName,
      providerType: form.providerType,
      department: form.department.trim() || null,
      category: form.category,
      state: form.state,
      educationLevels: form.educationLevels
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      eligibleCourses: form.eligibleCourses
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      minMarksPercentage: form.minMarksPercentage.trim()
        ? Number(form.minMarksPercentage)
        : null,
      maxFamilyIncome: form.maxFamilyIncome.trim()
        ? Math.round(Number(form.maxFamilyIncome))
        : null,
      eligibleCategories: form.eligibleCategories
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      requiresDisability: form.requiresDisability,
      summary: form.summary,
      overview: form.overview,
      whoCanApply: form.whoCanApply,
      eligibilityDetails: form.eligibilityDetails,
      benefitsSummary: form.benefitsSummary,
      requiredDocuments: form.requiredDocuments
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      applicationProcedure: form.applicationProcedure,
      importantDatesText: form.importantDatesText.trim() || null,
      deadlineDate: form.deadlineDate.trim() || null,
      officialSourceName: form.officialSourceName,
      officialSourceUrl: form.officialSourceUrl,
      officialApplyUrl: form.officialApplyUrl,
    };

    try {
      if (editingId) {
        await apiFetch(`/api/admin/scholarships/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/admin/scholarships', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      await loadAdminData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save scholarship.');
    } finally {
      setSaving(false);
    }
  };

  const handleWorkflow = async (
    id: number,
    action: 'verify' | 'publish' | 'verify_and_publish' | 'unpublish' | 'reject' | 'archive'
  ) => {
    setError(null);
    try {
      await apiFetch(`/api/admin/scholarships/${id}/workflow`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Workflow action failed.');
    }
  };

  const openCreateServiceModal = () => {
    setEditingServiceId(null);
    setServiceForm(EMPTY_SERVICE_FORM);
    setServiceFormError(null);
    setServiceModalOpen(true);
  };

  const openEditServiceModal = (svc: PublicService) => {
    setEditingServiceId(svc.id);
    setServiceForm({
      title: svc.title,
      category: svc.category,
      subcategory: svc.subcategory,
      departmentOrAuthority: svc.departmentOrAuthority,
      jurisdiction: svc.jurisdiction === 'Central' ? 'Central' : 'State',
      state: svc.state,
      country: svc.country || '',
      officialWebsiteName: svc.officialWebsiteName,
      officialWebsiteUrl: svc.officialWebsiteUrl,
      officialApplyUrl: svc.officialApplyUrl,
      sourceUrl: svc.sourceUrl,
      isThirdParty: svc.isThirdParty,
      summary: svc.summary,
      overview: svc.overview,
      whoCanApply: svc.whoCanApply,
      eligibilityRequirements: svc.eligibilityRequirements,
      documentsRequired: (svc.documentsRequired || []).join('\n'),
      applicationSteps: (svc.applicationSteps || []).join('\n'),
      officialFees: svc.officialFees,
      appointmentProcess: svc.appointmentProcess || '',
      trackingGuidance: svc.trackingGuidance,
      commonMistakes: (svc.commonMistakes || []).join('\n'),
    });
    setServiceFormError(null);
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e: FormEvent) => {
    e.preventDefault();
    setSavingService(true);
    setServiceFormError(null);

    const payload = {
      title: serviceForm.title,
      category: serviceForm.category,
      subcategory: serviceForm.subcategory,
      departmentOrAuthority: serviceForm.departmentOrAuthority,
      jurisdiction: serviceForm.jurisdiction,
      state: serviceForm.state,
      country: serviceForm.country.trim() || null,
      officialWebsiteName: serviceForm.officialWebsiteName,
      officialWebsiteUrl: serviceForm.officialWebsiteUrl,
      officialApplyUrl: serviceForm.officialApplyUrl,
      sourceUrl: serviceForm.sourceUrl,
      isThirdParty: serviceForm.isThirdParty,
      summary: serviceForm.summary,
      overview: serviceForm.overview,
      whoCanApply: serviceForm.whoCanApply,
      eligibilityRequirements: serviceForm.eligibilityRequirements,
      documentsRequired: serviceForm.documentsRequired
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean),
      applicationSteps: serviceForm.applicationSteps
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean),
      officialFees: serviceForm.officialFees,
      appointmentProcess: serviceForm.appointmentProcess.trim() || null,
      trackingGuidance: serviceForm.trackingGuidance,
      commonMistakes: serviceForm.commonMistakes
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean),
    };

    try {
      if (editingServiceId) {
        await apiFetch(`/api/admin/services/${editingServiceId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/admin/services', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setServiceModalOpen(false);
      await loadAdminData();
    } catch (err) {
      setServiceFormError(err instanceof Error ? err.message : 'Unable to save service record.');
    } finally {
      setSavingService(false);
    }
  };

  const handleServiceWorkflow = async (
    id: number,
    action: 'verify' | 'publish' | 'verify_and_publish' | 'unpublish' | 'reject' | 'retire'
  ) => {
    setError(null);
    try {
      await apiFetch(`/api/admin/services/${id}/workflow`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Service workflow action failed.');
    }
  };

  const openCreateExamModal = () => {
    setEditingExamId(null);
    setExamForm(EMPTY_EXAM_FORM);
    setExamFormError(null);
    setExamModalOpen(true);
  };

  const openEditExamModal = (ex: Exam) => {
    setEditingExamId(ex.id);
    setExamForm({
      examName: ex.examName,
      fullName: ex.fullName,
      category: ex.category,
      subcategory: ex.subcategory,
      conductingAuthority: ex.conductingAuthority,
      jurisdiction:
        ex.jurisdiction === 'State'
          ? 'State'
          : ex.jurisdiction === 'Private / Deemed'
            ? 'Private / Deemed'
            : 'Central',
      state: ex.state,
      examPurpose: ex.examPurpose,
      whoShouldApply: ex.whoShouldApply,
      eligibility: ex.eligibility,
      ageLimit: ex.ageLimit,
      qualificationRequirements: ex.qualificationRequirements,
      examPattern: ex.examPattern,
      syllabusSummary: ex.syllabusSummary,
      importantDatesText: ex.importantDatesText,
      nextExamDate: ex.nextExamDate || '',
      registrationInfo: ex.registrationInfo,
      applicationFee: ex.applicationFee,
      requiredDocuments: (ex.requiredDocuments || []).join('\n'),
      applicationSteps: (ex.applicationSteps || []).join('\n'),
      admitCardInfo: ex.admitCardInfo,
      previousPapersInfo: ex.previousPapersInfo,
      previousPapersUrl: ex.previousPapersUrl || '',
      resultsInfo: ex.resultsInfo,
      counsellingProcess: ex.counsellingProcess,
      officialWebsiteUrl: ex.officialWebsiteUrl,
      officialApplyUrl: ex.officialApplyUrl,
      officialNotificationUrl: ex.officialNotificationUrl,
    });
    setExamFormError(null);
    setExamModalOpen(true);
  };

  const handleSaveExam = async (e: FormEvent) => {
    e.preventDefault();
    setSavingExam(true);
    setExamFormError(null);

    const payload = {
      ...examForm,
      nextExamDate: examForm.nextExamDate.trim() || null,
      previousPapersUrl: examForm.previousPapersUrl.trim() || null,
      requiredDocuments: examForm.requiredDocuments
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean),
      applicationSteps: examForm.applicationSteps
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean),
      prepResources: [],
    };

    try {
      if (editingExamId) {
        await apiFetch(`/api/admin/exams/${editingExamId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/admin/exams', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setExamModalOpen(false);
      await loadAdminData();
    } catch (err) {
      setExamFormError(err instanceof Error ? err.message : 'Unable to save exam record.');
    } finally {
      setSavingExam(false);
    }
  };

  const handleExamWorkflow = async (
    id: number,
    action: 'verify' | 'publish' | 'verify_and_publish' | 'unpublish' | 'reject' | 'archive'
  ) => {
    setError(null);
    try {
      await apiFetch(`/api/admin/exams/${id}/workflow`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Exam workflow action failed.');
    }
  };

  const openCreateJobModal = () => {
    setEditingJobId(null);
    setJobForm(EMPTY_JOB_FORM);
    setJobFormError(null);
    setJobModalOpen(true);
  };

  const openEditJobModal = (jb: JobListing) => {
    setEditingJobId(jb.id);
    setJobForm({
      title: jb.title,
      organization: jb.organization,
      category: jb.category,
      state: jb.state,
      location: jb.location,
      qualification: jb.qualification,
      ageCriteria: jb.ageCriteria,
      vacancyInfo: jb.vacancyInfo,
      salaryPayScale: jb.salaryPayScale,
      experienceLevel: jb.experienceLevel,
      deadlineText: jb.deadlineText,
      deadlineDate: jb.deadlineDate || '',
      summary: jb.summary,
      applicationSteps: (jb.applicationSteps || []).join('\n'),
      requiredDocuments: (jb.requiredDocuments || []).join('\n'),
      officialNotificationUrl: jb.officialNotificationUrl,
      officialApplyUrl: jb.officialApplyUrl,
      officialSourceName: jb.officialSourceName,
    });
    setJobFormError(null);
    setJobModalOpen(true);
  };

  const handleSaveJob = async (e: FormEvent) => {
    e.preventDefault();
    setSavingJob(true);
    setJobFormError(null);

    const payload = {
      ...jobForm,
      deadlineDate: jobForm.deadlineDate.trim() || null,
      applicationSteps: jobForm.applicationSteps
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean),
      requiredDocuments: jobForm.requiredDocuments
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean),
    };

    try {
      if (editingJobId) {
        await apiFetch(`/api/admin/jobs/${editingJobId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/admin/jobs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setJobModalOpen(false);
      await loadAdminData();
    } catch (err) {
      setJobFormError(err instanceof Error ? err.message : 'Unable to save job record.');
    } finally {
      setSavingJob(false);
    }
  };

  const handleJobWorkflow = async (
    id: number,
    action: 'verify' | 'publish' | 'verify_and_publish' | 'unpublish' | 'reject' | 'archive'
  ) => {
    setError(null);
    try {
      await apiFetch(`/api/admin/jobs/${id}/workflow`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Job workflow action failed.');
    }
  };

  const handleModerateCommunity = async (
    report: CommunityReportItem,
    decision: 'hide' | 'restore' | 'dismiss_report' | 'resolve_report'
  ) => {
    setError(null);
    try {
      await apiFetch('/api/admin/community/moderate', {
        method: 'POST',
        body: JSON.stringify({
          reportId: report.id,
          targetType: report.targetType,
          targetId: report.targetId,
          decision,
        }),
      });
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Moderation action failed.');
    }
  };

  const executeConfirmedAction = async () => {
    if (!confirmState) return;
    const { type, id, action } = confirmState;
    setConfirmState(null);
    if (type === 'scholarship') {
      await handleWorkflow(id, action as 'reject' | 'archive');
    } else if (type === 'service') {
      await handleServiceWorkflow(id, action as 'reject' | 'retire');
    } else if (type === 'exam') {
      await handleExamWorkflow(id, action as 'reject' | 'archive');
    } else if (type === 'job') {
      await handleJobWorkflow(id, action as 'reject' | 'archive');
    }
  };

  const totalPendingCount =
    pendingScholarships.length +
    pendingServices.length +
    pendingExams.length +
    pendingJobs.length;

  const sidebarItems: Array<{
    id: AdminSection;
    label: string;
    Icon: typeof LayoutDashboard;
    count?: number;
  }> = [
    { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
    { id: 'scholarships', label: 'Scholarships', Icon: GraduationCap, count: scholarships.length },
    { id: 'services', label: 'Public Services', Icon: FileText, count: services.length },
    { id: 'exams', label: 'Competitive Exams', Icon: Award, count: examsList.length },
    { id: 'jobs', label: 'Jobs & Careers', Icon: Briefcase, count: jobsList.length },
    {
      id: 'queue',
      label: 'Verification Queue',
      Icon: ClipboardCheck,
      count: totalPendingCount,
    },
    {
      id: 'moderation',
      label: 'Reports & Safety',
      Icon: Flag,
      count: openReports.length + openContentReports.length,
    },
    { id: 'audit', label: 'Audit Logs', Icon: History },
    { id: 'users', label: 'Users', Icon: Users, count: overview?.users.length },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <Breadcrumbs
        items={[{ label: 'Home', path: '/' }, { label: 'Admin Console' }]}
        navigate={navigate}
      />

      {/* Console Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-semibold text-[#134E7A]">Administrator Console</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#0B192C] sm:text-3xl">
            Verification &amp; Directory Operations
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" onClick={openCreateExamModal}>
            <Plus className="h-4 w-4" />
            <span>Add Exam</span>
          </Button>
          <Button variant="outline" onClick={openCreateJobModal}>
            <Plus className="h-4 w-4" />
            <span>Add Job</span>
          </Button>
          <Button variant="outline" onClick={openCreateServiceModal}>
            <Plus className="h-4 w-4" />
            <span>Add Service</span>
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            <span>Add Scholarship</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Operation failed">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Desktop Sidebar Navigation */}
        <aside className="lg:col-span-3 lg:sticky lg:top-20">
          <Card className="p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {sidebarItems.map((item) => {
              const Icon = item.Icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                    active
                      ? 'bg-[#0B192C] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B192C]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span
                      className={`font-mono text-[11px] tabular-nums ${
                        active ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </Card>
        </aside>

        {/* Main Operations Viewport */}
        <div className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
              <Skeleton className="h-64" />
            </div>
          ) : (
            <>
              {section === 'overview' && overview && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <Card className="p-5">
                      <p className="font-mono text-2xl font-bold text-[#0B192C] tabular-nums">
                        {overview.stats.publishedScholarships} / {overview.stats.totalScholarships}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-600">
                        Published / Total Scholarships
                      </p>
                    </Card>
                    <Card className="p-5">
                      <p className="font-mono text-2xl font-bold text-[#0B192C] tabular-nums">
                        {services.filter((s) => s.publishStatus === 'published').length} /{' '}
                        {services.length}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-600">
                        Published / Total Public Services
                      </p>
                    </Card>
                    <Card className="p-5">
                      <p className="font-mono text-2xl font-bold text-[#0B192C] tabular-nums">
                        {examsList.filter((e) => e.publishStatus === 'published').length} /{' '}
                        {examsList.length}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-600">
                        Published / Total Exams
                      </p>
                    </Card>
                    <Card className="p-5">
                      <p className="font-mono text-2xl font-bold text-[#0B192C] tabular-nums">
                        {jobsList.filter((j) => j.publishStatus === 'published').length} /{' '}
                        {jobsList.length}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-600">
                        Published / Total Jobs
                      </p>
                    </Card>
                    <Card className="p-5">
                      <p className="font-mono text-2xl font-bold text-[#C46316] tabular-nums">
                        {totalPendingCount}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-600">
                        Pending Verification Queue
                      </p>
                    </Card>
                    <Card className="p-5">
                      <p className="font-mono text-2xl font-bold text-[#0B192C] tabular-nums">
                        {overview.stats.registeredStudents}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-600">Registered Users</p>
                    </Card>
                  </div>

                  <Card className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-lg font-bold text-[#0B192C]">
                        Recent Verification &amp; Publishing Activity
                      </h2>
                      <button
                        type="button"
                        onClick={() => setSection('audit')}
                        className="text-xs font-semibold text-[#134E7A] hover:underline"
                      >
                        View full log →
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      {overview.auditLogs.slice(0, 6).map((log) => (
                        <div
                          key={log.id}
                          className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="text-slate-800">
                            <strong className="font-mono text-[#134E7A]">{log.action}</strong> on{' '}
                            {log.entityType} #{log.entityId} by {log.actorName}
                          </span>
                          <span className="font-mono text-slate-400 tabular-nums">
                            {new Date(log.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {analytics && (
                    <Card className="p-6 space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-[#0E6B6E]">
                          Privacy-Conscious Real Usage Logs (Zero PII)
                        </p>
                        <h2 className="font-display text-lg font-bold text-[#0B192C]">
                          Platform Traffic &amp; Official Portal Redirects
                        </h2>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-4">
                          <p className="font-mono text-xl font-bold text-[#0B192C] tabular-nums">
                            {analytics.totalPageViews}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">Total Page Views</p>
                        </div>
                        <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-4">
                          <p className="font-mono text-xl font-bold text-[#0B192C] tabular-nums">
                            {analytics.last7DaysPageViews}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">Views (Last 7 Days)</p>
                        </div>
                        <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-4">
                          <p className="font-mono text-xl font-bold text-[#0B192C] tabular-nums">
                            {analytics.uniqueAnonymousVisitors}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">Unique Visitors</p>
                        </div>
                        <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-4">
                          <p className="font-mono text-xl font-bold text-[#134E7A] tabular-nums">
                            {analytics.officialPortalClicks}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">Official Portal Clicks</p>
                        </div>
                      </div>

                      {analytics.topPages.length > 0 && (
                        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 text-xs">
                          <div className="space-y-2">
                            <p className="font-semibold text-[#0B192C]">Top Visited Routes</p>
                            <div className="divide-y divide-slate-100 border border-[#E2DDD1] rounded-lg px-3">
                              {analytics.topPages.slice(0, 6).map((p) => (
                                <div
                                  key={p.path}
                                  className="flex items-center justify-between py-2 gap-2"
                                >
                                  <span className="font-mono text-[#134E7A] truncate">
                                    {p.path}
                                  </span>
                                  <span className="font-mono font-semibold text-[#0B192C] tabular-nums">
                                    {p.views}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="font-semibold text-[#0B192C]">
                              Registered Accounts vs Anonymous Visitors
                            </p>
                            <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-4 space-y-2 text-[#4B5565]">
                              <p>
                                <strong className="text-[#0B192C]">Registered Users:</strong>{' '}
                                <span className="font-mono tabular-nums">
                                  {analytics.registeredUsers}
                                </span>
                              </p>
                              <p>
                                <strong className="text-[#0B192C]">Anonymous Browsers:</strong>{' '}
                                <span className="font-mono tabular-nums">
                                  {analytics.uniqueAnonymousVisitors}
                                </span>
                              </p>
                              <p className="text-[11px] text-[#5C6573]">
                                Metrics are computed directly from PostgreSQL `analytics_events`
                                without IP tracking or sensitive personal identifiers.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              )}

              {(section === 'scholarships' ||
                section === 'services' ||
                section === 'exams' ||
                section === 'jobs') && (
                <Card className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      placeholder={`Filter ${section} by title, authority, state, or category...`}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-[#134E7A] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs shrink-0">
                    {(
                      [
                        { id: 'all', label: 'All' },
                        { id: 'published', label: 'Published' },
                        { id: 'pending', label: 'Needs Review' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setStatusFilter(f.id)}
                        className={`rounded-md px-2.5 py-1.5 font-semibold transition-colors ${
                          statusFilter === f.id
                            ? 'bg-white text-[#0B192C] shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {section === 'scholarships' && (
                <div className="space-y-4">
                  {filteredScholarships.length === 0 ? (
                    <EmptyState
                      title="No scholarships match your filter"
                      description="Try clearing the search query or switching status filter."
                    />
                  ) : (
                    filteredScholarships.map((s) => (
                      <Card key={s.id} className="p-5 space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span
                                className={`font-semibold ${
                                  s.verificationStatus === 'verified'
                                    ? 'text-emerald-700'
                                    : 'text-[#C46316]'
                                }`}
                              >
                                Verification: {s.verificationStatus}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-slate-800">
                                Publish: {s.publishStatus}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{s.state}</span>
                              <span aria-hidden="true">·</span>
                              <span>{s.category}</span>
                            </div>
                            <h2 className="font-display text-lg font-bold text-[#0B192C]">
                              {s.title}
                            </h2>
                            <p className="text-xs text-slate-600">
                              {s.providerName} — Source:{' '}
                              <a
                                href={s.officialSourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#134E7A] underline"
                              >
                                {s.officialSourceName}
                              </a>
                            </p>
                          </div>

                          <Button variant="outline" size="sm" onClick={() => openEditModal(s)}>
                            Edit Details
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                          {s.verificationStatus !== 'verified' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWorkflow(s.id, 'verify')}
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                              <span>Verify Source</span>
                            </Button>
                          )}

                          {s.publishStatus !== 'published' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleWorkflow(
                                  s.id,
                                  s.verificationStatus === 'verified'
                                    ? 'publish'
                                    : 'verify_and_publish'
                                )
                              }
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>
                                {s.verificationStatus === 'verified'
                                  ? 'Publish'
                                  : 'Verify & Publish'}
                              </span>
                            </Button>
                          )}

                          {s.publishStatus === 'published' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWorkflow(s.id, 'unpublish')}
                            >
                              Unpublish
                            </Button>
                          )}

                          {s.verificationStatus !== 'rejected' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setConfirmState({
                                  type: 'scholarship',
                                  id: s.id,
                                  title: s.title,
                                  action: 'reject',
                                })
                              }
                            >
                              Reject
                            </Button>
                          )}

                          {s.publishStatus !== 'archived' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setConfirmState({
                                  type: 'scholarship',
                                  id: s.id,
                                  title: s.title,
                                  action: 'archive',
                                })
                              }
                            >
                              Archive Expired
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {section === 'services' && (
                <div className="space-y-4">
                  {filteredServices.length === 0 ? (
                    <EmptyState
                      title="No public services match your filter"
                      description="Try clearing the search query or switching status filter."
                    />
                  ) : (
                    filteredServices.map((svc) => (
                      <Card key={svc.id} className="p-5 space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span
                                className={`font-semibold ${
                                  svc.verificationStatus === 'verified'
                                    ? 'text-emerald-700'
                                    : 'text-[#C46316]'
                                }`}
                              >
                                Verification: {svc.verificationStatus}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-slate-800">
                                Publish: {svc.publishStatus}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{svc.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>
                                {svc.jurisdiction} ({svc.state})
                              </span>
                              {svc.nextReviewAt && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="tabular-nums">
                                    Next review:{' '}
                                    {new Date(svc.nextReviewAt).toLocaleDateString('en-IN')}
                                  </span>
                                </>
                              )}
                            </div>
                            <h2 className="font-display text-lg font-bold text-[#0B192C]">
                              {svc.title}
                            </h2>
                            <p className="text-xs text-slate-600">
                              {svc.departmentOrAuthority} — Portal:{' '}
                              <a
                                href={svc.officialWebsiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#134E7A] underline"
                              >
                                {svc.officialWebsiteName}
                              </a>
                              {svc.isThirdParty ? ' (Authorized Third-Party Portal)' : ''}
                            </p>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditServiceModal(svc)}
                          >
                            Edit Service
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                          {svc.verificationStatus !== 'verified' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleServiceWorkflow(svc.id, 'verify')}
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                              <span>Verify Official URL</span>
                            </Button>
                          )}

                          {svc.publishStatus !== 'published' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleServiceWorkflow(
                                  svc.id,
                                  svc.verificationStatus === 'verified'
                                    ? 'publish'
                                    : 'verify_and_publish'
                                )
                              }
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>
                                {svc.verificationStatus === 'verified'
                                  ? 'Publish'
                                  : 'Verify & Publish'}
                              </span>
                            </Button>
                          )}

                          {svc.publishStatus === 'published' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleServiceWorkflow(svc.id, 'unpublish')}
                            >
                              Unpublish
                            </Button>
                          )}

                          {svc.verificationStatus !== 'rejected' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setConfirmState({
                                  type: 'service',
                                  id: svc.id,
                                  title: svc.title,
                                  action: 'reject',
                                })
                              }
                            >
                              Reject
                            </Button>
                          )}

                          {svc.publishStatus !== 'retired' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setConfirmState({
                                  type: 'service',
                                  id: svc.id,
                                  title: svc.title,
                                  action: 'retire',
                                })
                              }
                            >
                              Retire Outdated
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {section === 'exams' && (
                <div className="space-y-4">
                  {filteredExams.length === 0 ? (
                    <EmptyState
                      title="No competitive exams match your filter"
                      description="Try clearing the search query or switching status filter."
                    />
                  ) : (
                    filteredExams.map((ex) => (
                      <Card key={ex.id} className="p-5 space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span
                                className={`font-semibold ${
                                  ex.verificationStatus === 'verified'
                                    ? 'text-emerald-700'
                                    : 'text-[#C46316]'
                                }`}
                              >
                                Verification: {ex.verificationStatus}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-slate-800">
                                Publish: {ex.publishStatus}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{ex.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>{ex.state}</span>
                            </div>
                            <h2 className="font-display text-lg font-bold text-[#0B192C]">
                              {ex.examName} — {ex.fullName}
                            </h2>
                            <p className="text-xs text-slate-600">
                              {ex.conductingAuthority} — Portal:{' '}
                              <a
                                href={ex.officialWebsiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#134E7A] underline"
                              >
                                {ex.officialWebsiteUrl}
                              </a>
                            </p>
                          </div>

                          <Button variant="outline" size="sm" onClick={() => openEditExamModal(ex)}>
                            Edit Exam
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                          {ex.verificationStatus !== 'verified' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExamWorkflow(ex.id, 'verify')}
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                              <span>Verify Official URL</span>
                            </Button>
                          )}

                          {ex.publishStatus !== 'published' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleExamWorkflow(
                                  ex.id,
                                  ex.verificationStatus === 'verified'
                                    ? 'publish'
                                    : 'verify_and_publish'
                                )
                              }
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>
                                {ex.verificationStatus === 'verified'
                                  ? 'Publish'
                                  : 'Verify & Publish'}
                              </span>
                            </Button>
                          )}

                          {ex.publishStatus === 'published' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExamWorkflow(ex.id, 'unpublish')}
                            >
                              Unpublish
                            </Button>
                          )}

                          {ex.verificationStatus !== 'rejected' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setConfirmState({
                                  type: 'exam',
                                  id: ex.id,
                                  title: ex.examName,
                                  action: 'reject',
                                })
                              }
                            >
                              Reject
                            </Button>
                          )}

                          {ex.publishStatus !== 'archived' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setConfirmState({
                                  type: 'exam',
                                  id: ex.id,
                                  title: ex.examName,
                                  action: 'archive',
                                })
                              }
                            >
                              Archive
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {section === 'jobs' && (
                <div className="space-y-4">
                  {filteredJobs.length === 0 ? (
                    <EmptyState
                      title="No job pathways match your filter"
                      description="Try clearing the search query or switching status filter."
                    />
                  ) : (
                    filteredJobs.map((jb) => (
                      <Card key={jb.id} className="p-5 space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span
                                className={`font-semibold ${
                                  jb.verificationStatus === 'verified'
                                    ? 'text-emerald-700'
                                    : 'text-[#C46316]'
                                }`}
                              >
                                Verification: {jb.verificationStatus}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-slate-800">
                                Publish: {jb.publishStatus}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{jb.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>{jb.state}</span>
                            </div>
                            <h2 className="font-display text-lg font-bold text-[#0B192C]">
                              {jb.title}
                            </h2>
                            <p className="text-xs text-slate-600">{jb.organization}</p>
                          </div>

                          <Button variant="outline" size="sm" onClick={() => openEditJobModal(jb)}>
                            Edit Job
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                          {jb.verificationStatus !== 'verified' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleJobWorkflow(jb.id, 'verify')}
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                              <span>Verify Notification</span>
                            </Button>
                          )}

                          {jb.publishStatus !== 'published' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleJobWorkflow(
                                  jb.id,
                                  jb.verificationStatus === 'verified'
                                    ? 'publish'
                                    : 'verify_and_publish'
                                )
                              }
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>
                                {jb.verificationStatus === 'verified'
                                  ? 'Publish'
                                  : 'Verify & Publish'}
                              </span>
                            </Button>
                          )}

                          {jb.publishStatus === 'published' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleJobWorkflow(jb.id, 'unpublish')}
                            >
                              Unpublish
                            </Button>
                          )}

                          {jb.verificationStatus !== 'rejected' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setConfirmState({
                                  type: 'job',
                                  id: jb.id,
                                  title: jb.title,
                                  action: 'reject',
                                })
                              }
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {section === 'moderation' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-xl font-bold text-[#0B192C]">
                        Broken Link, Content Accuracy &amp; Scam Reports ({contentReports.length})
                      </h2>
                      <Button variant="outline" size="sm" onClick={() => navigate('/scam-alerts')}>
                        Open Scam Alert Center
                      </Button>
                    </div>

                    {contentReports.length === 0 ? (
                      <EmptyState
                        icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" />}
                        title="No content accuracy or scam reports"
                        description="Broken link, fee update, and scam reports submitted by citizens appear here."
                      />
                    ) : (
                      <div className="space-y-3">
                        {contentReports.map((cr) => (
                          <Card key={cr.id} className="p-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-slate-500">
                                #{cr.id} · {cr.reportType} · {cr.entityType} · Status:{' '}
                                <strong className="text-[#134E7A]">{cr.status}</strong>
                              </p>
                              <p className="text-sm font-bold text-[#0B192C]">{cr.entityTitle}</p>
                              <p className="text-xs text-slate-700 leading-relaxed">{cr.description}</p>
                              {cr.reportedUrl && (
                                <p className="text-xs font-mono text-[#134E7A] break-all">
                                  URL: {cr.reportedUrl}
                                </p>
                              )}
                              <p className="text-xs text-slate-400 tabular-nums">
                                Submitted {new Date(cr.createdAt).toLocaleString('en-IN')}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <Button
                                size="sm"
                                onClick={async () => {
                                  await apiFetch(`/api/admin/content-reports/${cr.id}`, {
                                    method: 'PATCH',
                                    body: JSON.stringify({ status: 'resolved' }),
                                  });
                                  await loadAdminData();
                                }}
                              >
                                Mark Resolved
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  await apiFetch(`/api/admin/content-reports/${cr.id}`, {
                                    method: 'PATCH',
                                    body: JSON.stringify({ status: 'dismissed' }),
                                  });
                                  await loadAdminData();
                                }}
                              >
                                Dismiss
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 border-t border-[#E2DDD1] pt-6">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-xl font-bold text-[#0B192C]">
                        Community Moderation Reports
                      </h2>
                      <Button variant="outline" size="sm" onClick={() => navigate('/community')}>
                        Open Community Q&amp;A
                      </Button>
                    </div>

                    {reportsList.length === 0 ? (
                      <EmptyState
                        icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" />}
                        title="No community moderation reports"
                        description="User-reported Q&A posts and replies appear here for review."
                      />
                    ) : (
                      <div className="space-y-3">
                        {reportsList.map((r) => (
                          <Card key={r.id} className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-slate-500">
                                Report #{r.id} · {r.targetType} #{r.targetId} · Status:{' '}
                                <strong className="text-[#134E7A]">{r.status}</strong>
                              </p>
                              <p className="text-sm font-semibold text-[#0B192C]">{r.reason}</p>
                              <p className="text-xs text-slate-500 tabular-nums">
                                Submitted {new Date(r.createdAt).toLocaleString('en-IN')}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleModerateCommunity(r, 'hide')}
                              >
                                Hide Content
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleModerateCommunity(r, 'restore')}
                              >
                                Restore Content
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleModerateCommunity(r, 'dismiss_report')}
                              >
                                Dismiss
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {section === 'queue' && (
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-bold text-[#0B192C]">
                    Verification Queue
                  </h2>
                  {totalPendingCount === 0 ? (
                    <EmptyState
                      icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" />}
                      title="Verification queue is clear"
                      description="All scholarship, service, exam, and job records are currently verified and published."
                    />
                  ) : (
                    <div className="space-y-4">
                      {pendingScholarships.map((s) => (
                        <Card key={`sch-${s.id}`} className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-medium text-[#C46316]">
                              Scholarship · {s.verificationStatus} · {s.publishStatus}
                            </p>
                            <p className="font-display text-base font-bold text-[#0B192C]">
                              {s.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleWorkflow(s.id, 'verify_and_publish')}
                            >
                              Verify &amp; Publish
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEditModal(s)}>
                              Review
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {pendingServices.map((svc) => (
                        <Card key={`svc-${svc.id}`} className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-medium text-[#C46316]">
                              Public Service · {svc.verificationStatus} · {svc.publishStatus}
                            </p>
                            <p className="font-display text-base font-bold text-[#0B192C]">
                              {svc.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleServiceWorkflow(svc.id, 'verify_and_publish')}
                            >
                              Verify &amp; Publish
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditServiceModal(svc)}
                            >
                              Review
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {pendingExams.map((ex) => (
                        <Card key={`exam-${ex.id}`} className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-medium text-[#C46316]">
                              Exam · {ex.verificationStatus} · {ex.publishStatus}
                            </p>
                            <p className="font-display text-base font-bold text-[#0B192C]">
                              {ex.examName} — {ex.fullName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleExamWorkflow(ex.id, 'verify_and_publish')}
                            >
                              Verify &amp; Publish
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEditExamModal(ex)}>
                              Review
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {pendingJobs.map((jb) => (
                        <Card key={`job-${jb.id}`} className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-medium text-[#C46316]">
                              Job Pathway · {jb.verificationStatus} · {jb.publishStatus}
                            </p>
                            <p className="font-display text-base font-bold text-[#0B192C]">
                              {jb.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleJobWorkflow(jb.id, 'verify_and_publish')}
                            >
                              Verify &amp; Publish
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEditJobModal(jb)}>
                              Review
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {section === 'audit' && overview && (
                <Card className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Timestamp</th>
                        <th className="px-4 py-3 font-semibold">Actor</th>
                        <th className="px-4 py-3 font-semibold">Action</th>
                        <th className="px-4 py-3 font-semibold">Entity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {overview.auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-mono text-slate-500 tabular-nums whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-slate-900">
                            {log.actorName} ({log.actorEmail})
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-[#134E7A]">
                            {log.action}
                          </td>
                          <td className="px-4 py-3 text-slate-600 tabular-nums">
                            {log.entityType} #{log.entityId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}

              {section === 'users' && overview && (
                <Card className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Role</th>
                        <th className="px-4 py-3 font-semibold">Onboarding</th>
                        <th className="px-4 py-3 font-semibold">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {overview.users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-900">{u.displayName}</td>
                          <td className="px-4 py-3 text-slate-600">{u.email}</td>
                          <td className="px-4 py-3 font-mono text-[#134E7A]">{u.role}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {u.onboardingCompleted ? 'Completed' : 'Pending'}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">
                            {new Date(u.createdAt).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Destructive Workflow Confirmation Dialog */}
      {confirmState && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
        >
          <div className="animate-modal-enter w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h2 className="font-display text-lg font-bold text-[#0B192C]">
              Confirm {confirmState.action} action
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to <strong>{confirmState.action}</strong>{' '}
              <span className="font-semibold text-slate-900">{confirmState.title}</span>? This
              removes it from public discovery and records an audit log entry.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmState(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={executeConfirmedAction}>
                Confirm {confirmState.action}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Scholarship Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
        >
          <div className="animate-modal-enter max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="font-display text-xl font-bold text-[#0B192C]">
                {editingId ? 'Edit Scholarship Record' : 'Add Official Scholarship Record'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScholarship} className="mt-5 space-y-4">
              {formError && <Alert variant="error">{formError}</Alert>}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Scholarship Title *</span>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Provider Name *</span>
                  <input
                    required
                    value={form.providerName}
                    onChange={(e) => setForm({ ...form, providerName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Provider Type *</span>
                  <select
                    value={form.providerType}
                    onChange={(e) => setForm({ ...form, providerType: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {[
                      'Government - State',
                      'Government - Central',
                      'Private / Foundation',
                      'Institutional',
                    ].map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Category *</span>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {[
                      'State',
                      'Central',
                      'Merit-based',
                      'Need-based',
                      'Minority',
                      'Disability',
                      'Private',
                      'Government',
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>State *</span>
                  <input
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="Karnataka or All India"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Education Levels (comma-separated) *</span>
                  <input
                    required
                    value={form.educationLevels}
                    onChange={(e) => setForm({ ...form, educationLevels: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Eligible Courses (comma-separated) *</span>
                  <input
                    required
                    value={form.eligibleCourses}
                    onChange={(e) => setForm({ ...form, eligibleCourses: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Min Marks % (optional)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={form.minMarksPercentage}
                    onChange={(e) => setForm({ ...form, minMarksPercentage: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Max Family Income INR (optional)</span>
                  <input
                    type="number"
                    value={form.maxFamilyIncome}
                    onChange={(e) => setForm({ ...form, maxFamilyIncome: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Eligible Categories (comma-separated) *</span>
                  <input
                    required
                    value={form.eligibleCategories}
                    onChange={(e) => setForm({ ...form, eligibleCategories: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Verified Deadline Date (YYYY-MM-DD, optional)</span>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={form.deadlineDate}
                    onChange={(e) => setForm({ ...form, deadlineDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Official Source Name *</span>
                  <input
                    required
                    value={form.officialSourceName}
                    onChange={(e) => setForm({ ...form, officialSourceName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Official Source URL *</span>
                  <input
                    type="url"
                    required
                    value={form.officialSourceUrl}
                    onChange={(e) => setForm({ ...form, officialSourceUrl: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Official Application URL *</span>
                  <input
                    type="url"
                    required
                    value={form.officialApplyUrl}
                    onChange={(e) => setForm({ ...form, officialApplyUrl: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Summary (1-2 sentences) *</span>
                  <textarea
                    required
                    rows={2}
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Overview *</span>
                  <textarea
                    required
                    rows={3}
                    value={form.overview}
                    onChange={(e) => setForm({ ...form, overview: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Who Can Apply *</span>
                  <textarea
                    required
                    rows={2}
                    value={form.whoCanApply}
                    onChange={(e) => setForm({ ...form, whoCanApply: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Eligibility Details *</span>
                  <textarea
                    required
                    rows={2}
                    value={form.eligibilityDetails}
                    onChange={(e) => setForm({ ...form, eligibilityDetails: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Benefits Summary *</span>
                  <input
                    required
                    value={form.benefitsSummary}
                    onChange={(e) => setForm({ ...form, benefitsSummary: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Required Documents (comma-separated) *</span>
                  <input
                    required
                    value={form.requiredDocuments}
                    onChange={(e) => setForm({ ...form, requiredDocuments: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Application Procedure *</span>
                  <textarea
                    required
                    rows={3}
                    value={form.applicationProcedure}
                    onChange={(e) => setForm({ ...form, applicationProcedure: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Draft'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Public Service Modal */}
      {serviceModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
        >
          <div className="animate-modal-enter max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="font-display text-xl font-bold text-[#0B192C]">
                {editingServiceId
                  ? 'Edit Public Service Guide'
                  : 'Add Official Public Service Guide'}
              </h2>
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="mt-5 space-y-4">
              {serviceFormError && <Alert variant="error">{serviceFormError}</Alert>}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Service Title *</span>
                  <input
                    required
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Category *</span>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Subcategory *</span>
                  <input
                    required
                    value={serviceForm.subcategory}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, subcategory: e.target.value })
                    }
                    placeholder="e.g., Learner's & Driving Licence"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Department or Authority *</span>
                  <input
                    required
                    value={serviceForm.departmentOrAuthority}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, departmentOrAuthority: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Jurisdiction *</span>
                  <select
                    value={serviceForm.jurisdiction}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        jurisdiction: e.target.value as 'Central' | 'State',
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="State">State</option>
                    <option value="Central">Central</option>
                  </select>
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>State *</span>
                  <input
                    required
                    value={serviceForm.state}
                    onChange={(e) => setServiceForm({ ...serviceForm, state: e.target.value })}
                    placeholder="Karnataka or All India"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Destination Country (for Visa guides, optional)</span>
                  <input
                    value={serviceForm.country}
                    onChange={(e) => setServiceForm({ ...serviceForm, country: e.target.value })}
                    placeholder="e.g., Germany"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 pt-5">
                  <input
                    type="checkbox"
                    checked={serviceForm.isThirdParty}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, isThirdParty: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span>Authorized third-party portal (e.g., VFS / APS)</span>
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Official Portal Name *</span>
                  <input
                    required
                    value={serviceForm.officialWebsiteName}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, officialWebsiteName: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Official Website URL *</span>
                  <input
                    type="url"
                    required
                    value={serviceForm.officialWebsiteUrl}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, officialWebsiteUrl: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Official Apply URL *</span>
                  <input
                    type="url"
                    required
                    value={serviceForm.officialApplyUrl}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, officialApplyUrl: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Official Source / Notification URL *</span>
                  <input
                    type="url"
                    required
                    value={serviceForm.sourceUrl}
                    onChange={(e) => setServiceForm({ ...serviceForm, sourceUrl: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Summary (1-2 sentences) *</span>
                  <textarea
                    required
                    rows={2}
                    value={serviceForm.summary}
                    onChange={(e) => setServiceForm({ ...serviceForm, summary: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Overview *</span>
                  <textarea
                    required
                    rows={3}
                    value={serviceForm.overview}
                    onChange={(e) => setServiceForm({ ...serviceForm, overview: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Who Can Apply *</span>
                  <textarea
                    required
                    rows={2}
                    value={serviceForm.whoCanApply}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, whoCanApply: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Eligibility Requirements *</span>
                  <textarea
                    required
                    rows={2}
                    value={serviceForm.eligibilityRequirements}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, eligibilityRequirements: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Required Documents (one per line) *</span>
                  <textarea
                    required
                    rows={3}
                    value={serviceForm.documentsRequired}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, documentsRequired: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Step-by-Step Application Procedure (one step per line) *</span>
                  <textarea
                    required
                    rows={4}
                    value={serviceForm.applicationSteps}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, applicationSteps: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Official Fees *</span>
                  <input
                    required
                    value={serviceForm.officialFees}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, officialFees: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Appointment Process (optional)</span>
                  <textarea
                    rows={2}
                    value={serviceForm.appointmentProcess}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, appointmentProcess: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Status Tracking Guidance *</span>
                  <textarea
                    required
                    rows={2}
                    value={serviceForm.trackingGuidance}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, trackingGuidance: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Common Mistakes to Avoid (one per line)</span>
                  <textarea
                    rows={2}
                    value={serviceForm.commonMistakes}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, commonMistakes: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <Button variant="outline" onClick={() => setServiceModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savingService}>
                  {savingService
                    ? 'Saving...'
                    : editingServiceId
                      ? 'Save Service Changes'
                      : 'Create Service Draft'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Exam Modal */}
      {examModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
        >
          <div className="animate-modal-enter max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="font-display text-xl font-bold text-[#0B192C]">
                {editingExamId ? 'Edit Competitive Exam Guide' : 'Add Competitive Exam Guide'}
              </h2>
              <button
                type="button"
                onClick={() => setExamModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="mt-5 space-y-4">
              {examFormError && <Alert variant="error">{examFormError}</Alert>}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Exam Short Name *</span>
                  <input
                    required
                    value={examForm.examName}
                    onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })}
                    placeholder="e.g., KCET"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Category *</span>
                  <select
                    value={examForm.category}
                    onChange={(e) => setExamForm({ ...examForm, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {EXAM_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Full Exam Name *</span>
                  <input
                    required
                    value={examForm.fullName}
                    onChange={(e) => setExamForm({ ...examForm, fullName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Conducting Authority *</span>
                  <input
                    required
                    value={examForm.conductingAuthority}
                    onChange={(e) =>
                      setExamForm({ ...examForm, conductingAuthority: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>State *</span>
                  <input
                    required
                    value={examForm.state}
                    onChange={(e) => setExamForm({ ...examForm, state: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Official Website URL *</span>
                  <input
                    type="url"
                    required
                    value={examForm.officialWebsiteUrl}
                    onChange={(e) =>
                      setExamForm({ ...examForm, officialWebsiteUrl: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Official Apply URL *</span>
                  <input
                    type="url"
                    required
                    value={examForm.officialApplyUrl}
                    onChange={(e) => setExamForm({ ...examForm, officialApplyUrl: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Official Notification / Information Bulletin URL *</span>
                  <input
                    type="url"
                    required
                    value={examForm.officialNotificationUrl}
                    onChange={(e) =>
                      setExamForm({ ...examForm, officialNotificationUrl: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Exam Purpose *</span>
                  <textarea
                    required
                    rows={2}
                    value={examForm.examPurpose}
                    onChange={(e) => setExamForm({ ...examForm, examPurpose: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Who Should Apply *</span>
                  <textarea
                    required
                    rows={2}
                    value={examForm.whoShouldApply}
                    onChange={(e) => setExamForm({ ...examForm, whoShouldApply: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Eligibility *</span>
                  <textarea
                    required
                    rows={2}
                    value={examForm.eligibility}
                    onChange={(e) => setExamForm({ ...examForm, eligibility: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <Button variant="outline" onClick={() => setExamModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savingExam}>
                  {savingExam ? 'Saving...' : editingExamId ? 'Save Exam Changes' : 'Create Exam Draft'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Job Modal */}
      {jobModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
        >
          <div className="animate-modal-enter max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="font-display text-xl font-bold text-[#0B192C]">
                {editingJobId ? 'Edit Job / Career Pathway' : 'Add Job / Career Pathway'}
              </h2>
              <button
                type="button"
                onClick={() => setJobModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="mt-5 space-y-4">
              {jobFormError && <Alert variant="error">{jobFormError}</Alert>}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Title *</span>
                  <input
                    required
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Organization *</span>
                  <input
                    required
                    value={jobForm.organization}
                    onChange={(e) => setJobForm({ ...jobForm, organization: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Category *</span>
                  <input
                    required
                    value={jobForm.category}
                    onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                    placeholder="Central Govt, Karnataka, Banking, Apprenticeships..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>State *</span>
                  <input
                    required
                    value={jobForm.state}
                    onChange={(e) => setJobForm({ ...jobForm, state: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Official Source Name *</span>
                  <input
                    required
                    value={jobForm.officialSourceName}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, officialSourceName: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Official Apply URL *</span>
                  <input
                    type="url"
                    required
                    value={jobForm.officialApplyUrl}
                    onChange={(e) => setJobForm({ ...jobForm, officialApplyUrl: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700">
                  <span>Official Notification URL *</span>
                  <input
                    type="url"
                    required
                    value={jobForm.officialNotificationUrl}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, officialNotificationUrl: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
                  <span>Summary *</span>
                  <textarea
                    required
                    rows={3}
                    value={jobForm.summary}
                    onChange={(e) => setJobForm({ ...jobForm, summary: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <Button variant="outline" onClick={() => setJobModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savingJob}>
                  {savingJob ? 'Saving...' : editingJobId ? 'Save Job Changes' : 'Create Job Draft'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
