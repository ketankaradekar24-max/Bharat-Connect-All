import { useState, type FormEvent } from 'react';
import { CheckCircle2, Flag, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiFetch } from '../lib/api.ts';
import { Alert } from './ui/Alert.tsx';
import { Button } from './ui/Button.tsx';

export interface ReportIssueButtonProps {
  entityType:
    | 'exam'
    | 'job'
    | 'service'
    | 'scholarship'
    | 'institution'
    | 'counselling'
    | 'scam'
    | 'general';
  entitySlug?: string;
  entityTitle: string;
  defaultUrl?: string;
  compact?: boolean;
}

export function ReportIssueButton({
  entityType,
  entitySlug,
  entityTitle,
  defaultUrl = '',
  compact = false,
}: ReportIssueButtonProps) {
  const { dbUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState<
    'broken_link' | 'outdated_info' | 'incorrect_fee' | 'scam_alert' | 'other'
  >('outdated_info');
  const [reportedUrl, setReportedUrl] = useState(defaultUrl);
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState(dbUser?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSubmittedMessage(null);
    try {
      const res = await apiFetch<{ message: string }>('/api/reports/content', {
        method: 'POST',
        body: JSON.stringify({
          entityType,
          entitySlug: entitySlug ?? null,
          entityTitle,
          reportType,
          reportedUrl: reportedUrl.trim() || null,
          description: description.trim(),
          contactEmail: contactEmail.trim() || '',
        }),
      });
      setSubmittedMessage(res.message);
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
          setSubmittedMessage(null);
        }}
        className={`inline-flex items-center gap-1.5 font-medium text-[#5C6573] hover:text-[#C46316] transition-colors ${
          compact ? 'text-xs' : 'rounded-lg border border-[#D6CFC2] bg-[#FAF8F3] px-3 py-1.5 text-xs'
        }`}
      >
        <Flag className="h-3.5 w-3.5 shrink-0" />
        <span>Report incorrect info or broken link</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Report incorrect information or broken link"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B192C]/55 p-4 backdrop-blur-[2px]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-enter w-full max-w-lg rounded-lg border border-[#D6CFC2] bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#EFECE3] pb-3">
              <div>
                <p className="text-xs font-semibold text-[#C46316]">Verification Feedback</p>
                <h2 className="font-display text-lg font-bold text-[#0B192C]">
                  Report Outdated Info, Fee Change or Broken Link
                </h2>
                <p className="text-xs text-[#5C6573] mt-0.5 line-clamp-1">{entityTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close report dialog"
                className="rounded-md p-1 text-[#5C6573] hover:bg-[#F3EFE6] hover:text-[#0B192C]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submittedMessage ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 rounded-lg border border-[#0E6B6E]/30 bg-[#EEF7F6] p-4 text-sm text-[#0B192C]">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0E6B6E] mt-0.5" />
                  <div>
                    <p className="font-semibold">Report logged for verification review</p>
                    <p className="text-xs text-[#4B5565] mt-1">{submittedMessage}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setOpen(false)}>Close</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {error && <Alert variant="error">{error}</Alert>}

                <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
                  <span>Issue Category *</span>
                  <select
                    value={reportType}
                    onChange={(e) =>
                      setReportType(
                        e.target.value as
                          | 'broken_link'
                          | 'outdated_info'
                          | 'incorrect_fee'
                          | 'scam_alert'
                          | 'other'
                      )
                    }
                    className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
                  >
                    <option value="broken_link">Broken or unreachable official URL</option>
                    <option value="outdated_info">Outdated dates, cycle, or rules</option>
                    <option value="incorrect_fee">Fee schedule or eligibility needs update</option>
                    <option value="scam_alert">Suspicious / lookalike website warning</option>
                    <option value="other">Other accuracy issue</option>
                  </select>
                </label>

                <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
                  <span>Affected URL (Optional)</span>
                  <input
                    type="text"
                    value={reportedUrl}
                    onChange={(e) => setReportedUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C] font-mono"
                  />
                </label>

                <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
                  <span>What needs correction or verification? *</span>
                  <textarea
                    required
                    minLength={10}
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share the official circular link, updated fee, or broken link behavior..."
                    className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
                  />
                </label>

                <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
                  <span>Contact Email (Optional — only if you want follow-up)</span>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
                  />
                </label>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EFECE3]">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Verification Report'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
