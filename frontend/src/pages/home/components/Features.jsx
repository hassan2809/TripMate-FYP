import React from "react";
import { Home, Users, Map, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const Features = () => {
  const features = [
    {
      icon: <Home className="h-8 w-8 text-blue-600" />,
      title: "Best Accommodation",
      description:
        "Find the perfect stay with our verified listings and user reviews",
      color: "bg-blue-50",
    },
    {
      icon: <Map className="h-8 w-8 text-green-600" />,
      title: "Tour Planning",
      description:
        "Create and share personalized itineraries with your travel group",
      color: "bg-green-50",
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Group Travel",
      description:
        "Invite friends and family to join your adventures with easy coordination",
      color: "bg-purple-50",
    },
    {
      icon: <CreditCard className="h-8 w-8 text-orange-600" />,
      title: "Secure Payments",
      description:
        "Book with confidence using our secure payment processing system",
      color: "bg-orange-50",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const headerVariants = {
    hidden: { y: 30, opacity: 0 },
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
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p
            className="text-blue-600 font-semibold uppercase tracking-wider mb-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our Services
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            We Offer Best Travel Services
          </motion.h2>
          <motion.div
            className="mt-3 mx-auto w-24 h-1 bg-blue-600 rounded"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`${feature.color} rounded-lg p-8 text-center cursor-pointer`}
              variants={itemVariants}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="inline-block p-4 rounded-full bg-white shadow-md mb-5"
                whileHover={{
                  rotate: 360,
                  transition: { duration: 0.6 },
                }}
              >
                {feature.icon}
              </motion.div>
              <motion.h3
                className="text-xl font-semibold mb-3 text-gray-900"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {feature.title}
              </motion.h3>
              <motion.p
                className="text-gray-600"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                {feature.description}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
