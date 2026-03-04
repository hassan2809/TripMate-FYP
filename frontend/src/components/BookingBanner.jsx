import React from "react";
import Destination1 from './assets/booking_bg.svg';

const BookingBanner = () => {
    return (
        <div className="relative w-full h-[200px] md:h-[300px] mb-12">
            {/* Background Image */}
            <img
                src={Destination1} // Replace with your actual image URL
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>

            {/* Text Content */}
            <div className="relative z-10 flex flex-col items-start justify-center h-full px-6 md:px-12 lg:px-20">
                <h1 className="text-white text-3xl md:text-5xl font-bold leading-tight">
                    Let’s Make Your <br /> Next Holiday Amazing
                </h1>
                {/* <div className="mt-2 md:mt-4">
                    <span className="text-white text-lg md:text-xl italic font-light">
                        ⟶
                    </span>
                </div> */}
            </div>
        </div>
    );
};

export default BookingBanner;
