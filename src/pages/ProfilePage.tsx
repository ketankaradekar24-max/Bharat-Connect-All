import { useEffect, useState, type FormEvent } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiFetch } from '../lib/api.ts';

interface ProfilePageProps {
  navigate: (path: string) => void;
}

const INDIAN_STATES = [
  'Karnataka',
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const EDUCATION_LEVELS = [
  'School',
  'PUC',
  'Diploma',
  'Undergraduate',
  'Postgraduate',
  'Professional',
] as const;

const CATEGORIES = [
  'Prefer not to say',
  'General',
  'OBC',
  'SC',
  'ST',
  'EWS',
  'Minority',
] as const;

export function ProfilePage({ navigate }: ProfilePageProps) {
  const {
    dbUser,
    profile,
    profileCompletion,
    notificationPreferences,
    adminBootstrapped,
    openAuthModal,
    refreshSession,
    bootstrapAdmin,
  } = useAuth();

  const [fullName, setFullName] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('');
  const [educationLevel, setEducationLevel] = useState<string>('Undergraduate');
  const [course, setCourse] = useState('');
  const [institution, setInstitution] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [marksPercentage, setMarksPercentage] = useState('');
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState('');
  const [category, setCategory] = useState<string>('Prefer not to say');
  const [disabilityStatus, setDisabilityStatus] = useState(false);
  const [gender, setGender] = useState<string>('Prefer not to say');

  const [inAppNew, setInAppNew] = useState(true);
  const [inAppDeadlines, setInAppDeadlines] = useState(true);
  const [inAppAnnouncements, setInAppAnnouncements] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || dbUser?.displayName || '');
      setState(profile.state || 'Karnataka');
      setDistrict(profile.district || '');
      setEducationLevel(profile.educationLevel || 'Undergraduate');
      setCourse(profile.course || '');
      setInstitution(profile.institution || '');
      setAcademicYear(profile.academicYear || '');
      setMarksPercentage(
        profile.marksPercentage !== null && profile.marksPercentage !== undefined
          ? String(profile.marksPercentage)
          : ''
      );
      setAnnualFamilyIncome(
        profile.annualFamilyIncome !== null && profile.annualFamilyIncome !== undefined
          ? String(profile.annualFamilyIncome)
          : ''
      );
      setCategory(profile.category || 'Prefer not to say');
      setDisabilityStatus(Boolean(profile.disabilityStatus));
      setGender(profile.gender || 'Prefer not to say');
    }
    if (notificationPreferences) {
      setInAppNew(notificationPreferences.inAppNewScholarships);
      setInAppDeadlines(notificationPreferences.inAppDeadlineReminders);
      setInAppAnnouncements(notificationPreferences.inAppAnnouncements);
    }
  }, [profile, notificationPreferences, dbUser?.displayName]);

  if (!dbUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Sign in to Manage Your Profile"
          description="Create your data-minimized profile for accurate rule-based scholarship pre-checks and state guidance."
          action={<Button onClick={openAuthModal}>Sign In with Google</Button>}
        />
      </div>
    );
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: fullName.trim(),
          state: state.trim() || null,
          district: district.trim() || null,
          educationLevel: educationLevel || null,
          course: course.trim() || null,
          institution: institution.trim() || null,
          academicYear: academicYear.trim() || null,
          marksPercentage: marksPercentage.trim() ? Number(marksPercentage) : null,
          annualFamilyIncome: annualFamilyIncome.trim()
            ? Math.round(Number(annualFamilyIncome))
            : null,
          category,
          disabilityStatus,
          gender,
        }),
      });

      await apiFetch('/api/student/notification-preferences', {
        method: 'PUT',
        body: JSON.stringify({
          inAppNewScholarships: inAppNew,
          inAppDeadlineReminders: inAppDeadlines,
          inAppAnnouncements: inAppAnnouncements,
        }),
      });

      await refreshSession();
      setSaveMessage('Profile and notification preferences saved.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAdminBootstrap = async () => {
    setBootstrapping(true);
    setSaveError(null);
    try {
      await bootstrapAdmin();
      navigate('/admin');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Admin bootstrap failed.');
    } finally {
      setBootstrapping(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', path: '/' },
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Profile & Preferences' },
        ]}
        navigate={navigate}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-[#134E7A]">Data-Minimized Profile</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-[#0B192C]">
            Student &amp; Citizen Profile
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Used strictly for rule-based scholarship pre-checks. Never share Aadhaar numbers, OTPs,
            or bank passwords.
          </p>
        </div>
        <div className="sm:text-right">
          <p className="font-mono text-2xl font-bold text-[#0B192C] tabular-nums">
            {profileCompletion.percentage}%
          </p>
          <p className="text-xs text-slate-500">Profile complete</p>
        </div>
      </div>

      {profileCompletion.missingFields.length > 0 && (
        <Alert variant="warning" title="Improve eligibility matching accuracy">
          Missing fields: {profileCompletion.missingFields.join(', ')}
        </Alert>
      )}

      {/* One-time zero-admin bootstrap card (only rendered when 0 admins exist in DB) */}
      {!adminBootstrapped && dbUser.role !== 'admin' && (
        <Alert
          variant="info"
          title="Initial Platform Admin Setup Available"
          action={
            <Button size="sm" disabled={bootstrapping} onClick={handleAdminBootstrap}>
              {bootstrapping ? 'Initializing...' : 'Initialize Admin Role'}
            </Button>
          }
        >
          <span className="inline-flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 hidden" />
            No administrator account has been initialized yet. If you are the founder/operator of
            Bharat Connect, initialize your account as the first platform administrator.
          </span>
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-5">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0B192C]">Personal &amp; Domicile</h2>
            <p className="text-xs text-slate-500">
              State domicile helps prioritize Karnataka and relevant regional schemes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-medium text-slate-700">
              <span>Full Name *</span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              />
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700">
              <span>Email (from Google account)</span>
              <input
                type="email"
                disabled
                value={dbUser.email}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
              />
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700">
              <span>Domicile State / UT</span>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700">
              <span>District</span>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Bengaluru Urban, Mysuru, Belagavi"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              />
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700">
              <span>Category (Optional — only if matching category schemes)</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700">
              <span>Gender (Optional)</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              >
                {['Prefer not to say', 'Female', 'Male', 'Other'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex items-center gap-2.5 pt-1 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={disabilityStatus}
              onChange={(e) => setDisabilityStatus(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#134E7A]"
            />
            <span>Include scholarships for students with benchmark disabilities (optional)</span>
          </label>
        </Card>

        <Card className="p-6 space-y-5">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0B192C]">
              Academic &amp; Financial Criteria
            </h2>
            <p className="text-xs text-slate-500">
              Used strictly for deterministic rule-based matching against published eligibility
              thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-medium text-slate-700">
              <span>Education Level</span>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              >
                {EDUCATION_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700">
              <span>Course / Stream</span>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. BE Computer Science, BSc, PUC Science, Diploma"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              />
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700">
              <span>School / College / University</span>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Institution name"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              />
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700">
              <span>Current Academic Year</span>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g. 1st Year, 2nd PUC, Final Year"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              />
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700">
              <span>Last Qualifying Marks (%)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={marksPercentage}
                onChange={(e) => setMarksPercentage(e.target.value)}
                placeholder="e.g. 82.5"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 tabular-nums"
              />
            </label>

            <label className="space-y-1.5 text-xs font-medium text-slate-700">
              <span>Annual Family Income (INR)</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={annualFamilyIncome}
                onChange={(e) => setAnnualFamilyIncome(e.target.value)}
                placeholder="e.g. 200000"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 tabular-nums"
              />
            </label>
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-[#0B192C]">
            In-App Notification Preferences
          </h2>
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={inAppNew}
              onChange={(e) => setInAppNew(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#134E7A]"
            />
            <span>Notify me when new verified scholarships are published</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={inAppDeadlines}
              onChange={(e) => setInAppDeadlines(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#134E7A]"
            />
            <span>Show deadline reminders for saved or tracked scholarships</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={inAppAnnouncements}
              onChange={(e) => setInAppAnnouncements(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#134E7A]"
            />
            <span>Receive official platform announcements</span>
          </label>
        </Card>

        {saveError && (
          <Alert variant="error" title="Could not save changes">
            {saveError}
          </Alert>
        )}

        {saveMessage && (
          <Alert variant="success">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-700 hidden" />
              {saveMessage}
            </span>
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </form>
    </div>
  );
}
