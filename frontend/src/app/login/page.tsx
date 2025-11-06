"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginUser, resendVerification } from "@/api/api";
import { jwtDecode } from "jwt-decode";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { clearAuthData } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
});

type JWT = {
  type: string;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hasVerified = searchParams.get("verified") === "true";
    const hasExpired = searchParams.get("expired") === "true";

    if (hasVerified) {
      toast({
        title: "Email verified",
        description: "Your email has been verified successfully. You can now log in.",
        variant: "default",
        duration: 3000,
      });
      router.replace("/login", { scroll: false });
    }
    
    if (hasExpired) {
      // Clear any expired tokens from localStorage to prevent interceptor redirects
      clearAuthData();
      toast({
        title: "Session expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
        duration: 3000,
      });
      router.replace("/login", { scroll: false });
    }
  }, [searchParams, router, toast]);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    setIsLoading(true);
    
    try {
      const res = await loginUser(values);
      localStorage.setItem("token", res);
      const decoded: JWT = jwtDecode(res);

      toast({
        title: "Login successful",
        description: "Redirecting to your dashboard...",
        duration: 1500,
      });

      setTimeout(() => {
        if (decoded.type === "stu") {
          router.push("/student/");
        } else if (decoded.type === "fac") {
          router.push("/professor/");
        }
      }, 1000);
    } catch (error) {
      if (
        error.response?.status === 403 &&
        error.response?.data?.email_verified === false
      ) {
        // Email not verified - resend verification and redirect
        try {
          await resendVerification(values.email);
          toast({
            title: "Email not verified",
            description: "A new verification link has been sent to your email.",
            variant: "destructive",
            duration: 2000,
          });
          setTimeout(() => {
            router.push(
              `/verify-email?email=${encodeURIComponent(values.email)}`
            );
          }, 1500);
        } catch {
          toast({
            title: "Email not verified",
            description: "Please verify your email before logging in.",
            variant: "destructive",
            duration: 2000,
          });
          setTimeout(() => {
            router.push(
              `/verify-email?email=${encodeURIComponent(values.email)}`
            );
          }, 1500);
        }
      } else {
        // Show error as form error and toast
        const errorMsg = error.response?.data?.error || "Invalid email or password.";
        
        form.setError("root", {
          type: "manual",
          message: errorMsg,
        });

        toast({
          title: "Login failed",
          description: errorMsg,
          variant: "destructive",
          duration: 2000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="text-xl font-bold">FLS</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader>
            <CardTitle>Log in to your account</CardTitle>
            <CardDescription>Welcome back to FLS.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {form.formState.errors.root && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your password"
                          type="password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Log in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            <div className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
