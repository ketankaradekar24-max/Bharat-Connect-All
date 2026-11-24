import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronDown,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  ShieldAlert,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { BrandMark } from './BrandMark.tsx';
import { BC_EASE } from './MotionPrimitives.tsx';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenSearch?: () => void;
}

type NavKey = 'exams' | 'colleges' | 'services' | 'scholarships' | 'jobs';

interface MegaMenuData {
  key: NavKey;
  title: string;
  subtitle: string;
  primaryPath: string;
  primaryLabel: string;
  columns: Array<{
    heading: string;
    links: Array<{ label: string; desc: string; path: string }>;
  }>;
  featuredTools: Array<{ label: string; path: string }>;
}

const MEGA_MENUS: Record<NavKey, MegaMenuData> = {
  exams: {
    key: 'exams',
    title: 'Competitive & Entrance Exams',
    subtitle: 'Syllabus, eligibility, state counselling, and official portal verification.',
    primaryPath: '/exams',
    primaryLabel: 'Explore All 85+ Exams',
    columns: [
      {
        heading: 'Engineering & Medical',
        links: [
          { label: 'JEE Main & Advanced', desc: 'National IIT / NIT / IIIT routes', path: '/exams?category=Engineering&subcategory=National' },
          { label: 'KCET & COMEDK (Karnataka)', desc: 'KEA & private engineering pathways', path: '/exams?category=Engineering&subcategory=Karnataka' },
          { label: 'State Engineering (MHT CET, KEAM, WBJEE)', desc: 'Regional counselling & lateral entry', path: '/exams?category=Engineering&subcategory=State' },
          { label: 'NEET UG, PG, INI-CET & Nursing', desc: 'Medical, AYUSH & allied health', path: '/exams?category=Medical' },
        ],
      },
      {
        heading: 'University, Govt & Careers',
        links: [
          { label: 'CUET UG & Central Universities', desc: 'National & state university admissions', path: '/exams?category=University%20Admissions' },
          { label: 'UPSC, SSC & Banking', desc: 'Civil Services, CGL & IBPS/SBI tracks', path: '/exams?category=Government%20Jobs' },
          { label: 'Law, Management & Design', desc: 'CLAT, CAT, NATA & UCEED guides', path: '/exams?category=Law' },
          { label: 'Admission Counselling Playbooks', desc: 'JoSAA, KEA KCET & MCC step-by-step', path: '/counselling' },
        ],
      },
    ],
    featuredTools: [
      { label: 'Personal Opportunity Finder', path: '/opportunities' },
      { label: 'Upcoming Exam Calendar', path: '/tools' },
    ],
  },
  colleges: {
    key: 'colleges',
    title: 'Colleges, Universities & Comparison',
    subtitle: 'Compare public institutes, state technical universities, and private campuses.',
    primaryPath: '/colleges',
    primaryLabel: 'Find & Compare Colleges',
    columns: [
      {
        heading: 'Browse by Stream & Region',
        links: [
          { label: 'Engineering Institutes (IITs, NITs, IIITs)', desc: 'JoSAA & CSAB admission routes', path: '/colleges?stream=Engineering' },
          { label: 'VTU Belagavi & Karnataka Colleges', desc: 'KCET, COMEDK & PGCET seats', path: '/colleges?state=Karnataka' },
          { label: 'Medical, Pharmacy & Allied Health', desc: 'AIIMS, state GMCs & deemed colleges', path: '/colleges?stream=Medical' },
          { label: 'Private & Deemed Universities', desc: 'BITSAT, VITEEE, MET & SRMJEEE', path: '/colleges?privateOnly=true' },
        ],
      },
      {
        heading: 'Admissions & Budgeting',
        links: [
          { label: 'Counselling Authorities Hub', desc: 'Document verification & choice filling', path: '/counselling' },
          { label: 'Education Cost & Aid Estimator', desc: 'Plan annual fees & loan gap', path: '/tools' },
          { label: 'State-Wise Admissions Focus', desc: 'Regional domicile quotas & rules', path: '/states' },
        ],
      },
    ],
    featuredTools: [
      { label: 'Compare up to 3 Colleges', path: '/colleges' },
      { label: 'VTU Belagavi Admission Guide', path: '/universities/vtu' },
    ],
  },
  services: {
    key: 'services',
    title: 'Public & Citizen Services',
    subtitle: 'Step-by-step checklists, official fees, and verified .gov.in portal routes.',
    primaryPath: '/services',
    primaryLabel: 'Open All Services',
    columns: [
      {
        heading: 'Everyday Essential Needs',
        links: [
          { label: 'Driving Licence & Parivahan RC', desc: 'Learner, Permanent DL & Vahan', path: '/services?category=Driving+Licence+%26+Transport' },
          { label: 'Passport Seva & Visa Assistance', desc: 'PSK appointments & travel checklists', path: '/services?category=Passport+%26+Visa' },
          { label: 'Aadhaar, PAN, Voter ID & DigiLocker', desc: 'Core identity & civil certificates', path: '/services?category=Government+Documents' },
          { label: 'Seva Sindhu & Welfare Schemes', desc: 'Karnataka & Central citizen schemes', path: '/services?category=Government+Schemes' },
        ],
      },
      {
        heading: 'Citizen & Business Desks',
        links: [
          { label: 'Business, Udyam MSME & Startup India', desc: 'Registration & compliance guides', path: '/services?category=Business+%26+Entrepreneurship' },
          { label: 'Tax, Banking & Financial Literacy', desc: 'Income tax e-Filing, PPF & NPS', path: '/services?category=Tax+%26+Financial' },
          { label: 'Health (ABHA / PM-JAY) & Agriculture', desc: 'PM-KISAN, e-NAM & health IDs', path: '/services?category=Health+%26+Public+Services' },
          { label: 'Scam Alert & Official Link Checker', desc: 'Verify .gov.in domains before paying', path: '/scam-alerts' },
        ],
      },
    ],
    featuredTools: [
      { label: 'Karnataka & State Portals', path: '/states' },
      { label: 'Verify Suspicious Portal Links', path: '/scam-alerts' },
    ],
  },
  scholarships: {
    key: 'scholarships',
    title: 'Scholarships & Financial Aid',
    subtitle: 'Rule-based eligibility matching across Central NSP, State SSP & CSR trusts.',
    primaryPath: '/scholarships',
    primaryLabel: 'Browse All Scholarships',
    columns: [
      {
        heading: 'Filter by Provider & Program',
        links: [
          { label: 'Karnataka SSP Scholarships', desc: 'Post-matric, Vidyasiri & fee reimbursement', path: '/scholarships?state=Karnataka' },
          { label: 'National Scholarship Portal (NSP)', desc: 'Central Sector, UGC & AICTE schemes', path: '/scholarships?category=Central' },
          { label: 'Merit, Minority & Disability Aid', desc: 'Category-specific financial support', path: '/scholarships?category=Merit-based' },
          { label: 'Private & Corporate Foundations', desc: 'Reliance, Tata, HDFC & CSR grants', path: '/scholarships?category=Private' },
        ],
      },
      {
        heading: 'Smart Matching & Loans',
        links: [
          { label: 'Personal Opportunity Finder', desc: 'Check eligibility by income & marks', path: '/opportunities' },
          { label: 'PM-Vidyalaxmi Education Loans', desc: 'Central education loan portal guide', path: '/services/pm-vidyalaxmi-education-loan-portal' },
          { label: 'Deadline Calendar', desc: 'Never miss an annual closing window', path: '/tools' },
        ],
      },
    ],
    featuredTools: [
      { label: 'Match My Eligibility', path: '/opportunities' },
      { label: 'Estimate Education Cost', path: '/tools' },
    ],
  },
  jobs: {
    key: 'jobs',
    title: 'Jobs, Apprenticeships & Career Studio',
    subtitle: 'Official public recruitment portals, internships, roadmaps, and resume prep.',
    primaryPath: '/jobs',
    primaryLabel: 'Explore Jobs & Pathways',
    columns: [
      {
        heading: 'Recruitment & Internships',
        links: [
          { label: 'Central & Karnataka Govt Recruitment', desc: 'NCS, KPSC, KEA, SSC & UPSC', path: '/jobs?category=Central%20Government%20Jobs' },
          { label: 'Banking, Railway, Defence & PSUs', desc: 'IBPS, RRB & GATE PSU tracks', path: '/jobs?category=Banking' },
          { label: 'PM Internship & AICTE/NATS', desc: 'Paid apprenticeships & student tracks', path: '/jobs?category=Internships%20%26%20Apprenticeships' },
        ],
      },
      {
        heading: 'Career Growth & Preparation',
        links: [
          { label: 'India Career Roadmaps', desc: 'Step-by-step skill & exam plans', path: '/learning' },
          { label: 'ATS Resume PDF Builder', desc: 'Print-ready resume builder & templates', path: '/learning' },
          { label: 'Community Q&A', desc: 'Ask verified pathway questions', path: '/community' },
        ],
      },
    ],
    featuredTools: [
      { label: 'Open Career & Resume Studio', path: '/learning' },
      { label: 'Check Scam Recruitment Safety', path: '/scam-alerts' },
    ],
  },
};

export function Navbar({ currentPath, navigate, onOpenSearch }: NavbarProps) {
  const { dbUser, openAuthModal, logout } = useAuth();
  const prefersReduced = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [openMegaKey, setOpenMegaKey] = useState<NavKey | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
        setOpenMegaKey(null);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    setOpenMegaKey(null);
    setAccountMenuOpen(false);
    setMobileOpen(false);
  }, [currentPath]);

  const navItems: Array<{ key: NavKey; label: string; path: string }> = [
    { key: 'exams', label: 'Exams', path: '/exams' },
    { key: 'colleges', label: 'Colleges', path: '/colleges' },
    { key: 'services', label: 'Services', path: '/services' },
    { key: 'scholarships', label: 'Scholarships', path: '/scholarships' },
    { key: 'jobs', label: 'Jobs', path: '/jobs' },
  ];

  const handleNav = (path: string) => {
    setMobileOpen(false);
    setAccountMenuOpen(false);
    setOpenMegaKey(null);
    navigate(path);
  };

  const openMenu = (key: NavKey) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setAccountMenuOpen(false);
    setOpenMegaKey(key);
  };

  const scheduleCloseMenu = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setOpenMegaKey(null);
    }, 150);
  };

  const activeMega = openMegaKey ? MEGA_MENUS[openMegaKey] : null;

  return (
    <header
      ref={headerRef}
      onMouseLeave={scheduleCloseMenu}
      className="sticky top-0 z-40 border-b border-[#E2DDD1] bg-[#FAF8F3]/95 backdrop-blur-sm"
    >
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (5 concise links) — Zone 3 (1 Primary Action) */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
        {/* Zone 1: Single-Line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('/')}
          className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#0B192C] whitespace-nowrap shrink-0"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <BrandMark className="h-8 w-8" />
          <span>Bharat Connect</span>
        </button>

        {/* Zone 2: 5 Concise Single-Line Nav Links with Smart Mega-Menu */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#475467]"
        >
          {navItems.map((item) => {
            const active =
              currentPath === item.path || currentPath.startsWith(`${item.path}/`);
            const megaOpen = openMegaKey === item.key;
            return (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => openMenu(item.key)}
              >
                <button
                  type="button"
                  onClick={() => handleNav(item.path)}
                  aria-expanded={megaOpen}
                  className={`relative inline-flex items-center gap-1 py-1.5 whitespace-nowrap shrink-0 transition-colors ${
                    active || megaOpen
                      ? 'text-[#0B192C] font-semibold'
                      : 'text-[#475467] hover:text-[#0B192C]'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronDown
                    className={`h-3 w-3 text-[#7A828F] transition-transform duration-150 ${
                      megaOpen ? 'rotate-180 text-[#0B192C]' : ''
                    }`}
                  />
                  {active && (
                    <motion.span
                      layoutId="nav-active-underline"
                      transition={{ duration: prefersReduced ? 0 : 0.2, ease: BC_EASE }}
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-[13px] h-[2px] bg-[#C46316]"
                    />
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action / Account Menu */}
        <div className="hidden lg:flex items-center shrink-0">
          {dbUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenMegaKey(null);
                  setAccountMenuOpen((prev) => !prev);
                }}
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                className="inline-flex items-center gap-2 rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-xs font-semibold text-[#0B192C] hover:border-[#0B192C]/45 transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#134E7A] text-[11px] font-bold text-white">
                  {(dbUser.displayName || 'U').charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[130px] truncate">{dbUser.displayName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#5C6573]" />
              </button>

              <AnimatePresence>
                {accountMenuOpen && (
                  <motion.div
                    initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
                    transition={{ duration: 0.16, ease: BC_EASE }}
                    role="menu"
                    className="absolute right-0 mt-2 w-60 rounded-lg border border-[#D6CFC2] bg-white p-1.5 shadow-xl"
                  >
                    <div className="border-b border-[#EFECE3] px-3 py-2">
                      <p className="truncate text-xs font-semibold text-[#0B192C]">
                        {dbUser.displayName}
                      </p>
                      <p className="truncate text-[11px] text-[#5C6573]">{dbUser.email}</p>
                    </div>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => handleNav('/dashboard')}
                      className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-[#0B192C] hover:bg-[#FAF8F3]"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-[#134E7A]" />
                      <span>Personal Dashboard</span>
                    </button>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => handleNav('/profile')}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-[#0B192C] hover:bg-[#FAF8F3]"
                    >
                      <User className="h-3.5 w-3.5 text-[#5C6573]" />
                      <span>Profile &amp; Preferences</span>
                    </button>
                    <div className="my-1 border-t border-[#EFECE3]" />
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => handleNav('/opportunities')}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-[#0B192C] hover:bg-[#FAF8F3]"
                    >
                      <Compass className="h-3.5 w-3.5 text-[#134E7A]" />
                      <span>Opportunity Finder</span>
                    </button>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => handleNav('/learning')}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-[#0B192C] hover:bg-[#FAF8F3]"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-[#0E6B6E]" />
                      <span>Career &amp; Resume Studio</span>
                    </button>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => handleNav('/tools')}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-[#0B192C] hover:bg-[#FAF8F3]"
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#C46316]" />
                      <span>Deadlines &amp; Cost Planner</span>
                    </button>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => handleNav('/scam-alerts')}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-[#0B192C] hover:bg-[#FAF8F3]"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-[#C46316]" />
                      <span>Scam Alert Center</span>
                    </button>
                    {dbUser.role === 'admin' && (
                      <button
                        role="menuitem"
                        type="button"
                        onClick={() => handleNav('/admin')}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-[#0B192C] hover:bg-[#FAF8F3]"
                      >
                        <Shield className="h-3.5 w-3.5 text-[#134E7A]" />
                        <span>Admin Console</span>
                      </button>
                    )}
                    <div className="my-1 border-t border-[#EFECE3]" />
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="rounded-lg bg-[#0B192C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#132842] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#D6CFC2] bg-white text-[#0B192C] hover:bg-[#F3EFE6]"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop Smart Mega-Menu Drawer */}
      <AnimatePresence>
        {activeMega && (
          <motion.div
            key={activeMega.key}
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: BC_EASE }}
            onMouseEnter={() => openMenu(activeMega.key)}
            className="hidden lg:block absolute inset-x-0 top-full border-b border-[#D6CFC2] bg-white shadow-xl"
          >
            <div className="mx-auto max-w-6xl px-6 py-7">
              <div className="grid grid-cols-12 gap-8">
                {/* Left Overview */}
                <div className="col-span-3 flex flex-col justify-between border-r border-[#EFECE3] pr-6">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#C46316]">Directory Section</p>
                    <h3 className="text-base font-bold text-[#0B192C]">{activeMega.title}</h3>
                    <p className="text-xs leading-relaxed text-[#475467]">
                      {activeMega.subtitle}
                    </p>
                  </div>

                  <div className="space-y-2 pt-4">
                    <button
                      type="button"
                      onClick={() => handleNav(activeMega.primaryPath)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#134E7A] hover:text-[#0D3B5E]"
                    >
                      <span>{activeMega.primaryLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    {onOpenSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMegaKey(null);
                          onOpenSearch();
                        }}
                        className="flex w-full items-center justify-between rounded-md border border-[#E2DDD1] bg-[#FAF8F3] px-3 py-2 text-xs font-medium text-[#475467] hover:border-[#134E7A] hover:text-[#0B192C] transition-colors"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Search className="h-3.5 w-3.5" />
                          <span>Universal Search</span>
                        </span>
                        <kbd className="font-mono text-[10px] text-[#5C6573]">⌘K</kbd>
                      </button>
                    )}
                  </div>
                </div>

                {/* Middle Columns */}
                <div className="col-span-6 grid grid-cols-2 gap-6">
                  {activeMega.columns.map((col) => (
                    <div key={col.heading} className="space-y-3">
                      <p className="text-[11px] font-semibold text-[#5C6573]">{col.heading}</p>
                      <div className="space-y-1.5">
                        {col.links.map((lnk) => (
                          <button
                            key={lnk.label}
                            type="button"
                            onClick={() => handleNav(lnk.path)}
                            className="group block w-full rounded-md p-2 text-left hover:bg-[#FAF8F3] transition-colors"
                          >
                            <p className="text-xs font-semibold text-[#0B192C] group-hover:text-[#134E7A]">
                              {lnk.label}
                            </p>
                            <p className="text-[11px] text-[#5C6573]">{lnk.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Planning Tools */}
                <div className="col-span-3 rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-4 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-semibold text-[#0E6B6E]">Planning &amp; Safety</p>
                    <div className="space-y-1.5">
                      {activeMega.featuredTools.map((tool) => (
                        <button
                          key={tool.label}
                          type="button"
                          onClick={() => handleNav(tool.path)}
                          className="flex w-full items-center justify-between rounded-md bg-white border border-[#E2DDD1] px-3 py-2 text-xs font-semibold text-[#0B192C] hover:border-[#134E7A] hover:text-[#134E7A] transition-colors"
                        >
                          <span>{tool.label}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-[#7A828F]" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-[11px] leading-snug text-[#5C6573]">
                    Zero middlemen · Official `.gov.in` and institutional routes only.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: BC_EASE }}
            className="lg:hidden border-t border-[#E2DDD1] bg-white px-4 py-4 space-y-3 shadow-lg max-h-[82vh] overflow-y-auto"
          >
            {onOpenSearch && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenSearch();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg border border-[#CFC8B8] bg-[#FAF8F3] px-3.5 py-2.5 text-sm font-medium text-[#475467] min-h-[44px]"
              >
                <Search className="h-4 w-4 text-[#134E7A]" />
                <span>Search exams, colleges, services, scholarships...</span>
              </button>
            )}

            <div className="space-y-1">
              <p className="px-2 text-[11px] font-semibold text-[#5C6573]">Core Directories</p>
              {navItems.map((item) => {
                const active =
                  currentPath === item.path || currentPath.startsWith(`${item.path}/`);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path)}
                    className={`flex w-full items-center justify-between rounded-md px-3.5 py-2.5 text-left text-sm font-medium min-h-[44px] ${
                      active
                        ? 'bg-[#F3EFE6] text-[#134E7A] font-semibold'
                        : 'text-[#0B192C] hover:bg-[#FAF8F3]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#9AA2AE]" />
                  </button>
                );
              })}
            </div>

            <div className="space-y-1 pt-2 border-t border-[#EFECE3]">
              <p className="px-2 text-[11px] font-semibold text-[#5C6573]">
                Planning Studio &amp; State Hubs
              </p>
              {[
                ...(dbUser ? [{ label: 'Personal Dashboard', path: '/dashboard' }] : []),
                { label: 'Opportunity Finder', path: '/opportunities' },
                { label: 'Career & Resume Studio', path: '/learning' },
                { label: 'Deadlines & Cost Planner', path: '/tools' },
                { label: 'Scam Alert Center', path: '/scam-alerts' },
                { label: 'Counselling Playbooks', path: '/counselling' },
                { label: 'Karnataka & States Hub', path: '/states' },
                { label: 'Community Q&A', path: '/community' },
                ...(dbUser ? [{ label: 'Profile & Preferences', path: '/profile' }] : []),
              ].map((item) => {
                const active =
                  currentPath === item.path || currentPath.startsWith(`${item.path}/`);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path)}
                    className={`flex w-full items-center justify-between rounded-md px-3.5 py-2.5 text-left text-sm font-medium min-h-[44px] ${
                      active
                        ? 'bg-[#F3EFE6] text-[#134E7A] font-semibold'
                        : 'text-[#0B192C] hover:bg-[#FAF8F3]'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E2DDD1]">
              {dbUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B192C] min-h-[44px]"
                >
                  Sign Out ({dbUser.displayName})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openAuthModal();
                  }}
                  className="w-full rounded-lg bg-[#0B192C] px-4 py-2.5 text-sm font-semibold text-white min-h-[44px]"
                >
                  Sign In / Create Account
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
