import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { isAuthenticated, clearAuthData, getToken } from "@/lib/auth";

interface DecodedToken {
  userId: string;
  name: string;
  email: string;
  type: string;
  iat: number;
  exp: number;
  sub: string;
  nbf?: number;
  iss?: string;
}

interface UseAuthOptions {
  requiredType?: "stu" | "fac";
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { requiredType, redirectTo = "/login" } = options;
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated()) {
      clearAuthData();
      router.push(`${redirectTo}?expired=true`);
      setIsChecking(false);
      return;
    }

    const token = getToken();
    if (!token) {
      router.push(redirectTo);
      setIsChecking(false);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Check if user type matches required type
      if (requiredType && decoded.type !== requiredType) {
        router.push("/login");
        setIsChecking(false);
        return;
      }

      setUser(decoded);
      setIsChecking(false);
    } catch (error) {
      console.error("Error decoding token:", error);
      clearAuthData();
      router.push(redirectTo);
      setIsChecking(false);
    }
  }, [requiredType, redirectTo, router]);

  return { user, isChecking, isAuthenticated: !!user };
}
