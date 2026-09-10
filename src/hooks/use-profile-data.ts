import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { fromE164 } from "@/lib/phone";
import { dbStatusToUi } from "@/lib/complaint-status";
import { toast } from "sonner";
import type { UserBadgePayload } from "@/lib/server/user-badges";

export type Profile = {
  id: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
};

export type ProfileComplaint = {
  id: string;
  publicId: string | null;
  title: string;
  status: string;
  views: number;
  createdAt: string;
};

export type ProfileStats = {
  total: number;
  resolved: number;
  views: number;
  follows: number;
  supported: number;
  commented: number;
};

export function useProfileData() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [badges, setBadges] = useState<UserBadgePayload | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [phone, setPhone] = useState("");
  const [complaints, setComplaints] = useState<ProfileComplaint[]>([]);
  const [supported, setSupported] = useState<ProfileComplaint[]>([]);
  const [commented, setCommented] = useState<ProfileComplaint[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    total: 0,
    resolved: 0,
    views: 0,
    follows: 0,
    supported: 0,
    commented: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        const data = (await res.json()) as {
          profile: Profile | null;
          email: string;
          emailVerified: boolean;
          badges?: UserBadgePayload;
        };
        if (cancelled) return;

        if (data.profile) {
          setProfile(data.profile);
          setPhone(fromE164(data.profile.phone));
        }
        setEmail(data.email ?? "");
        setEmailVerified(!!data.emailVerified);
        if (data.badges) setBadges(data.badges);

        const [cres, sres, cmres] = await Promise.all([
          fetch("/api/me/complaints", { credentials: "include" }),
          fetch("/api/me/supported", { credentials: "include" }),
          fetch("/api/me/commented", { credentials: "include" }),
        ]);
        const cjson = (await cres.json()) as { complaints: ProfileComplaint[] };
        const sjson = (await sres.json()) as { complaints: ProfileComplaint[] };
        const cmjson = (await cmres.json()) as { complaints: ProfileComplaint[] };
        if (cancelled) return;

        const list = cjson.complaints ?? [];
        const sup = sjson.complaints ?? [];
        const com = cmjson.complaints ?? [];
        setComplaints(list);
        setSupported(sup);
        setCommented(com);
        setStats({
          total: list.length,
          resolved: list.filter((c) => dbStatusToUi(c.status) === "cozuldu").length,
          views: list.reduce((s, c) => s + (c.views ?? 0), 0),
          follows: 0,
          supported: sup.length,
          commented: com.length,
        });

        fetch("/api/me/follows", { credentials: "include" })
          .then((r) => (r.ok ? r.json() : { count: 0 }))
          .then((j: { count?: number }) => {
            if (!cancelled) setStats((s) => ({ ...s, follows: j.count ?? 0 }));
          })
          .catch(() => {});
      } catch {
        if (!cancelled) toast.error("Профилът не може да се зареди");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function logout() {
    await authClient.signOut();
    navigate({ to: "/" });
  }

  return {
    user,
    authLoading,
    profile,
    setProfile,
    email,
    emailVerified,
    badges,
    loaded,
    phone,
    setPhone,
    complaints,
    supported,
    commented,
    stats,
    logout,
  };
}
