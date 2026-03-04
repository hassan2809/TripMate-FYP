import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CTABackground from "../../../components/assets/nature.jpg";

const CallToAction = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
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

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${CTABackground})` }}
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/70"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            variants={itemVariants}
          >
            Ready to Create Your Perfect Travel Experience?
          </motion.h2>
          <motion.p
            className="text-white/90 text-lg mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Join thousands of travelers who have discovered the joy of seamless
            planning and unforgettable adventures with TripMate.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => navigate("/room-listing")}
              className="bg-white text-blue-900 hover:bg-blue-50 font-medium py-3 px-8 rounded-md transition duration-300"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(255, 255, 255, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              List Your Room
            </motion.button>
            <motion.button
              onClick={() => navigate("/tourPlan")}
              className="bg-transparent hover:bg-white/10 text-white border border-white font-medium py-3 px-8 rounded-md transition duration-300"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: "rgba(255, 255, 255, 0.8)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Create Tour Plan
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
