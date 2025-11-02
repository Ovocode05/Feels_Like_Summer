"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, BookOpen, Loader2, CheckCircle2 } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { registerUser, sendVerificationCode, verifyCode } from "@/api/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

const registerFormSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
    type: z.enum(["stu", "fac"], {
      required_error: "You need to select a type.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("type") || "stu";

  const [step, setStep] = useState<"register" | "verify">("register");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const form = useForm<FormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      type: defaultRole as "stu" | "fac",
    },
  });

  async function onSubmit(values: FormData) {
    const { confirmPassword, ...rest } = values;
    setIsSubmitting(true);
    setError("");

    try {
      // Step 1: Register the user
      await registerUser(rest);
      setRegisteredEmail(rest.email);
      
      // Step 2: Send verification code
      await sendVerificationCode(rest.email);
      
      // Move to verification step
      setStep("verify");
      startCountdown();
    } catch (error: any) {
      console.error("Registration failed:", error);
      setError(error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus to next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    
    if (pastedData.length > 0) {
      const newCode = [...verificationCode];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newCode[i] = pastedData[i];
      }
      setVerificationCode(newCode);
      
      // Focus on the next empty input or the last input
      const nextIndex = Math.min(pastedData.length, 5);
      document.getElementById(`code-${nextIndex}`)?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      await verifyCode(registeredEmail, code);
      // Show success and redirect to login
      router.push("/login?verified=true");
    } catch (error: any) {
      console.error("Verification failed:", error);
      setError(error.response?.data?.error || "Invalid verification code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsSendingCode(true);
    setError("");

    try {
      await sendVerificationCode(registeredEmail);
      setVerificationCode(["", "", "", "", "", ""]);
      startCountdown();
    } catch (error: any) {
      console.error("Failed to resend code:", error);
      setError(error.response?.data?.error || "Failed to resend code. Please try again.");
    } finally {
      setIsSendingCode(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="text-xl font-bold">ResearchConnect</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader>
            <CardTitle>
              {step === "register" ? "Create an account" : "Verify your email"}
            </CardTitle>
            <CardDescription className="pt-2">
              {step === "register" 
                ? "Join ResearchConnect to find research opportunities and collaborators."
                : `Enter the 6-digit code sent to ${registeredEmail}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "register" ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          We will send a verification code to this email.
                        </FormDescription>
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
                            placeholder="Create a password"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Confirm your password"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Account Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="stu" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Student
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="fac" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Professor
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-4 text-center">
                    Verification Code
                  </label>
                  <div className="flex gap-2 justify-center">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        maxLength={1}
                        className="h-12 w-12 text-center text-xl font-semibold rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        disabled={isVerifying}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleVerifyCode}
                  className="w-full"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verify Email
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={countdown > 0 || isSendingCode}
                  >
                    {isSendingCode
                      ? "Sending..."
                      : countdown > 0
                      ? `Resend (${countdown}s)`
                      : "Resend"}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("register");
                      setError("");
                      setVerificationCode(["", "", "", "", "", ""]);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Back to registration
                  </button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary underline-offset-4 hover:underline"
              >
                Log in
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
