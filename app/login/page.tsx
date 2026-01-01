"use client";

import ModeToggle from "@/app/ligt-dark-mode";
import { ImagesSliderDemo } from "@/components/component/image_slider";
import { SignupFormDemo } from "@/components/component/sign-up-form";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  return (
    <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
      <Navbar />
      <div className="flex">
        <div>
          <ImagesSliderDemo />
        </div>
        <div className="w-[40%]">
          <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
            <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
          </div>
          <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
            <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
            <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          </div>
          <div className="px-4 py-10 md:py-20">
            <SignupFormDemo />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Navbar = () => {
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full flex justify-center items-center">
          <Image alt="logo" src="/images/logo.png" width={180} height={180} />
        </div>
        <Link href="/">
          <h1 className="text-base font-bold md:text-2xl">
            ZDSPGC-MAHAYAG CAMPUS PORTAL
          </h1>
        </Link>
      </div>
      <div>
        <ModeToggle />
      
      </div>
    </nav>
  );
};
