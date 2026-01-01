import { motion } from "motion/react";
import React from "react";
import { ImagesSlider } from "../ui/images-slider";
import Link from "next/link";
import Image from "next/image";

export function ImagesSliderDemo() {
  const images = [
    "/images/MISSION.png",
    "/images/VISION.png",
    "/images/GOALS.png",
  ];
  return (
    <ImagesSlider className="min-h-screen w-auto " images={images}>
      <motion.div
        initial={{
          opacity: 0,
          y: -80,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="z-50 flex flex-col justify-center items-center"
      >
        {/* <Image src="/images/logo.png" alt="logo" width={100} height={100} /> */}

      
      </motion.div>
    </ImagesSlider>
  );
}
