import React from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import HeroImage from "../../../components/assets/3.svg";

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const backgroundVariants = {
    initial: { scale: 1.1, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${HeroImage})`,
          backgroundPosition: "center 40%",
        }}
        variants={backgroundVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Navbar />
        </motion.div>

        <div className="container mx-auto px-4 pt-24 md:pt-40">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
              variants={itemVariants}
            >
              Plan. Share. Explore Together
            </motion.h1>

            <motion.p
              className="mt-6 text-xl text-white/90 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Your ultimate companion for group travel adventures. Find
              accommodation, plan tours, and explore new destinations
              seamlessly.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
