"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  fetchAuthSession,
  fetchUserAttributes,
  updateUserAttributes,
} from "aws-amplify/auth";
import { motion } from "framer-motion";
import axios from "axios";
import { useProfileStore } from "@/store/profileStore";
import Image from "next/image";
import excelify from "../../../../public/excelify.png";
export default function AuthCallback() {
  const router =
    useRouter();

  useEffect(() => {
    handleAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuthCallback =
    async () => {
      try {
        await new Promise(
          (
            resolve
          ) =>
            setTimeout(
              resolve,
              1000
            )
        );

        await fetchAuthSession(
          {
            forceRefresh: true,
          }
        );

        // Fetch user attributes
        const attributes =
          await fetchUserAttributes();

        // Check if isOnboarded attribute exists
        if (
          !attributes[
            "custom:isOnboarded"
          ]
        ) {
          // First time login - set to false
          await updateUserAttributes(
            {
              userAttributes:
                {
                  "custom:isOnboarded":
                    "false",
                },
            }
          );

          console.log(
            "First time user - redirecting to onboarding"
          );
          router.push(
            "/onboarding"
          );
        } else if (
          attributes[
            "custom:isOnboarded"
          ] ===
          "false"
        ) {
          console.log(
            "User not onboarded - redirecting to onboarding"
          );
          router.push(
            "/onboarding"
          );
        } else {
          const response =
            await axios.get(
              "/api/profile"
            );
          useProfileStore.setState(
            {
              profileID:
                response
                  .data
                  .data
                  ?.profileID,
              profile:
                response
                  .data
                  .data
                  ?.resume,
              optimizationLimit:
                response
                  .data
                  .data
                  ?.optimizationLimit,
            }
          );
          console.log(
            "User onboarded - redirecting to dashboard"
          );
          router.push(
            "/dashboard"
          );
        }
      } catch (error) {
        console.error(
          "Error in auth callback:",
          error
        );
        router.push(
          "/auth"
        );
      }
    };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
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
            Loading
            your
            AI-powered
            career
            platform...
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
}
