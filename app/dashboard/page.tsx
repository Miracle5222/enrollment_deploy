"use client";

import { DashboardNavbar } from "@/components/component/dashbaord-navbar";
import { LensDemo } from "@/components/component/lens";
import { StickyScrollRevealDemo } from "@/components/component/scroll-reveal";
import Image from "next/image";
import React from "react";
import { useRequireAuth } from "@/lib/hooks/useAuth";

export default function DashBoard() {
  const { user, loading, isAuthenticated } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by useRequireAuth
  }

  return (
    <div>
      <DashboardNavbar>
        <div className="flex  justify-center">
          <div>
            <LensDemo />
          </div>
          <div className="ml-6">
            <StickyScrollRevealDemo />
          </div>
        </div>
      </DashboardNavbar>
    </div>
  );
}
