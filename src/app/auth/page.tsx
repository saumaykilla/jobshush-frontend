"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Shield,
  CheckCircle,
  Loader2,
  Zap,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import excelify from "/public/excelify.png";

import { signInWithRedirect } from "aws-amplify/auth";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithRedirect({
      provider: "Google",
    });
  };
  const benefits = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "AI Resume & Cover Letters",
      description: "Generate optimized applications in seconds",
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Smart Job Discovery",
      description: "Find opportunities matched to your skills",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Mock Interview Practice",
      description: "Prepare with realistic AI interviews",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Benefits */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block space-y-12"
        >
          {/* Logo */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center overflow-hidden">
                <Image
                  src={excelify}
                  alt="Excelify"
                  fill
                  priority
                  unoptimized
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl tracking-tight">ExcelifyAI</h1>
                <p className="text-secondary">Your AI Career Co-Pilot</p>
              </div>
            </div>

            <div>
              <h2 className="text-5xl mb-4 tracking-tight leading-[1.1]">
                Welcome back to your career journey
              </h2>
              <p className="text-xl text-secondary leading-relaxed">
                Sign in to access your personalized AI tools and continue
                building your path to success.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="text-lg text-secondary">
              What&apos;s waiting for you:
            </h3>
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + 0.1 * index, duration: 0.5 }}
                className="group"
              >
                <Card className="border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-300 hover:border-primary/30">
                  <CardContent className="px-6 py-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                        <div className="text-primary">{benefit.icon}</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="">{benefit.title}</h4>
                        <p className="text-sm text-secondary">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Authentication Form */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-md mx-auto"
        >
          <Card>
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <div className="relative w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center overflow-hidden">
                    <Image
                      src={excelify}
                      alt="Excelify"
                      fill
                      priority
                      unoptimized
                      className="object-contain"
                    />
                  </div>{" "}
                </div>
                <span className="text-2xl">Welcome to Excelify</span>
              </CardTitle>
              <CardDescription>
                Sign in with Google to access your AI-powered career tools
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base"
                >
                  {isLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isLoading ? "Signing in..." : "Continue with Google"}
                </Button>
              </div>

              <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground/80">resume & cover letter generations</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground/80">AI-powered interview prep</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground/80">Job application tracking</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground/80">Privacy-first data handling</span>
                  </div>
                </div>

              <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">Secure & Private</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  We use Google OAuth for secure authentication. Your data is
                  encrypted and never sold to third parties.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-muted-foreground">
            <p className=" text-[10px]">
              By signing in, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
