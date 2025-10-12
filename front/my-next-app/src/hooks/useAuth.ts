"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

type DecodedJwt = {
  user_id: string;
  role: string;
  exp: number;
};

export default function useAuth(requiredRole?: string) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setLoading(false);
      router.push("/login");
      return;
    }

    try {
      const decoded: DecodedJwt = jwtDecode(token);

      if (requiredRole && decoded.role !== requiredRole) {
        router.push("/unauthorized");
        return;
      }

      setAuthorized(true);
    } catch (error) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [mounted, requiredRole, router]);

  return { loading, authorized };
}
