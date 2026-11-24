import React, { createContext, useContext, useState } from 'react';
import type { SupportedLanguage } from '../types/index.ts';

interface UiCopy {
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  exploreServicesBtn: string;
  exploreScholarshipsBtn: string;
  searchPlaceholder: string;
  languageLabel: string;
  statePriorityLabel: string;
  stepOverview: string;
  stepWhoCanApply: string;
  stepEligibility: string;
  stepDocuments: string;
  stepProcess: string;
  stepFees: string;
  stepOfficialSite: string;
  stepAppointment: string;
  stepTracking: string;
  stepMistakes: string;
  stepFaqs: string;
  stepVerified: string;
}

const DICTIONARY: Record<SupportedLanguage, UiCopy> = {
  en: {
    tagline: 'Bharat Connect — Opportunities, Services and Guidance, All in One Place.',
    heroTitle: 'Everything You Need. Every Opportunity Within Reach.',
    heroSubtitle:
      'Discover verified scholarships, essential government services, passports, licences, schemes, exams, and official portals—all in plain language.',
    exploreServicesBtn: 'Explore Services',
    exploreScholarshipsBtn: 'Explore Scholarships',
    searchPlaceholder:
      'Search scholarships, driving licence, passport, visa, PAN, Karnataka certificates...',
    languageLabel: 'Language',
    statePriorityLabel: 'State Focus',
    stepOverview: '01. Service Overview',
    stepWhoCanApply: '02. Who Can Apply',
    stepEligibility: '03. Eligibility Requirements',
    stepDocuments: '04. Documents Required (Interactive Checklist)',
    stepProcess: '05. Step-by-Step Application Guide',
    stepFees: '06. Official Fees',
    stepOfficialSite: '07. Official Website & Source',
    stepAppointment: '08. Appointment Process',
    stepTracking: '09. Application Tracking Guidance',
    stepMistakes: '10. Common Mistakes to Avoid',
    stepFaqs: '11. Frequently Asked Questions',
    stepVerified: '12. Verification & Review Status',
  },
  kn: {
    tagline: 'ಭಾರತ್ ಕನೆಕ್ಟ್ — ಅವಕಾಶಗಳು, ಸೇವೆಗಳು ಮತ್ತು ಮಾರ್ಗದರ್ಶನ, ಒಂದೇ ವೇದಿಕೆಯಲ್ಲಿ.',
    heroTitle: 'ಅವಕಾಶಗಳು ಮತ್ತು ಅಗತ್ಯ ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳಿಗೆ ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಮಾರ್ಗದರ್ಶಿ.',
    heroSubtitle:
      'ಪರಿಶೀಲಿಸಿದ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು, ಚಾಲನಾ ಪರವಾನಗಿ, ಪಾಸ್‌ಪೋರ್ಟ್, ಪ್ಯಾನ್, ಕರ್ನಾಟಕ ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಅಧಿಕೃತ ಮಾಹಿತಿಯನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಪಡೆಯಿರಿ.',
    exploreServicesBtn: 'ಸೇವೆಗಳನ್ನು ನೋಡಿ',
    exploreScholarshipsBtn: 'ವಿದ್ಯಾರ್ಥಿವೇತನ ನೋಡಿ',
    searchPlaceholder:
      'ವಿದ್ಯಾರ್ಥಿವೇತನ, ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್, ಪಾಸ್‌ಪೋರ್ಟ್, ಜಾತಿ/ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಹುಡುಕಿ...',
    languageLabel: 'ಭಾಷೆ',
    statePriorityLabel: 'ರಾಜ್ಯ',
    stepOverview: '01. ಸೇವೆಯ ವಿವರ (Overview)',
    stepWhoCanApply: '02. ಯಾರು ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು',
    stepEligibility: '03. ಅರ್ಹತಾ ನಿಯಮಗಳು',
    stepDocuments: '04. ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳು (Checklist)',
    stepProcess: '05. ಹಂತ-ಹಂತದ ಅರ್ಜಿ ವಿಧಾನ',
    stepFees: '06. ಅಧಿಕೃತ ಶುಲ್ಕಗಳು',
    stepOfficialSite: '07. ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ಮತ್ತು ಮೂಲ',
    stepAppointment: '08. ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಪ್ರಕ್ರಿಯೆ',
    stepTracking: '09. ಅರ್ಜಿ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ',
    stepMistakes: '10. ತಪ್ಪಿಸಬೇಕಾದ ಸಾಮಾನ್ಯ ತಪ್ಪುಗಳು',
    stepFaqs: '11. ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು',
    stepVerified: '12. ಪರಿಶೀಲನಾ ದಿನಾಂಕ',
  },
  hi: {
    tagline: 'भारत कनेक्ट — अवसर, सेवाएं और मार्गदर्शन, एक ही स्थान पर।',
    heroTitle: 'अवसरों और आवश्यक जन सेवाओं के लिए आपका डिजिटल मार्गदर्शक।',
    heroSubtitle:
      'सत्यापित छात्रवृत्तियां, ड्राइविंग लाइसेंस, पासपोर्ट, पैन कार्ड, प्रमाण पत्र, सरकारी योजनाएं और परीक्षाओं की सरल व आधिकारिक जानकारी प्राप्त करें।',
    exploreServicesBtn: 'सेवाएं देखें',
    exploreScholarshipsBtn: 'छात्रवृत्तियां देखें',
    searchPlaceholder:
      'छात्रवृत्ति, ड्राइविंग लाइसेंस, पासपोर्ट, वीज़ा, पैन, प्रमाण पत्र खोजें...',
    languageLabel: 'भाषा',
    statePriorityLabel: 'राज्य',
    stepOverview: '01. सेवा का विवरण (Overview)',
    stepWhoCanApply: '02. कौन आवेदन कर सकता है',
    stepEligibility: '03. पात्रता मानदंड',
    stepDocuments: '04. आवश्यक दस्तावेज़ (Checklist)',
    stepProcess: '05. चरण-दर-चरण आवेदन प्रक्रिया',
    stepFees: '06. आधिकारिक शुल्क',
    stepOfficialSite: '07. आधिकारिक वेबसाइट और स्रोत',
    stepAppointment: '08. अपॉइंटमेंट प्रक्रिया',
    stepTracking: '09. आवेदन स्थिति जांचने का तरीका',
    stepMistakes: '10. सामान्य गलतियाँ जिनसे बचें',
    stepFaqs: '11. अक्सर पूछे जाने वाले प्रश्न',
    stepVerified: '12. सत्यापन स्थिति',
  },
};

interface LanguageContextValue {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  t: UiCopy;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<SupportedLanguage>('en');

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: DICTIONARY[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return ctx;
}
