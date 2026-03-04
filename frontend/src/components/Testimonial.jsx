import React from 'react'
import { Star } from 'lucide-react';

const Testimonial = () => {
    return (
        <div>
            {/* Testimonials Section */}
            <section className="py-12">
                <div className="container mx-auto px-6">
                    <h2 className="text-2xl font-semibold mb-6 text-center">What Our Users Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((testimonial) => (
                            <div key={testimonial} className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex items-center mb-4">
                                    <img src={`https://i.pravatar.cc/60?img=${testimonial}`} alt="User" className="w-12 h-12 rounded-full mr-4" />
                                    <div>
                                        <h3 className="font-semibold">John Doe</h3>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600">"Amazing experience! The accommodations were perfect and the tour was unforgettable."</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Testimonial