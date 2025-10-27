"use client";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HeroSection from "./heroSection";
import Features from "./features";
import { ChevronRight, Zap } from "lucide-react";
import excelify from '/public/excelify.png'
export function LandingPage() {
  const onSignIn = () => {
    router.push("/auth");
  };
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
                <h1 className="text-base lg:text-xl">ExcelifyAI</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onSignIn}>
                Sign In
              </Button>
              <Button
                onClick={onSignIn}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get Early Access
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <HeroSection />

      <section className="py-20 px-6 mx-auto lg:px-12 bg-linear-to-b from-card/30 to-background">
        <div className="max-w-[1000px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-5xl mb-6 tracking-tight">
              Job hunting shouldn&apos;t feel like a full time job.
            </h2>
            <p className="lext-lg lg:text-xl text-secondary leading-relaxed max-w-3xl mx-auto">
              Between tailoring resumes, searching through hundreds of listings,
              and preparing for interviews, landing your next role can be
              overwhelming. ExcelifyAI streamlines every step with intelligent
              AI assistance, so you can focus on what matters — putting your
              best foot forward.
            </p>
          </motion.div>
        </div>
      </section>
      <Features />
      <section className="py-32 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-card/50 to-background"></div>
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-secondary/5"></div>

        <div className="max-w-[900px] mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">
                Limited Early Access Spots
              </span>
            </div>

            <h2 className="text-5xl lg:text-6xl mb-6 tracking-tight">
              Be job-ready in days — not months.
            </h2>
            <p className="text-xl text-secondary mb-10 leading-relaxed max-w-2xl mx-auto">
              Join our waitlist today and get early access before launch. Be
              among the first to experience the future of AI-powered job search.
            </p>

            <Button
              onClick={onSignIn}
              size="lg"
              className="bg-primary text-background hover:bg-primary/90 rounded-full h-16 px-10 text-lg"
            >
              Join the Waitlist
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 border-t border-border/30">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-secondary">
              <a
                href="#about"
                className="hover:text-foreground transition-colors"
              >
                About
              </a>
              <a
                href="#faqs"
                className="hover:text-foreground transition-colors"
              >
                FAQs
              </a>
              <a
                href="#terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="#privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="#contact"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="text-center mt-8 text-sm text-secondary">
            © 2025 ExcelifyAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
