"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import excelify from "../../public/excelify.png";

const Loading =
  ({
    message = "Loading your AI-powered career platform...",
  }: {
    message?: string;
  }) => {
    return (
      <div className="h-full w-full bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6">
          <motion.div
            animate={{
              rotate: 360,
              scale:
                [
                  1,
                  1.1,
                  1,
                ],
            }}
            transition={{
              rotate:
                {
                  duration: 2,
                  repeat:
                    Infinity,
                  ease: "linear",
                },
              scale:
                {
                  duration: 1,
                  repeat:
                    Infinity,
                  ease: "easeInOut",
                },
            }}
            className="relative w-16 h-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mx-auto"
          >
            <Image
              src={
                excelify
              }
              alt="Excelify"
              fill
              priority
              unoptimized
              className="object-contain"
            />
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
          >
            <h2 className="text-2xl mb-2">
              Excelify
            </h2>
            <p className="text-muted-foreground">
              {
                message
              }
            </p>
          </motion.div>

          <motion.div
            animate={{
              scaleX:
                [
                  0,
                  1,
                  0,
                ],
            }}
            transition={{
              duration: 1.5,
              repeat:
                Infinity,
              ease: "easeInOut",
            }}
            className="w-48 h-1 bg-primary/30 rounded-full mx-auto overflow-hidden"
          >
            <motion.div
              animate={{
                x: [
                  -100,
                  100,
                ],
              }}
              transition={{
                duration: 1,
                repeat:
                  Infinity,
                ease: "easeInOut",
              }}
              className="w-full h-full bg-primary rounded-full"
            />
          </motion.div>
        </div>
      </div>
    );
  };

export default Loading;
