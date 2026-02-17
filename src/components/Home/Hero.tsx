import React from 'react';

const Hero = () => {
  return (
    <section className="relative pt-56 py-20 px-6 text-center overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 opacity-50"></div>
      <div className="relative max-w-5xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6">
          <span className="text-gray-900">SALES</span>{' '}
          <span className="text-cyan-600">
            COMMAND
          </span>
        </h1>
        <p className="text-2xl md:text-3xl text-gray-600 mb-4 font-light">
          Streamline Your Sales Operations with Our CRM
        </p>
        <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-8">
          Manage leads, track deals, and boost productivity with our powerful CRM designed for sales command managers.
        </p>
        <div className="flex flex-col items-center gap-4">
          <button className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
