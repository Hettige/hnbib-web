// ─────────────────────────────────────────────────────────────
// Strapi Cloud data layer
// All fetch calls happen at build time (SSG).
// ─────────────────────────────────────────────────────────────

const STRAPI = import.meta.env.STRAPI_URL ?? 'https://dazzling-virtue-5cf576a094.strapiapp.com';
const TOKEN  = import.meta.env.STRAPI_TOKEN ?? '';

const authHeader: Record<string, string> = TOKEN
  ? { Authorization: `Bearer ${TOKEN}` }
  : {};

async function get<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${STRAPI}/api${path}`, { headers: authHeader });
  if (!res.ok) {
    throw new Error(`Strapi ${res.status} at ${path}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────

export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText: string | null;
  width?: number;
  height?: number;
  formats?: Record<string, { url: string; width: number; height: number }>;
}

export interface Service {
  id: number;
  documentId: string;
  name: string;
  tagline: string;
  description: string;
  pageUrl: string;
  displayOrder: number;
  isActive: boolean;
  coverImage: StrapiMedia | null;
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  category: 'Market Commentary' | 'Corporate Finance' | 'Partnership' | 'Company News';
  excerpt: string;
  body: unknown[] | null;
  featuredImage: StrapiMedia | null;
  publishDate: string;
  readTime: string | null;
  publishedAt: string;
}

export interface TeamMember {
  id: number;
  documentId: string;
  name: string;
  role: string;
  department: string;
  photo: StrapiMedia | null;
  bio: string | null;
  linkedIn: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface Rate {
  id: number;
  documentId: string;
  instrument: 'Repo' | 'T-Bill' | 'T-Bond';
  tenor: string;
  rate: number;
  effectiveDate: string;
  notes: string | null;
  isActive: boolean;
}

export interface Partner {
  id: number;
  documentId: string;
  name: string;
  logo: StrapiMedia | null;
  website: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface Deal {
  id: number;
  documentId: string;
  client: string;
  dealType: string;
  amountLabel: string;
  amountValue: number | null;
  year: number;
  description: string | null;
  role: string | null;
  clientLogo: StrapiMedia | null;
  isFeatured: boolean;
  displayOrder: number;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  regulatedBy: string;
  cseStatus: string;
  cbslStatus: string;
  established: number;
  linkedIn: string | null;
  facebook: string | null;
  footerCopyright: string;
}

// ── Fetch helpers ─────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  const r = await get<{ data: Service[] }>(
    '/services?populate=coverImage&sort=displayOrder&filters[isActive][$eq]=true'
  );
  return r.data;
}

export async function getArticles(opts?: { limit?: number; category?: string }): Promise<Article[]> {
  let q = '/articles?populate=featuredImage&sort=publishDate:desc&status=published';
  if (opts?.limit) q += `&pagination[limit]=${opts.limit}`;
  if (opts?.category) q += `&filters[category][$eq]=${encodeURIComponent(opts.category)}`;
  const r = await get<{ data: Article[] }>(q);
  return r.data;
}

export async function getArticle(slug: string): Promise<Article | null> {
  const r = await get<{ data: Article[] }>(
    `/articles?populate=*&filters[slug][$eq]=${encodeURIComponent(slug)}&status=published`
  );
  return r.data?.[0] ?? null;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const r = await get<{ data: TeamMember[] }>(
    '/team-members?populate=photo&sort=displayOrder&filters[isActive][$eq]=true'
  );
  return r.data;
}

export async function getRates(): Promise<Rate[]> {
  const r = await get<{ data: Rate[] }>(
    '/rates?filters[isActive][$eq]=true&sort[0]=instrument&sort[1]=tenor'
  );
  return r.data;
}

export async function getPartners(): Promise<Partner[]> {
  const r = await get<{ data: Partner[] }>(
    '/partners?populate=logo&sort=displayOrder&filters[isActive][$eq]=true'
  );
  return r.data;
}

export async function getDeals(opts?: { featured?: boolean }): Promise<Deal[]> {
  let q = '/deals?populate=clientLogo&sort=displayOrder';
  if (opts?.featured) q += '&filters[isFeatured][$eq]=true';
  const r = await get<{ data: Deal[] }>(q);
  return r.data;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const r = await get<{ data: SiteSettings }>('/global');
    return r.data;
  } catch {
    return null;
  }
}

// ── Utility ───────────────────────────────────────────────────

/** Format YYYY-MM-DD → "21 May 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

/** Return thumbnail URL if available, else full URL */
export function imgUrl(media: StrapiMedia | null | undefined, size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'): string {
  if (!media) return '';
  return media.formats?.[size]?.url ?? media.url;
}
