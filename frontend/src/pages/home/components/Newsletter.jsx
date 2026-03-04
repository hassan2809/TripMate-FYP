// Newsletter.jsx
import React, { useState } from 'react';
import { Send, Mail } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      // Handle subscription logic here
      setSubscribed(true);
      setEmail('');
      
      // Reset the success message after 3 seconds
      setTimeout(() => {
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <section className="py-20 bg-blue-600">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full opacity-50"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-50 rounded-full opacity-70"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center">
              <div className="md:w-3/5 mb-8 md:mb-0 md:pr-8">
                <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Subscribe to Our Newsletter
                </h2>
                <p className="text-gray-600">
                  Stay updated with our latest travel deals, destination guides, and exclusive offers. Join our community of travelers today!
                </p>
                
                {subscribed && (
                  <div className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded-md">
                    Thank you for subscribing! 🎉
                  </div>
                )}
              </div>
              
              <div className="md:w-2/5 w-full">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address" 
                      className="w-full px-5 py-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition duration-300 flex items-center justify-center"
                  >
                    Subscribe Now
                    <Send className="ml-2 h-5 w-5" />
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    By subscribing, you agree to our Privacy Policy and Terms of Service.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;