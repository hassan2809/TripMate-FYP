import React, { useState, useEffect } from "react";
import { MapPin, Users, Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TourImage1 from "../../../components/assets/nature.jpg";
import TourImage2 from "../../../components/assets/nature.jpg";
import TourImage3 from "../../../components/assets/nature.jpg";

const TourPlans = () => {
  const [tours, setTours] = useState([]);
  const navigate = useNavigate();

  const tourImages = [TourImage1, TourImage2, TourImage3];

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/tour/getTourPackages"
        );
        if (response.data.success) {
          setTours(response.data.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching tours:", error);
        setTours([
          {
            _id: "1",
            destination: "Murree Hills",
            numberOfDays: 3,
            price: "$299",
            originalPrice: "$399",
            companions: new Array(12),
            description:
              "Experience the beauty of mountain scenery with guided tours and luxury accommodation.",
          },
          {
            _id: "2",
            destination: "Lahore Cultural Tour",
            numberOfDays: 5,
            price: "$399",
            originalPrice: "$499",
            companions: new Array(8),
            description:
              "Explore the historical wonders and cultural heritage of this vibrant city.",
          },
          {
            _id: "3",
            destination: "Northern Areas Adventure",
            numberOfDays: 7,
            price: "$599",
            originalPrice: "$799",
            companions: new Array(15),
            description:
              "Trek through breathtaking landscapes and experience local hospitality.",
          },
        ]);
      }
    };

    fetchTours();
  }, []);

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
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.p
            className="text-blue-600 font-semibold uppercase tracking-wider mb-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Trending Tours
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Our Popular Tour Plans
          </motion.h2>
          <motion.div
            className="mt-3 mx-auto w-24 h-1 bg-blue-600 rounded"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {tours.map((tour, index) => (
            <motion.div
              key={tour._id}
              className="bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer"
              variants={cardVariants}
              whileHover={{
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                transition: { duration: 0.3 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative overflow-hidden">
                <motion.img
                  src={tourImages[index % tourImages.length]}
                  alt={tour.destination}
                  className="w-full h-64 object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                <motion.div
                  className="absolute top-4 right-4 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  Featured
                </motion.div>
              </div>

              <div className="p-6">
                <motion.div
                  className="flex items-center space-x-2 mb-2"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    {tour.destination}
                  </h3>
                </motion.div>

                <motion.p
                  className="text-gray-600 mb-4"
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  {tour.description ||
                    "Experience an unforgettable journey with our carefully planned tour package."}
                </motion.p>

                <motion.div
                  className="flex justify-between items-center text-sm text-gray-500 mb-4"
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{tour.numberOfDays} Days</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{tour.companions?.length || 0} Going</span>
                  </div>
                </motion.div>

                <motion.div
                  className="flex justify-between items-center"
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div>
                    <span className="text-blue-600 font-bold text-2xl">
                      {tour.price}
                    </span>
                    {tour.originalPrice && (
                      <span className="text-gray-400 text-sm line-through ml-2">
                        {tour.originalPrice}
                      </span>
                    )}
                  </div>
                  <motion.button
                    onClick={() => navigate(`/tour/${tour._id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1 px-4 py-2 rounded-lg transition duration-300"
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Explore</span>
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ y: 50, opacity: 0 }}
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
            View All Tour Plans
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default TourPlans;
