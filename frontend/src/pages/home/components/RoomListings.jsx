import React, { useState, useEffect } from "react";
import { Home, MapPin, Star, Users, Coffee, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Room1 from "../../../components/assets/nature.jpg";
import Room2 from "../../../components/assets/nature.jpg";
import Room3 from "../../../components/assets/nature.jpg";

const RoomListings = () => {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  const roomImages = [Room1, Room2, Room3];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/roomListing/getRoomListings"
        );
        if (response.data.success) {
          setRooms(response.data.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setRooms([
          {
            _id: "1",
            title: "Luxury Suite with Mountain View",
            location: "Murree Hills",
            price: 120,
            roomType: "Private Room",
            amenities: [
              "Breakfast",
              "Wifi",
              "Air Conditioning",
              "Mountain View",
            ],
            rating: 4.8,
          },
          {
            _id: "2",
            title: "Cozy Downtown Apartment",
            location: "Islamabad",
            price: 85,
            roomType: "Entire Apartment",
            amenities: ["Kitchen", "Wifi", "Workspace", "Parking"],
            rating: 4.6,
          },
          {
            _id: "3",
            title: "Beachside Cottage",
            location: "Karachi",
            price: 95,
            roomType: "Entire Cottage",
            amenities: ["Beach Access", "Wifi", "Kitchen", "Pool"],
            rating: 4.7,
          },
        ]);
      }
    };

    fetchRooms();
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

  return (
    <section className="py-20 bg-white">
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
            Accommodations
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Top-Rated Room Listings
          </motion.h2>
          <motion.div
            className="mt-3 mx-auto w-24 h-1 bg-blue-600 rounded"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          />
          <motion.p
            className="mt-6 text-gray-600 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Find the perfect accommodation for your stay from our selection of
            verified and reviewed properties.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {rooms.map((room, index) => (
            <motion.div
              key={room._id}
              className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer"
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
                  src={roomImages[index % roomImages.length]}
                  alt={room.title}
                  className="w-full h-52 object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent w-full h-20"></div>
                <motion.div
                  className="absolute bottom-3 left-4 flex items-center text-white"
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{room.location}</span>
                </motion.div>
              </div>

              <div className="p-6">
                <motion.div
                  className="flex items-center space-x-2 mb-1"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <Home className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-600 font-medium capitalize">
                    {room.roomType}
                  </p>
                </motion.div>

                <motion.h3
                  className="text-xl font-bold text-gray-900 mb-3 capitalize"
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  {room.title}
                </motion.h3>

                <motion.div
                  className="flex flex-wrap gap-2 mb-4"
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  {(Array.isArray(room.amenities) ? room.amenities : ["Wifi"])
                    .slice(0, 3)
                    .map((amenity, i) => (
                      <motion.span
                        key={i}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        {amenity === "Wifi" && (
                          <Wifi className="h-3 w-3 mr-1" />
                        )}
                        {amenity === "Breakfast" && (
                          <Coffee className="h-3 w-3 mr-1" />
                        )}
                        {amenity}
                      </motion.span>
                    ))}
                  {Array.isArray(room.amenities) &&
                    room.amenities.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        +{room.amenities.length - 3} more
                      </span>
                    )}
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
                      ${room.price}
                    </span>
                    <span className="text-gray-500 text-sm">/night</span>
                  </div>
                  <motion.button
                    onClick={() => navigate(`/accomodation/${room._id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Book Now
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
            onClick={() => navigate("/accomodation")}
            className="bg-transparent hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-600 font-medium py-3 px-8 rounded-md transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Accommodations
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default RoomListings;
