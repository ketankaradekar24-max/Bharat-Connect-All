const VISITOR_STORAGE_KEY = 'bc_anon_visitor_id';

function getAnonymousVisitorHash(): string {
  try {
    let existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!existing) {
      existing = `v_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
      window.localStorage.setItem(VISITOR_STORAGE_KEY, existing);
    }
    return existing;
  } catch {
    return 'v_ephemeral';
  }
}

export function trackAnalyticsEvent(
  eventType: 'page_view' | 'search' | 'portal_click' | 'guide_view',
  path: string,
  label?: string
): void {
  try {
    const visitorHash = getAnonymousVisitorHash();
    void fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        path: path.slice(0, 240),
        label: label ? label.slice(0, 240) : null,
        visitorHash,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Non-blocking best-effort analytics
  }
}
