import React from "react";
import { MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Dest1 from "../../../components/assets/1.svg";
import Dest2 from "../../../components/assets/1.svg";
import Dest3 from "../../../components/assets/1.svg";
import Dest4 from "../../../components/assets/1.svg";
import DestinationBg from "../../../components/assets/nature.jpg";

const PopularDestinations = () => {
  const navigate = useNavigate();

  const destinations = [
    {
      id: 1,
      name: "Murree Hills",
      location: "Northern Pakistan",
      image: Dest1,
      properties: 42,
      featured: true,
    },
    {
      id: 2,
      name: "Islamabad",
      location: "Capital City",
      image: Dest2,
      properties: 65,
      featured: false,
    },
    {
      id: 3,
      name: "Lahore",
      location: "Punjab",
      image: Dest3,
      properties: 78,
      featured: false,
    },
    {
      id: 4,
      name: "Karachi",
      location: "Sindh",
      image: Dest4,
      properties: 94,
      featured: false,
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

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Left content animation - using y instead of x to prevent horizontal overflow
  const leftContentVariants = {
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

  // Right content animation - using y instead of x to prevent horizontal overflow
  const rightContentVariants = {
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
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12">
          <motion.div
            className="lg:w-1/2 mb-8 lg:mb-0 w-full"
            variants={leftContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.p
              className="text-blue-600 font-semibold uppercase tracking-wider"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Destinations
            </motion.p>
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mt-2"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Explore Our Popular Destinations
            </motion.h2>
            <motion.p
              className="text-gray-600 mt-4 max-w-xl"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Discover the most sought-after travel destinations where you can
              find the best accommodations and plan memorable tours with friends
              and family.
            </motion.p>
          </motion.div>

          <motion.div
            className="lg:w-1/2 flex justify-center lg:justify-end w-full"
            variants={rightContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="relative w-full max-w-md mx-auto lg:mx-0">
              <div className="aspect-square relative max-w-sm mx-auto">
                <motion.div
                  className="absolute inset-0 bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url(${DestinationBg})` }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                />
                <motion.div
                  className="absolute inset-0 bg-cover bg-center rounded-lg transform border-8 border-white shadow-xl"
                  style={{ backgroundImage: `url(${Dest1})` }}
                  initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
                  whileInView={{ scale: 1, opacity: 1, rotate: -6 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{
                    rotate: 0,
                    scale: 1.02,
                    transition: { duration: 0.3 },
                  }}
                />
                <motion.div
                  className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-blue-600 text-white text-xs sm:text-sm font-bold px-2 py-1 sm:px-4 sm:py-2 rounded-full whitespace-nowrap"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  150+ Destinations
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {destinations.map((destination) => (
            <motion.div
              key={destination.id}
              className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer"
              variants={cardVariants}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
            >
              <div className="relative h-80 overflow-hidden">
                <motion.img
                  src={destination.image}
                  alt={destination.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

                {destination.featured && (
                  <motion.div
                    className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    Featured
                  </motion.div>
                )}
              </div>

              <motion.div
                className="absolute bottom-0 left-0 w-full p-6 text-white"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <p className="text-sm">{destination.location}</p>
                </div>
                <h3 className="text-xl font-bold mb-2">{destination.name}</h3>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.button
            onClick={() => navigate("/tourPackages")}
            className="bg-transparent hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-600 font-medium py-3 px-8 rounded-md transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Destinations
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularDestinations;
