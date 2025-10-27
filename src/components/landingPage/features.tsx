import { BarChart3, FileText, MessageSquare, Search } from "lucide-react";
import React from "react";
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useScroll } from 'framer-motion';
import { useTransform } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Image from "next/image";
const FeatureRow =({ 
    feature, 
    index, 
    isEven 
  }: { 
    feature: {
        icon: React.ReactNode;
        title: string;
        description: string;
        image: string;
        highlights: string[];
    }; 
    index: number; 
    isEven: boolean;
  }) =>{
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", "end start"]
    });
  
    const imageY = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const textY = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  
    return (
      <div ref={ref} className="relative">
        <motion.div 
          style={{ opacity }}
          className={`grid lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}
        >
          {/* Text Content */}
          <motion.div 
            style={{ y: textY }}
            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`${!isEven ? 'lg:order-2' : ''}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <div className="text-primary">
                {feature.icon}
              </div>
              <span className="text-sm text-primary">Feature {index + 1}</span>
            </div>
            
            <h3 className="text-3xl lg:text-4xl mb-4 tracking-tight">
              {feature.title}
            </h3>
            <p className="text-lg text-secondary leading-relaxed mb-6">
              {feature.description}
            </p>
            
            <div className="space-y-3">
              {feature.highlights.map((highlight: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground/80">{highlight}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
  
          {/* Image Content */}
          <motion.div 
            style={{ y: imageY, scale }}
            initial={{ opacity: 0, x: isEven ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={`relative ${!isEven ? 'lg:order-1' : ''}`}
          >
            <div className="relative rounded-3xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-secondary/10 z-10"></div>
              
              {/* Image */}
              <div className="relative aspect-4/3 overflow-hidden">
                <img
                
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              </div>

            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }
  

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "AI Resume & Cover Letter Generator",
      description: "Create ATS-optimized resumes and personalized cover letters in minutes. Our AI analyzes job descriptions and tailors your application perfectly.",
      image: "https://images.unsplash.com/photo-1587116987928-21e47bd76cd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN1bWUlMjBkb2N1bWVudCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjE0NDczMDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      highlights: ["ATS Score 90%+", "Keyword Optimization", "Multiple Templates"]
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Job Discovery",
      description: "Find opportunities that match your skills and goals. Our AI scans thousands of postings and surfaces the best fits for your career path.",
      image: "https://images.unsplash.com/photo-1686984096026-23d6e82f9749?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2IlMjBzZWFyY2glMjBsYXB0b3B8ZW58MXx8fHwxNzYxNDU1OTA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      highlights: ["Smart Matching", "Auto-Apply", "Real-time Alerts"]
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "AI Mock Interviews",
      description: "Practice with realistic AI-powered interviews. Get instant feedback on your answers and improve your performance before the real thing.",
      image: "https://images.unsplash.com/photo-1686771416282-3888ddaf249b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcnZpZXclMjBidXNpbmVzcyUyMG1lZXRpbmd8ZW58MXx8fHwxNzYxNDU1OTA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      highlights: ["Role-specific Questions", "STAR Analysis", "Video Recording"]
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Progress Tracking",
      description: "Monitor your applications, track interview performance, and visualize your job search journey with comprehensive analytics.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjBkYXNoYm9hcmQlMjBzY3JlZW58ZW58MXx8fHwxNzYxMzc1NjEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      highlights: ["Pipeline Tracking", "Success Metrics", "Interview Stats"]
    }
  ];

const Features = () => {

  return (
    <section id="features" className="py-24 px-6 lg:px-12">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl mb-4 tracking-tight">
            Everything you need to get hired — faster.
          </h2>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            A complete suite of AI-powered tools designed to accelerate your job
            search
          </p>
        </motion.div>

        <div className="space-y-32">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;

            return (
              <FeatureRow
                key={index}
                feature={feature}
                index={index}
                isEven={isEven}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
