import React from "react";
import { MapPin, Calendar, Award } from "lucide-react";
import { motion } from "framer-motion";
import BookingImage from "../../../components/assets/nature.jpg";

const BookingProcess = () => {
  const steps = [
    {
      icon: <MapPin className="h-6 w-6 text-white" />,
      color: "bg-blue-600",
      title: "Choose Destination",
      description:
        "Browse through our curated list of destinations and accommodations to find your perfect match.",
    },
    {
      icon: <Calendar className="h-6 w-6 text-white" />,
      color: "bg-green-600",
      title: "Check Availability",
      description:
        "Check room availability for your desired dates and see real-time pricing and special offers.",
    },
    {
      icon: <Award className="h-6 w-6 text-white" />,
      color: "bg-purple-600",
      title: "Book & Enjoy",
      description:
        "Secure your booking with our easy payment process and get ready for an unforgettable experience.",
    },
  ];

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

  const stepVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { x: 50, opacity: 0, scale: 0.9 },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-sm font-bold text-blue-600 uppercase tracking-wider"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Fast & Easy
            </motion.h2>
            <motion.h3
              className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Book Your Next Trip
              <br />
              In 3 Simple Steps
            </motion.h3>

            <motion.div
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex"
                  variants={stepVariants}
                  whileHover={{ x: 10, transition: { duration: 0.3 } }}
                >
                  <motion.div
                    className={`${step.color} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1`}
                    whileHover={{
                      scale: 1.1,
                      rotate: 360,
                      transition: { duration: 0.5 },
                    }}
                  >
                    {step.icon}
                  </motion.div>
                  <div className="ml-4">
                    <motion.h4
                      className="text-xl font-semibold text-gray-900"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      {step.title}
                    </motion.h4>
                    <motion.p
                      className="text-gray-600 mt-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      {step.description}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.button
              className="mt-10 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition duration-300"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Now
            </motion.button>
          </motion.div>

          <motion.div
            className="lg:w-1/2"
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="relative">
              <motion.img
                src={BookingImage}
                alt="Booking Process"
                className="rounded-lg shadow-xl max-w-full h-auto"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    className="bg-blue-100 p-3 rounded-full"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Award className="h-8 w-8 text-blue-600" />
                  </motion.div>
                  <div>
                    <p className="text-gray-600 text-sm">
                      Best Price Guarantee
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      Save up to 30%
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BookingProcess;
