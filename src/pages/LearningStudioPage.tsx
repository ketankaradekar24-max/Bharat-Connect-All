import { useState } from 'react';
import {
  BookOpen,
  Briefcase,
  Compass,
  Download,
  ExternalLink,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { ExternalPortalModal } from '../components/ExternalPortalModal.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Tabs } from '../components/ui/Tabs.tsx';

interface LearningStudioPageProps {
  navigate: (path: string) => void;
}

interface CareerRoadmap {
  id: string;
  role: string;
  domain: string;
  overview: string;
  educationPath: string;
  keyExams: Array<{ label: string; path: string }>;
  coreSkills: string[];
  portfolioProjects: string[];
  freeResources: Array<{ title: string; provider: string; url: string }>;
}

const CAREER_ROADMAPS: CareerRoadmap[] = [
  {
    id: 'swe',
    role: 'Software Engineer & Full-Stack Developer',
    domain: 'Technology & Engineering',
    overview:
      'Design, build, and scale web platforms, APIs, cloud infrastructure, and distributed software systems.',
    educationPath: 'B.E. / B.Tech (CSE/ISE/ECE) or BCA + MCA, or structured CS fundamentals + portfolio.',
    keyExams: [
      { label: 'JEE Main', path: '/exams?q=JEE%20Main' },
      { label: 'KCET', path: '/exams?q=KCET' },
      { label: 'COMEDK', path: '/exams?q=COMEDK' },
      { label: 'GATE CS', path: '/exams?q=GATE' },
    ],
    coreSkills: [
      'Data Structures & Algorithms (Arrays, Trees, Graphs, Dynamic Programming)',
      'TypeScript / Java / Python & SQL (PostgreSQL)',
      'REST APIs, Authentication, Git & Linux CLI',
      'System Design fundamentals & Automated Testing',
    ],
    portfolioProjects: [
      'Full-stack database-backed web app with role-based auth',
      'REST API microservice with caching & unit tests',
      'Real-time collaborative dashboard or CLI developer tool',
    ],
    freeResources: [
      {
        title: 'NPTEL Data Structures, Algorithms & DBMS Courses',
        provider: 'IITs via SWAYAM / NPTEL',
        url: 'https://nptel.ac.in/',
      },
      {
        title: 'SWAYAM Central Credit-Eligible CS Modules',
        provider: 'Ministry of Education',
        url: 'https://swayam.gov.in/',
      },
    ],
  },
  {
    id: 'ai-ml',
    role: 'Data Scientist & AI / Machine Learning Engineer',
    domain: 'AI, Analytics & Research',
    overview:
      'Build predictive statistical models, computer vision/NLP pipelines, and production LLM applications.',
    educationPath: 'B.Tech / B.Sc (CS, Data Science, Statistics, Mathematics) or M.Tech / MS by Research.',
    keyExams: [
      { label: 'GATE DA & CS', path: '/exams?q=GATE' },
      { label: 'CUET PG', path: '/exams?q=CUET' },
      { label: 'IIT JAM', path: '/exams?q=JAM' },
    ],
    coreSkills: [
      'Linear Algebra, Probability & Multivariate Calculus',
      'Python, NumPy, Pandas, Scikit-Learn & PyTorch',
      'SQL Analytics & Data Visualization',
      'Model Evaluation, RAG & Responsible AI Guardrails',
    ],
    portfolioProjects: [
      'End-to-end tabular ML prediction pipeline with explainability',
      'Document retrieval / QA assistant with evaluation benchmarks',
    ],
    freeResources: [
      {
        title: 'NPTEL Machine Learning & Deep Learning Specialization (IIT Madras)',
        provider: 'NPTEL / IIT Madras',
        url: 'https://nptel.ac.in/',
      },
      {
        title: 'Skill India Digital AI & Data Literacy Modules',
        provider: 'NSDC / Ministry of Skill Development',
        url: 'https://www.skillindiadigital.gov.in/',
      },
    ],
  },
  {
    id: 'govt',
    role: 'Civil Services & State Administrative Officer (IAS / IPS / KAS)',
    domain: 'Public Administration',
    overview:
      'Serve in Union (IAS, IPS, IFS) or State (KAS, KPSC Group A/B) administration through competitive merit.',
    educationPath: 'Any recognized Bachelor’s degree (BA, B.Sc, B.Com, B.E., MBBS) from UGC/AICTE university.',
    keyExams: [
      { label: 'UPSC CSE', path: '/exams?q=UPSC' },
      { label: 'KPSC KAS', path: '/exams?q=KPSC' },
      { label: 'SSC CGL', path: '/exams?q=SSC' },
    ],
    coreSkills: [
      'Indian Polity, Constitution, Economy & Modern History (NCERT Class 6–12 base)',
      'Structured Essay & General Studies Answer Writing',
      'Current Affairs Synthesis & Ethical Case Study Reasoning',
      'Optional Subject Mastery & Interview DAF Preparation',
    ],
    portfolioProjects: [
      '40-week NCERT + Standard Reference Study Tracker',
      'Timed 20-question Mains Answer Writing Practice Log',
    ],
    freeResources: [
      {
        title: 'NCERT Official Free Digital Textbooks (Class 6–12)',
        provider: 'NCERT India',
        url: 'https://ncert.nic.in/textbook.php',
      },
      {
        title: 'PIB Official Press Releases & Policy Briefs',
        provider: 'Press Information Bureau',
        url: 'https://pib.gov.in/',
      },
    ],
  },
  {
    id: 'medical',
    role: 'Medical Doctor & Clinical Specialist (MBBS / MD / MS)',
    domain: 'Medicine & Healthcare',
    overview:
      'Qualify through national medical entrance counselling for clinical practice, surgery, or public health.',
    educationPath: 'Class 12 PCB -> MBBS (5.5 years incl. internship) -> NEET PG / INI-CET Residency.',
    keyExams: [
      { label: 'NEET UG', path: '/exams?q=NEET%20UG' },
      { label: 'NEET PG', path: '/exams?q=NEET%20PG' },
      { label: 'INI-CET', path: '/exams?q=INI-CET' },
    ],
    coreSkills: [
      'NCERT Biology, Organic/Inorganic Chemistry & Physics conceptual accuracy',
      'Clinical Anatomy, Physiology, Pathology & Pharmacology',
      'NMC Competency-Based Medical Education (CBME) clinical rotations',
    ],
    portfolioProjects: [
      'MCC AIQ & KEA State Medical Seat Counselling Readiness File',
    ],
    freeResources: [
      {
        title: 'National Medical Commission (NMC) Competency Curriculum',
        provider: 'NMC India',
        url: 'https://www.nmc.org.in/',
      },
      {
        title: 'NPTEL Health Sciences & Public Health Lectures',
        provider: 'SWAYAM / NPTEL',
        url: 'https://swayam.gov.in/',
      },
    ],
  },
  {
    id: 'law',
    role: 'Advocate, Judicial Services & Corporate Counsel',
    domain: 'Law & Judiciary',
    overview:
      'Practice in High Courts/District Courts, corporate law firms, policy think tanks, or qualify for Civil Judge.',
    educationPath: '5-Year Integrated BA/BBA LL.B (after Class 12) or 3-Year LL.B (after Graduation) + AIBE.',
    keyExams: [
      { label: 'CLAT', path: '/exams?q=CLAT' },
      { label: 'AILET', path: '/exams?q=AILET' },
      { label: 'CUET Law', path: '/exams?q=CUET' },
    ],
    coreSkills: [
      'Constitutional Law, Contract Law, BNS / BNSS / BSA Statutes',
      'Legal Reading Comprehension & Moot Court Oral Advocacy',
      'Contract Drafting & Case Law Research',
    ],
    portfolioProjects: [
      '2 Moot Court Memorials & Legal Aid Clinic Briefs',
      'Published Case Notes on Constitutional / Commercial Judgments',
    ],
    freeResources: [
      {
        title: 'e-PG Pathshala Law Modules (UGC)',
        provider: 'INFLIBNET / UGC',
        url: 'https://epgp.inflibnet.ac.in/',
      },
      {
        title: 'India Code — Official Digital Repository of Central & State Acts',
        provider: 'Ministry of Law & Justice',
        url: 'https://www.indiacode.nic.in/',
      },
    ],
  },
  {
    id: 'finance',
    role: 'Chartered Accountant (CA) & Public Sector Banking Officer',
    domain: 'Finance, Accounting & Banking',
    overview:
      'Lead statutory audits, taxation, corporate finance, or Probationary Officer/Regulatory careers at SBI/IBPS/RBI.',
    educationPath: 'Commerce/Any Degree + ICAI CA (Foundation -> Intermediate -> Articleship -> Final) or Banking PO.',
    keyExams: [
      { label: 'ICAI CA', path: '/exams?q=Chartered%20Accountancy' },
      { label: 'IBPS PO', path: '/exams?q=IBPS' },
      { label: 'SBI PO', path: '/exams?q=SBI' },
      { label: 'CAT MBA', path: '/exams?q=CAT' },
    ],
    coreSkills: [
      'Ind AS Accounting, Direct Tax & GST Compliance',
      'Financial Statement Analysis & Excel Modelling',
      'Quantitative Aptitude, Reasoning & RBI Monetary Awareness',
    ],
    portfolioProjects: [
      'Listed Company 3-Statement Financial Analysis Case Study',
    ],
    freeResources: [
      {
        title: 'ICAI Digital Learning Hub & BOS Knowledge Portal',
        provider: 'ICAI Official',
        url: 'https://boslive.icai.org/',
      },
      {
        title: 'SWAYAM Commerce & Financial Accounting Courses',
        provider: 'Ministry of Education',
        url: 'https://swayam.gov.in/',
      },
    ],
  },
];

const FREE_LEARNING_PORTALS = [
  {
    name: 'SWAYAM (Ministry of Education)',
    focus: 'Credit-transferable college courses from IITs, IIMs, UGC & NCERT — Free to learn.',
    url: 'https://swayam.gov.in/',
  },
  {
    name: 'NPTEL (IITs & IISc)',
    focus: '1,000+ engineering, CS, math, AI, and humanities courses with open lecture archives.',
    url: 'https://nptel.ac.in/',
  },
  {
    name: 'Skill India Digital Hub',
    focus: 'NSDC vocational certifications, digital literacy, and PMKVY skill pathways.',
    url: 'https://www.skillindiadigital.gov.in/',
  },
  {
    name: 'AICTE Internship & ELIS Portal',
    focus: 'Verified student internships and industry upskilling partnerships.',
    url: 'https://internship.aicte-india.org/',
  },
  {
    name: 'NCERT e-Pathshala & DIKSHA',
    focus: 'Official free textbooks, JEE/NEET foundation material, and board guides.',
    url: 'https://ncert.nic.in/',
  },
  {
    name: 'National Digital Library of India (NDLI)',
    focus: 'Free repository of textbooks, theses, past papers, and competitive exam archives.',
    url: 'https://ndl.iitkgp.ac.in/',
  },
];

export function LearningStudioPage({ navigate }: LearningStudioPageProps) {
  const [tab, setTab] = useState<'roadmaps' | 'resume' | 'interview' | 'courses'>('roadmaps');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('swe');

  // Resume Builder State
  const [fullName, setFullName] = useState('Aarav Sharma');
  const [headline, setHeadline] = useState('B.E. Computer Science Undergraduate · Full-Stack & Cloud');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [email, setEmail] = useState('aarav.sharma@example.com');
  const [phone, setPhone] = useState('+91 98XXX XXXXX');
  const [links, setLinks] = useState('github.com/aarav-dev · linkedin.com/in/aarav-sharma');
  const [summary, setSummary] = useState(
    'Final-year Computer Science student with hands-on experience building TypeScript/React applications and PostgreSQL APIs. Seeking Software Engineering internship or graduate role.'
  );
  const [education, setEducation] = useState(
    'B.E. in Computer Science & Engineering, VTU Belagavi Affiliated College (2022–2026)\nPUC / Class 12 (PCM), Karnataka Pre-University Board (2022)'
  );
  const [skills, setSkills] = useState(
    'TypeScript, JavaScript, Python, React, Node.js, Express, PostgreSQL, SQL, Git, Linux'
  );
  const [experience, setExperience] = useState(
    'Software Engineering Intern — Civic Data Lab (May 2025 – Jul 2025)\n• Built accessible search filters and REST endpoints reducing query latency.\n• Automated document checklist validations with unit tests.'
  );
  const [projects, setProjects] = useState(
    'Public Services Guide Tracker (TypeScript, React, PostgreSQL)\n• Built searchable directory with rule-based eligibility filtering and document checklists.\nCampus Event & Exam Scheduler\n• Implemented role-based authentication and automated reminder exports.'
  );

  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
  } | null>(null);

  const activeRoadmap =
    CAREER_ROADMAPS.find((r) => r.id === selectedRoadmapId) || CAREER_ROADMAPS[0];

  const handlePrintResume = () => {
    window.print();
  };

  const handleDownloadHtmlResume = () => {
    const escape = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${escape(fullName)} — Resume</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:780px;margin:40px auto;padding:0 24px;color:#0b192c;line-height:1.5}h1{margin:0;font-size:26px}h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#134e7a;border-bottom:1px solid #d6cfc2;padding-bottom:4px;margin-top:20px}p,pre{font-family:inherit;white-space:pre-wrap;font-size:14px;margin:6px 0}</style>
</head><body>
<h1>${escape(fullName)}</h1>
<p><strong>${escape(headline)}</strong></p>
<p>${escape(location)} · ${escape(email)} · ${escape(phone)}<br/>${escape(links)}</p>
<h2>Summary</h2><pre>${escape(summary)}</pre>
<h2>Education</h2><pre>${escape(education)}</pre>
<h2>Technical &amp; Core Skills</h2><pre>${escape(skills)}</pre>
<h2>Experience &amp; Internships</h2><pre>${escape(experience)}</pre>
<h2>Projects</h2><pre>${escape(projects)}</pre>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'resume'}-resume.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      <div className="no-print space-y-6">
        <Breadcrumbs
          items={[{ label: 'Home', path: '/' }, { label: 'Career, Learning & Resume Studio' }]}
          navigate={navigate}
        />

        <div className="space-y-2 border-b border-[#E2DDD1] pb-5">
          <p className="text-xs font-semibold text-[#0E6B6E]">Skills, Roadmaps &amp; Career Tools</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B192C]">
            Career Roadmaps, Resume Builder &amp; Prep Studio
          </h1>
          <p className="text-sm text-[#4B5565] max-w-2xl leading-relaxed">
            Explore India-specific career pathways mapped to official exams, free SWAYAM/NPTEL
            learning resources, an ATS-clean Resume Builder with Print/PDF export, and structured
            interview guides.
          </p>
        </div>

        <Tabs
          value={tab}
          onChange={setTab}
          ariaLabel="Career and Learning Studio sections"
          options={[
            { id: 'roadmaps', label: 'Career Roadmaps' },
            { id: 'resume', label: 'Resume Builder' },
            { id: 'interview', label: 'Interview & Prep Bank' },
            { id: 'courses', label: 'Verified Free Portals' },
          ]}
        />
      </div>

      {/* TAB 1: CAREER ROADMAPS */}
      {tab === 'roadmaps' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-4 space-y-2">
            {CAREER_ROADMAPS.map((rm) => {
              const active = rm.id === activeRoadmap.id;
              return (
                <button
                  key={rm.id}
                  type="button"
                  onClick={() => setSelectedRoadmapId(rm.id)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    active
                      ? 'border-[#134E7A] bg-[#0B192C] text-white'
                      : 'border-[#E2DDD1] bg-white text-[#0B192C] hover:bg-[#FAF8F3]'
                  }`}
                >
                  <p
                    className={`text-[11px] font-semibold ${
                      active ? 'text-amber-300' : 'text-[#5C6573]'
                    }`}
                  >
                    {rm.domain}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-snug">{rm.role}</p>
                </button>
              );
            })}
          </div>

          <Card className="lg:col-span-8 p-6 space-y-6">
            <div className="space-y-2 border-b border-[#EFECE3] pb-4">
              <p className="text-xs font-semibold text-[#134E7A]">{activeRoadmap.domain}</p>
              <h2 className="font-display text-2xl font-bold text-[#0B192C]">
                {activeRoadmap.role}
              </h2>
              <p className="text-sm text-[#4B5565] leading-relaxed">{activeRoadmap.overview}</p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C6573]">
                Recommended Education Path
              </h3>
              <p className="text-sm text-[#0B192C]">{activeRoadmap.educationPath}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C6573]">
                Relevant Indian Entrance &amp; Recruitment Exams
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeRoadmap.keyExams.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => navigate(ex.path)}
                    className="rounded-lg border border-[#D6CFC2] bg-[#FAF8F3] px-3 py-1.5 text-xs font-semibold text-[#134E7A] hover:border-[#134E7A] hover:bg-white transition-colors"
                  >
                    {ex.label} Guide →
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-4 space-y-2">
                <h3 className="text-sm font-bold text-[#0B192C] flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-[#134E7A]" />
                  <span>Core Skills &amp; Foundations</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-[#4B5565]">
                  {activeRoadmap.coreSkills.map((sk) => (
                    <li key={sk}>· {sk}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-4 space-y-2">
                <h3 className="text-sm font-bold text-[#0B192C] flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-[#0E6B6E]" />
                  <span>Practical Proof &amp; Projects</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-[#4B5565]">
                  {activeRoadmap.portfolioProjects.map((pr) => (
                    <li key={pr}>· {pr}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#EFECE3] pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C6573]">
                Verified Free Learning &amp; Reference Portals
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {activeRoadmap.freeResources.map((res) => (
                  <button
                    key={res.url + res.title}
                    type="button"
                    onClick={() =>
                      setExternalTarget({
                        title: res.title,
                        portalName: res.provider,
                        url: res.url,
                      })
                    }
                    className="flex items-start justify-between gap-2 rounded-lg border border-[#D6CFC2] bg-white p-3.5 text-left hover:border-[#134E7A] transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#0B192C]">{res.title}</p>
                      <p className="text-[11px] text-[#5C6573] mt-0.5">{res.provider}</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#134E7A] mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: RESUME BUILDER */}
      {tab === 'resume' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Form Column */}
          <Card className="no-print lg:col-span-5 p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#EFECE3] pb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0B192C]">Resume Editor</h2>
                <p className="text-xs text-[#5C6573]">
                  ATS-friendly, single-column layout. Processed locally in your browser.
                </p>
              </div>
            </div>

            <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
              <span>Full Name</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
              />
            </label>

            <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
              <span>Headline / Target Role</span>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
                <span>City &amp; State</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
                />
              </label>
              <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
                <span>Phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
                />
              </label>
            </div>

            <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
              <span>Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
              />
            </label>

            <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
              <span>GitHub / LinkedIn / Portfolio</span>
              <input
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
              />
            </label>

            <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
              <span>Career Summary</span>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
              />
            </label>

            <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
              <span>Education</span>
              <textarea
                rows={3}
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
              />
            </label>

            <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
              <span>Skills</span>
              <textarea
                rows={2}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
              />
            </label>

            <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
              <span>Experience / Internships</span>
              <textarea
                rows={3}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
              />
            </label>

            <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
              <span>Projects</span>
              <textarea
                rows={3}
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
              />
            </label>
          </Card>

          {/* Live Print Sheet */}
          <div className="lg:col-span-7 space-y-4">
            <div className="no-print flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[#5C6573]">
                Live Print Preview (A4 Clean Format)
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadHtmlResume}>
                  <Download className="h-3.5 w-3.5" />
                  <span>Download HTML Resume</span>
                </Button>
                <Button size="sm" onClick={handlePrintResume}>
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / Save as PDF</span>
                </Button>
              </div>
            </div>

            <div className="resume-print-sheet rounded-lg border border-[#D6CFC2] bg-white p-8 shadow-sm space-y-5 text-[#0B192C]">
              <div className="border-b-2 border-[#0B192C] pb-3">
                <h2 className="font-display text-2xl font-bold tracking-tight text-[#0B192C]">
                  {fullName || 'Your Name'}
                </h2>
                <p className="text-sm font-semibold text-[#134E7A] mt-0.5">{headline}</p>
                <p className="text-xs text-[#4B5565] mt-1">
                  {location} · {email} · {phone}
                </p>
                {links && <p className="text-xs font-mono text-[#5C6573] mt-0.5">{links}</p>}
              </div>

              {summary && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#134E7A] border-b border-[#E2DDD1] pb-1">
                    Summary
                  </h3>
                  <p className="text-xs leading-relaxed whitespace-pre-line text-[#0B192C]">
                    {summary}
                  </p>
                </div>
              )}

              {education && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#134E7A] border-b border-[#E2DDD1] pb-1">
                    Education
                  </h3>
                  <p className="text-xs leading-relaxed whitespace-pre-line text-[#0B192C]">
                    {education}
                  </p>
                </div>
              )}

              {skills && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#134E7A] border-b border-[#E2DDD1] pb-1">
                    Core Skills
                  </h3>
                  <p className="text-xs leading-relaxed whitespace-pre-line text-[#0B192C]">
                    {skills}
                  </p>
                </div>
              )}

              {experience && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#134E7A] border-b border-[#E2DDD1] pb-1">
                    Experience &amp; Internships
                  </h3>
                  <p className="text-xs leading-relaxed whitespace-pre-line text-[#0B192C]">
                    {experience}
                  </p>
                </div>
              )}

              {projects && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#134E7A] border-b border-[#E2DDD1] pb-1">
                    Projects
                  </h3>
                  <p className="text-xs leading-relaxed whitespace-pre-line text-[#0B192C]">
                    {projects}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTERVIEW & PREP BANK */}
      {tab === 'interview' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Card className="p-6 space-y-3">
            <p className="text-xs font-semibold text-[#134E7A]">Technical &amp; Placement Prep</p>
            <h2 className="font-display text-lg font-bold text-[#0B192C]">
              Engineering &amp; Software Interview Structure
            </h2>
            <ul className="space-y-2 text-xs text-[#4B5565] leading-relaxed">
              <li>
                <strong className="text-[#0B192C]">1. Problem Solving (45 mins):</strong> Clarify
                constraints first, propose brute force, optimize time/space, write clean code, and
                dry-run edge cases.
              </li>
              <li>
                <strong className="text-[#0B192C]">2. Core CS Fundamentals:</strong> Operating
                Systems (threads, locks, virtual memory), DBMS (indexing, normalization, ACID), and
                Computer Networks (HTTP/HTTPS, TCP, DNS).
              </li>
              <li>
                <strong className="text-[#0B192C]">3. Project Deep Dive:</strong> Be ready to sketch
                your database schema, authentication boundary, and trade-offs from your own projects.
              </li>
            </ul>
          </Card>

          <Card className="p-6 space-y-3">
            <p className="text-xs font-semibold text-[#0E6B6E]">HR &amp; Behavioural Framework</p>
            <h2 className="font-display text-lg font-bold text-[#0B192C]">
              STAR Method for Situational Questions
            </h2>
            <ul className="space-y-2 text-xs text-[#4B5565] leading-relaxed">
              <li>
                <strong className="text-[#0B192C]">S — Situation:</strong> Briefly establish the
                academic, team, or internship context in 2 sentences.
              </li>
              <li>
                <strong className="text-[#0B192C]">T — Task:</strong> Define what responsibility or
                bottleneck you owned directly.
              </li>
              <li>
                <strong className="text-[#0B192C]">A — Action:</strong> Explain the specific steps,
                technical choices, or team coordination you executed.
              </li>
              <li>
                <strong className="text-[#0B192C]">R — Result:</strong> Share factual outcomes
                without exaggerating metrics or fabricating numbers.
              </li>
            </ul>
          </Card>

          <Card className="p-6 space-y-3">
            <p className="text-xs font-semibold text-[#C46316]">Public Service Panels</p>
            <h2 className="font-display text-lg font-bold text-[#0B192C]">
              UPSC / KPSC Personality Test &amp; DAF Guide
            </h2>
            <ul className="space-y-2 text-xs text-[#4B5565] leading-relaxed">
              <li>
                <strong className="text-[#0B192C]">Detailed Application Form (DAF):</strong> Prepare
                thoroughly on your home district, graduation subject, hobbies, and current state
                administration issues.
              </li>
              <li>
                <strong className="text-[#0B192C]">Balanced Administrative Stance:</strong> Present
                constitutional values, citizen welfare trade-offs, and practical district
                implementation constraints calmly.
              </li>
            </ul>
          </Card>

          <Card className="p-6 space-y-3">
            <p className="text-xs font-semibold text-[#134E7A]">Aptitude &amp; Reasoning</p>
            <h2 className="font-display text-lg font-bold text-[#0B192C]">
              Campus &amp; Banking Quantitative Checkpoint
            </h2>
            <ul className="space-y-2 text-xs text-[#4B5565] leading-relaxed">
              <li>
                <strong className="text-[#0B192C]">Core Quantitative Topics:</strong> Percentages,
                Ratios, Profit &amp; Loss, Time-Speed-Distance, Permutations, and Data Interpretation.
              </li>
              <li>
                <strong className="text-[#0B192C]">Accuracy Over Blind Speed:</strong> Track negative
                marking rules carefully for SSC, IBPS, CAT, and GATE exams.
              </li>
            </ul>
          </Card>
        </div>
      )}

      {/* TAB 4: VERIFIED FREE PORTALS */}
      {tab === 'courses' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FREE_LEARNING_PORTALS.map((portal) => (
              <Card key={portal.url} className="p-5 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0E6B6E]">
                    <BookOpen className="h-4 w-4" />
                    <span>Official Open Learning</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-[#0B192C]">{portal.name}</h3>
                  <p className="text-xs leading-relaxed text-[#4B5565]">{portal.focus}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() =>
                    setExternalTarget({
                      title: portal.name,
                      portalName: portal.name,
                      url: portal.url,
                    })
                  }
                >
                  <span>Visit Official Portal</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Card>
            ))}
          </div>

          <Card className="p-5 bg-[#FAF8F3] border-[#E2DDD1] flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-[#0E6B6E] shrink-0 mt-0.5" />
            <div className="text-xs text-[#4B5565] space-y-1">
              <p className="font-semibold text-[#0B192C]">
                Check Credit Eligibility Before Enrolling
              </p>
              <p>
                Create your{' '}
                <button
                  type="button"
                  onClick={() => navigate('/services/abc-id-academic-bank-of-credits-digilocker-nad')}
                  className="font-semibold text-[#134E7A] underline"
                >
                  Academic Bank of Credits (ABC ID)
                </button>{' '}
                if you plan to transfer SWAYAM/NPTEL university credits into your degree transcript.
              </p>
            </div>
          </Card>
        </div>
      )}

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
