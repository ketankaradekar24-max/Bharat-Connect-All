import { ExamDetailTemplate } from '../components/ExamDetailTemplate.tsx';

interface ExamDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export function ExamDetailPage({ slug, navigate }: ExamDetailPageProps) {
  return <ExamDetailTemplate slug={slug} navigate={navigate} />;
}
