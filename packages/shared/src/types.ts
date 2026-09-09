/** API tipleri — Verno backend ile mobil uygulama arasında paylaşılır */

export type DbBrand = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  cover_url: string | null;
  about: string | null;
  website: string | null;
  category_id: string | null;
  verified: boolean;
  premium: boolean;
  rating: number | null;
  rating_count: number | null;
  total_complaints: number | null;
  complaints_resolved: number | null;
  resolution_rate: number | null;
};

export type DbComplaint = {
  id: string;
  public_id: string | null;
  short_id: string | null;
  title: string;
  body: string;
  status: string;
  rating: number | null;
  views: number;
  votes: number;
  created_at: string;
  brand_response: string | null;
  brand_response_at: string | null;
  brands?: { name: string; slug: string; logo_url: string | null; verified: boolean } | null;
  profiles?: { full_name: string | null; username: string | null; avatar_url: string | null } | null;
  comment_count?: number;
  user_supported?: boolean;
};

export type PlatformStats = {
  totalUsers: number;
  totalCompanies: number;
  totalComplaints: number;
  resolvedComplaints: number;
  resolutionRate: number;
};

export type MeResponse = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    emailVerified?: boolean;
  } | null;
  roles: string[];
};

/** Verno API varsayılan portu */
export const VERNO_DEV_PORT = 8080;
