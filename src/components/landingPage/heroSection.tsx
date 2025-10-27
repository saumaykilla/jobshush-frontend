"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, ChevronRight, FileText, MessageSquare, Play, Search } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const HeroSection = () => {
    const router = useRouter();
  return (
<section className="pt-32 pb-20 px-2 lg:px-12 relative">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl text-center lg:text-6xl mb-6 tracking-tight leading-[1.1]">
                Your AI Career Co-Pilot From Resume to Job Offer
              </h1>
              <p className="text-lg lg:text-xl text-secondary text-center mb-8 leading-relaxed max-w-xl">
                Build tailored resumes and cover letters, discover top job opportunities, and prepare with realistic AI mock interviews, all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={()=>router.push("/auth")}
                  size="lg"
                  className="bg-primary text-background hover:bg-primary/90 rounded-full h-14 px-8 text-base"
                >
                  Get Early Access
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-secondary/30 hover:bg-secondary/10 rounded-full h-14 px-8 text-base text-secondary"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden border border-border/50 bg-linear-to-br from-card to-card/50 p-8 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-background/50 rounded-2xl border border-border/30">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-secondary/20 rounded w-32 mb-2"></div>
                      <div className="h-2 bg-secondary/10 rounded w-24"></div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-background" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-background/50 rounded-2xl border border-border/30">
                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                      <Search className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-secondary/20 rounded w-40 mb-2"></div>
                      <div className="h-2 bg-secondary/10 rounded w-20"></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/30">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-primary/30 rounded w-36 mb-2"></div>
                      <div className="h-2 bg-primary/20 rounded w-28"></div>
                    </div>
                    <div className="text-xs text-primary">In Progress</div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-linear-to-br from-primary/30 to-transparent blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-linear-to-br from-secondary/20 to-transparent blur-3xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
  );
};

export default HeroSection;
