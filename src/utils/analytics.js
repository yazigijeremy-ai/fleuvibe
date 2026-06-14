/** Stores analytics events in localStorage (max 500). */
export const trackEvent = (event, data = {}) => {
  try {
    const events = JSON.parse(localStorage.getItem('fv_analytics') || '[]');
    events.push({ event, ...data, t: Date.now() });
    if (events.length > 500) events.splice(0, events.length - 500);
    localStorage.setItem('fv_analytics', JSON.stringify(events));
  } catch {}
};

export const logger = {
  info:   (msg, ctx = {})      => { console.info(`[FleuVibe] ${msg}`, ctx);  trackEvent('log_info',  { msg, ...ctx }); },
  error:  (msg, err, ctx = {}) => { console.error(`[FleuVibe] ${msg}`, err, ctx); trackEvent('log_error', { msg, error: err?.message }); },
  warn:   (msg, ctx = {})      => { console.warn(`[FleuVibe] ${msg}`, ctx); },
  metric: (name, value, tags = {}) => { trackEvent(`metric_${name}`, { value, ...tags }); window._gtag?.('event', name, { value, ...tags }); },
};
