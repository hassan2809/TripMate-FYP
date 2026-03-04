import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  ChevronRight
} from 'lucide-react';
import LogoImage from './assets/heroSection.jpg'; 

const Footer = () => {
  // Footer links
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Room Listing', path: '/room-listing' },
    { name: 'Accommodation', path: '/accomodation' },
    { name: 'Tour Plans', path: '/tourPlan' },
    { name: 'Chat', path: '/chat' }
  ];
  
  const supportLinks = [
    { name: 'Help Center', path: '/help' },
    { name: 'Safety Information', path: '/safety' },
    { name: 'Cancellation Options', path: '/cancellation' },
    { name: 'Report Concern', path: '/report' }
  ];
  
  const socialLinks = [
    { icon: Facebook, link: 'https://facebook.com', color: 'hover:bg-blue-600' },
    { icon: Twitter, link: 'https://twitter.com', color: 'hover:bg-sky-500' },
    { icon: Instagram, link: 'https://instagram.com', color: 'hover:bg-pink-600' },
    { icon: Linkedin, link: 'https://linkedin.com', color: 'hover:bg-blue-700' }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const linkVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const socialVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "backOut"
      }
    }
  };

  const contactItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-10 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Company Info */}
          <motion.div variants={itemVariants}>
            <motion.div 
              className="flex items-center mb-4"
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {/* <img src={LogoImage} alt="TripMate Logo" className="h-10 mr-2" /> */}
              <motion.h2 
                className="text-xl font-bold"
                whileHover={{ 
                  scale: 1.05,
                  color: "#3b82f6",
                  transition: { duration: 0.3 }
                }}
              >
                TripMate
              </motion.h2>
            </motion.div>
            <motion.p 
              className="text-gray-400 mb-4"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Your ultimate companion for group travel adventures. Find accommodation, plan tours, and explore new destinations seamlessly.
            </motion.p>
            <motion.div 
              className="flex space-x-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {socialLinks.map((social, index) => (
                <motion.a 
                  key={index} 
                  href={social.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`bg-gray-800 p-2 rounded-full ${social.color} transition duration-300`}
                  variants={socialVariants}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 10,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">Social media</span>
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <motion.h3 
              className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Quick Links
            </motion.h3>
            <motion.ul 
              className="space-y-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {quickLinks.map((link, index) => (
                <motion.li 
                  key={index}
                  variants={linkVariants}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition duration-300 flex items-center group"
                  >
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4 mr-2 group-hover:text-blue-500 transition-colors duration-300" />
                    </motion.div>
                    <motion.span
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Support - Commented out but keeping structure for potential use */}
          {/* <motion.div variants={itemVariants}>
            <motion.h3 
              className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Support
            </motion.h3>
            <motion.ul 
              className="space-y-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {supportLinks.map((link, index) => (
                <motion.li 
                  key={index}
                  variants={linkVariants}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition duration-300 flex items-center group"
                  >
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4 mr-2 group-hover:text-blue-500 transition-colors duration-300" />
                    </motion.div>
                    <motion.span
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div> */}

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <motion.h3 
              className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Contact Us
            </motion.h3>
            <motion.ul 
              className="space-y-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.li 
                className="flex items-start group cursor-pointer"
                variants={contactItemVariants}
                initial="hidden"
                whileInView="visible"
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ x: 5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0 group-hover:text-blue-400 transition-colors duration-300" />
                </motion.div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  123 Web Dev Lane, Internet City, WEB 12345
                </span>
              </motion.li>
              <motion.li 
                className="flex items-center group cursor-pointer"
                variants={contactItemVariants}
                initial="hidden"
                whileInView="visible"
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ x: 5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Phone className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 group-hover:text-blue-400 transition-colors duration-300" />
                </motion.div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  +92 309-9606772
                </span>
              </motion.li>
              <motion.li 
                className="flex items-center group cursor-pointer"
                variants={contactItemVariants}
                initial="hidden"
                whileInView="visible"
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ x: 5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Mail className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 group-hover:text-blue-400 transition-colors duration-300" />
                </motion.div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  tripmate@gmail.com
                </span>
              </motion.li>
            </motion.ul>
          </motion.div>

          {/* Extra space for the commented support section */}
          <motion.div 
            variants={itemVariants}
            className="hidden lg:block"
          >
            {/* This creates proper spacing for the 4-column layout */}
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.div 
          className="border-t border-gray-800 pt-8 mt-8 text-center md:flex md:justify-between md:text-left"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.p 
            className="text-gray-500"
            whileHover={{ 
              color: "#9ca3af",
              transition: { duration: 0.3 }
            }}
          >
            © {new Date().getFullYear()} TripMate. All rights reserved.
          </motion.p>
        </motion.div>

        {/* Decorative elements */}
        {/* <motion.div
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          viewport={{ once: true }}
          style={{ transformOrigin: "left" }}
        /> */}
      </div>
    </footer>
  );
};

export default Footer;