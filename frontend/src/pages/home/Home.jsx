import React from 'react';
import HeroSection from './components/HeroSection';
import Features from './components/Features';
import PopularDestinations from './components/PopularDestinations';
import BookingProcess from './components/BookingProcess';
import TourPlans from './components/TourPlans';
import RoomListings from './components/RoomListings';
import CallToAction from './components/CallToAction';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import Footer from '../../components/Footer';

const Home = () => {
  return (
    <div className="bg-gray-50">
      <HeroSection />
      <Features />
      <PopularDestinations />
      <BookingProcess />
      <TourPlans />
      <RoomListings />
      <CallToAction />
      <Testimonials />
      {/* <Newsletter /> */}
      <Footer />
    </div>
  );
};

export default Home;