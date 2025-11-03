"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "../components/ui/sidebar";

import {
  FileText,
  Loader2,
  User2Icon,
  VideoIcon,
} from "lucide-react";

import Image from "next/image";

import {
  usePathname,
  useRouter,
} from "next/navigation";
import Link from "next/link";
import { Progress } from "./ui/progress";
import { UserAttributeKey } from "aws-amplify/auth";
import { signOut } from "aws-amplify/auth";

import { useProfileStore } from "@/store/profileStore";

export default function Navbar({
  user,
}: {
  user: Partial<
    Record<
      UserAttributeKey,
      string
    >
  >;
}) {
  const router =
    useRouter();
  const optimizationCount =
    useProfileStore.getState()
      .optimizationLimit;

  const [
    ,
    setIsMobileMenuOpen,
  ] =
    useState(
      false
    );
  const [
    signingOut,
    setSigningOut,
  ] =
    useState(
      false
    );

  const handleSignOut =
    async () => {
      setSigningOut(
        true
      );
      await signOut();
      router.refresh();
    };

  const handleLogout =
    () => {
      handleSignOut();
      setIsMobileMenuOpen(
        false
      );
    };

  return (
    <Sidebar className="border-r border-border/50">
      {" "}
      {/* Logo Section */}
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center overflow-hidden">
            <Image
              src={
                "/excelify.png"
              }
              alt="Excelify"
              fill
              priority
              unoptimized
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-semibold">
              Excelify
            </h1>
            <p className="text-xs text-muted-foreground">
              AI-Powered
              Career
              Platform
            </p>
          </div>
        </div>

        {/* Welcome Section */}
        {user && (
          <div className="mt-3 p-2 bg-card/50 rounded-lg">
            <p className="text-sm">
              Welcome
              back,{" "}
              {user?.given_name ||
                "Google User"}
              !
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email ||
                "user@gmail.com"}
            </p>
          </div>
        )}
      </SidebarHeader>
      {/* Daily Usage Section */}
      <SidebarContent className="p-4 ">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">
              Daily
              Usage
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">
                    Optimizations
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {100 -
                    (optimizationCount ||
                      0)}
                  /100
                </span>
              </div>

              <Progress
                value={
                  100 -
                  (optimizationCount ||
                    0)
                }
                className="h-2"
                aria-label={`$Optimization: ${
                  100 -
                  (optimizationCount ||
                    0)
                } of 100 used`}
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {optimizationCount ||
                    0}{" "}
                  remaining
                </span>
                <span>
                  This
                  Week
                </span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-border/50">
            <h3 className="text-sm font-medium mb-3">
              Quick
              Actions
            </h3>
            <div className="flex w-full min-w-0 flex-col gap-1">
              <div className="group/menu-item relative">
                <Link
                  href="/dashboard"
                  className={`${
                    usePathname() ===
                    "/dashboard"
                      ? "bg-sidebar-accent"
                      : ""
                  }  peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 `}
                >
                  <FileText className="w-4 h-4" />
                  Applications
                </Link>
              </div>
              <div className="group/menu-item relative">
                <Link
                  href="/mock-interview"
                  className={`${
                    usePathname() ===
                    "/mock-interview"
                      ? "bg-sidebar-accent"
                      : ""
                  }  peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 `}
                >
                  <VideoIcon className="w-4 h-4" />
                  Mock
                  Interview
                </Link>
              </div>
              <div className="group/menu-item relative">
                <Link
                  href="/profile"
                  className={`${
                    usePathname() ===
                    "/profile"
                      ? "bg-sidebar-accent"
                      : ""
                  }  peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 `}
                >
                  <User2Icon className="w-4 h-4" />
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={
              handleLogout
            }
            className="w-full text-xs"
          >
            {signingOut
              ? "Signing Out..."
              : "Sign Out"}
            {signingOut && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
