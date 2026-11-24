import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { and, eq } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  counsellingGuides,
  exams,
  institutions,
  jobs,
  publicServices,
  scholarships,
} from './src/db/schema.ts';
import adminRoutes from './src/server/routes/admin.ts';
import authRoutes from './src/server/routes/auth.ts';
import communityRoutes from './src/server/routes/community.ts';
import counsellingRoutes from './src/server/routes/counselling.ts';
import examsRoutes from './src/server/routes/exams.ts';
import institutionsRoutes from './src/server/routes/institutions.ts';
import jobsRoutes from './src/server/routes/jobs.ts';
import platformRoutes from './src/server/routes/platform.ts';
import profileRoutes from './src/server/routes/profile.ts';
import publicRoutes, { initBaselineOnce } from './src/server/routes/public.ts';
import scholarshipRoutes from './src/server/routes/scholarships.ts';
import servicesRoutes from './src/server/routes/services.ts';
import studentRoutes from './src/server/routes/student.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: false,
  })
);

app.use(express.json({ limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a few minutes and try again.' },
});

app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bharat-connect' });
});

app.get('/robots.txt', (req, res) => {
  const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /dashboard',
      'Disallow: /profile',
      'Disallow: /api/',
      `Sitemap: ${origin.replace(/\/+$/, '')}/sitemap.xml`,
    ].join('\n')
  );
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    await initBaselineOnce();
    const origin = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(
      /\/+$/,
      ''
    );

    const [examSlugs, instSlugs, counselSlugs, schSlugs, svcSlugs, jobSlugs] = await Promise.all([
      db
        .select({ slug: exams.slug, updatedAt: exams.updatedAt })
        .from(exams)
        .where(and(eq(exams.verificationStatus, 'verified'), eq(exams.publishStatus, 'published'))),
      db
        .select({ slug: institutions.slug, updatedAt: institutions.updatedAt })
        .from(institutions)
        .where(
          and(
            eq(institutions.verificationStatus, 'verified'),
            eq(institutions.publishStatus, 'published')
          )
        ),
      db
        .select({ slug: counsellingGuides.slug, updatedAt: counsellingGuides.updatedAt })
        .from(counsellingGuides)
        .where(
          and(
            eq(counsellingGuides.verificationStatus, 'verified'),
            eq(counsellingGuides.publishStatus, 'published')
          )
        ),
      db
        .select({ slug: scholarships.slug, updatedAt: scholarships.updatedAt })
        .from(scholarships)
        .where(
          and(
            eq(scholarships.verificationStatus, 'verified'),
            eq(scholarships.publishStatus, 'published')
          )
        ),
      db
        .select({ slug: publicServices.slug, updatedAt: publicServices.updatedAt })
        .from(publicServices)
        .where(
          and(
            eq(publicServices.verificationStatus, 'verified'),
            eq(publicServices.publishStatus, 'published')
          )
        ),
      db
        .select({ slug: jobs.slug, updatedAt: jobs.updatedAt })
        .from(jobs)
        .where(and(eq(jobs.verificationStatus, 'verified'), eq(jobs.publishStatus, 'published'))),
    ]);

    const staticPaths = [
      '/',
      '/exams',
      '/colleges',
      '/counselling',
      '/services',
      '/scholarships',
      '/jobs',
      '/opportunities',
      '/learning',
      '/tools',
      '/scam-alerts',
      '/states',
      '/community',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      '/disclaimer',
    ];

    const escapeXml = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const urlEntries = [
      ...staticPaths.map((p) => ({
        loc: `${origin}${p}`,
        lastmod: new Date().toISOString().split('T')[0],
      })),
      ...examSlugs.map((r) => ({
        loc: `${origin}/exams/${r.slug}`,
        lastmod: r.updatedAt.toISOString().split('T')[0],
      })),
      ...instSlugs.map((r) => ({
        loc: `${origin}/colleges/${r.slug}`,
        lastmod: r.updatedAt.toISOString().split('T')[0],
      })),
      ...counselSlugs.map((r) => ({
        loc: `${origin}/counselling/${r.slug}`,
        lastmod: r.updatedAt.toISOString().split('T')[0],
      })),
      ...schSlugs.map((r) => ({
        loc: `${origin}/scholarships/${r.slug}`,
        lastmod: r.updatedAt.toISOString().split('T')[0],
      })),
      ...svcSlugs.map((r) => ({
        loc: `${origin}/services/${r.slug}`,
        lastmod: r.updatedAt.toISOString().split('T')[0],
      })),
      ...jobSlugs.map((r) => ({
        loc: `${origin}/jobs/${r.slug}`,
        lastmod: r.updatedAt.toISOString().split('T')[0],
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries
      .map(
        (u) =>
          `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`
      )
      .join('\n')}\n</urlset>`;

    res.type('application/xml').send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).type('text/plain').send('Unable to generate sitemap.');
  }
});

app.use('/api', publicRoutes);
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', scholarshipRoutes);
app.use('/api', servicesRoutes);
app.use('/api', examsRoutes);
app.use('/api', institutionsRoutes);
app.use('/api', counsellingRoutes);
app.use('/api', jobsRoutes);
app.use('/api', communityRoutes);
app.use('/api', studentRoutes);
app.use('/api', platformRoutes);
app.use('/api', adminRoutes);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bharat Connect server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start Bharat Connect server:', error);
  process.exit(1);
});
