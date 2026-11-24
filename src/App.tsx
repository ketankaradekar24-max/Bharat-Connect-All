import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { X } from 'lucide-react';
import { AuthGateModal } from './components/AuthGateModal.tsx';
import { Footer } from './components/Footer.tsx';
import { PageTransition } from './components/MotionPrimitives.tsx';
import { Navbar } from './components/Navbar.tsx';
import { SpotlightSearch } from './components/SpotlightSearch.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { trackAnalyticsEvent } from './lib/analytics.ts';
import { AboutPage } from './pages/AboutPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { CollegesPage } from './pages/CollegesPage.tsx';
import { CommunityPage } from './pages/CommunityPage.tsx';
import { CounsellingPage } from './pages/CounsellingPage.tsx';
import { ExamDetailPage } from './pages/ExamDetailPage.tsx';
import { ExamsPage } from './pages/ExamsPage.tsx';
import { ExploreServicesPage } from './pages/ExploreServicesPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { InstitutionDetailPage } from './pages/InstitutionDetailPage.tsx';
import { JobDetailPage } from './pages/JobDetailPage.tsx';
import { JobsPage } from './pages/JobsPage.tsx';
import { LearningStudioPage } from './pages/LearningStudioPage.tsx';
import { OpportunityFinderPage } from './pages/OpportunityFinderPage.tsx';
import { PolicyPage } from './pages/PolicyPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { ScamAlertsPage } from './pages/ScamAlertsPage.tsx';
import { ScholarshipDetailPage } from './pages/ScholarshipDetailPage.tsx';
import { ScholarshipsPage } from './pages/ScholarshipsPage.tsx';
import { ServiceDetailPage } from './pages/ServiceDetailPage.tsx';
import { StatesHubPage } from './pages/StatesHubPage.tsx';
import { StudentDashboardPage } from './pages/StudentDashboardPage.tsx';
import { ToolsHubPage } from './pages/ToolsHubPage.tsx';

function AppShell() {
  const { dbUser } = useAuth();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [locationState, setLocationState] = useState(() => ({
    pathname: window.location.pathname || '/',
    search: window.location.search || '',
  }));

  useEffect(() => {
    const onPopState = () => {
      setLocationState({
        pathname: window.location.pathname || '/',
        search: window.location.search || '',
      });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const navigate = useCallback((target: string) => {
    const [rawPath, rawSearch] = target.split('?');
    const nextPath = rawPath || '/';
    const nextSearch = rawSearch ? `?${rawSearch}` : '';
    window.history.pushState({}, '', `${nextPath}${nextSearch}`);
    setLocationState({ pathname: nextPath, search: nextSearch });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { pathname, search } = locationState;

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Bharat Connect — India’s Opportunity & Public Services Network',
      '/services': 'Explore Public Services — Bharat Connect',
      '/scholarships': 'Explore Verified Scholarships — Bharat Connect',
      '/exams': 'Competitive & Entrance Exams — Bharat Connect',
      '/colleges': 'Find Colleges & Universities — Bharat Connect',
      '/counselling': 'Admission & Counselling Playbooks — Bharat Connect',
      '/jobs': 'Jobs, Apprenticeships & Recruitment — Bharat Connect',
      '/opportunities': 'Personal Opportunity Finder — Bharat Connect',
      '/learning': 'Career Roadmaps, Resume Builder & Courses — Bharat Connect',
      '/tools': 'Deadline Calendar & Education Cost Planner — Bharat Connect',
      '/scam-alerts': 'Scam Alert Center & Official Link Checker — Bharat Connect',
      '/states': 'State-Wise Public Services — Bharat Connect',
      '/community': 'Community Q&A — Bharat Connect',
      '/dashboard': 'Personal Workspace — Bharat Connect',
      '/profile': 'Profile & Preferences — Bharat Connect',
      '/admin': 'Admin Console — Bharat Connect',
      '/about': 'About Us — Bharat Connect',
      '/contact': 'Contact — Bharat Connect',
      '/privacy': 'Privacy Policy — Bharat Connect',
      '/terms': 'Terms of Service — Bharat Connect',
      '/disclaimer': 'Service & Scholarship Disclaimer — Bharat Connect',
    };
    const nextTitle =
      titles[pathname] ||
      (pathname.startsWith('/services/')
        ? 'Service Guide — Bharat Connect'
        : pathname.startsWith('/exams/')
          ? 'Exam Guide — Bharat Connect'
          : pathname.startsWith('/colleges/') || pathname.startsWith('/universities/')
            ? 'University & College Admissions — Bharat Connect'
            : pathname.startsWith('/counselling/')
              ? 'Counselling Playbook — Bharat Connect'
              : pathname.startsWith('/scholarships/')
                ? 'Scholarship Details — Bharat Connect'
                : pathname.startsWith('/jobs/')
                  ? 'Job & Career Pathway — Bharat Connect'
                  : 'Bharat Connect');
    document.title = nextTitle;

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${pathname}`;
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = nextTitle;

    trackAnalyticsEvent('page_view', pathname);
  }, [pathname]);

  const renderPage = () => {
    if (pathname === '/') return <HomePage navigate={navigate} />;
    if (pathname === '/services')
      return <ExploreServicesPage navigate={navigate} initialSearch={search} />;
    if (pathname.startsWith('/services/')) {
      const slug = pathname.replace('/services/', '').replace(/\/+$/, '');
      return <ServiceDetailPage slug={slug} navigate={navigate} />;
    }
    if (pathname === '/exams')
      return <ExamsPage navigate={navigate} initialSearch={search} />;
    if (pathname.startsWith('/exams/')) {
      const slug = pathname.replace('/exams/', '').replace(/\/+$/, '');
      return <ExamDetailPage slug={slug} navigate={navigate} />;
    }
    if (pathname === '/colleges' || pathname === '/universities')
      return <CollegesPage navigate={navigate} initialSearch={search} />;
    if (pathname.startsWith('/colleges/')) {
      const slug = pathname.replace('/colleges/', '').replace(/\/+$/, '');
      return <InstitutionDetailPage slug={slug} navigate={navigate} />;
    }
    if (pathname.startsWith('/universities/')) {
      const slug = pathname.replace('/universities/', '').replace(/\/+$/, '');
      return <InstitutionDetailPage slug={slug} navigate={navigate} />;
    }
    if (pathname === '/counselling')
      return <CounsellingPage navigate={navigate} />;
    if (pathname.startsWith('/counselling/')) {
      const slug = pathname.replace('/counselling/', '').replace(/\/+$/, '');
      return <CounsellingPage navigate={navigate} slug={slug} />;
    }
    if (pathname === '/jobs')
      return <JobsPage navigate={navigate} initialSearch={search} />;
    if (pathname.startsWith('/jobs/')) {
      const slug = pathname.replace('/jobs/', '').replace(/\/+$/, '');
      return <JobDetailPage slug={slug} navigate={navigate} />;
    }
    if (pathname === '/opportunities') return <OpportunityFinderPage navigate={navigate} />;
    if (pathname === '/learning') return <LearningStudioPage navigate={navigate} />;
    if (pathname === '/tools') return <ToolsHubPage navigate={navigate} />;
    if (pathname === '/scam-alerts') return <ScamAlertsPage navigate={navigate} />;
    if (pathname === '/states')
      return <StatesHubPage navigate={navigate} initialSearch={search} />;
    if (pathname === '/community') return <CommunityPage navigate={navigate} />;
    if (pathname === '/scholarships')
      return <ScholarshipsPage navigate={navigate} initialSearch={search} />;
    if (pathname.startsWith('/scholarships/')) {
      const slug = pathname.replace('/scholarships/', '').replace(/\/+$/, '');
      return <ScholarshipDetailPage slug={slug} navigate={navigate} />;
    }
    if (pathname === '/dashboard') return <StudentDashboardPage navigate={navigate} />;
    if (pathname === '/profile') return <ProfilePage navigate={navigate} />;
    if (pathname === '/admin') return <AdminDashboardPage navigate={navigate} />;
    if (pathname === '/about') return <AboutPage section="about" navigate={navigate} />;
    if (pathname === '/contact') return <AboutPage section="contact" navigate={navigate} />;
    if (pathname === '/privacy') return <PolicyPage type="privacy" navigate={navigate} />;
    if (pathname === '/terms') return <PolicyPage type="terms" navigate={navigate} />;
    if (pathname === '/disclaimer') return <PolicyPage type="disclaimer" navigate={navigate} />;

    return <HomePage navigate={navigate} />;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F3] text-[#0B192C]">
      <Navbar
        currentPath={pathname}
        navigate={navigate}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {dbUser && !dbUser.onboardingCompleted && pathname !== '/profile' && (
        <div className="border-b border-[#E9D2B5] bg-[#FDF6EC]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 text-xs text-[#5C2E09]">
            <span>
              Complete your profile (state, education level, marks, family income) to unlock
              rule-based scholarship eligibility matching.
            </span>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="font-semibold text-[#134E7A] underline underline-offset-4 hover:text-[#0D3B5E] whitespace-nowrap"
            >
              Complete Profile
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={pathname}>{renderPage()}</PageTransition>
        </AnimatePresence>
      </main>

      <Footer navigate={navigate} />
      <AuthGateModal />

      {searchModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quick directory search"
          onClick={() => setSearchModalOpen(false)}
          className="fixed inset-0 z-50 flex items-start justify-center bg-[#0B192C]/55 px-4 pt-16 backdrop-blur-[2px]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-enter w-full max-w-2xl rounded-lg border border-[#D6CFC2] bg-[#FAF8F3] p-5 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-[#475467]">
                Quick Search · Press Esc to close
              </p>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                aria-label="Close search dialog"
                className="rounded-md p-1 text-[#5C6573] hover:bg-[#EAE4D7] hover:text-[#0B192C]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SpotlightSearch
              navigate={navigate}
              variant="modal"
              autoFocus
              onCloseModal={() => setSearchModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </LanguageProvider>
    </MotionConfig>
  );
}
