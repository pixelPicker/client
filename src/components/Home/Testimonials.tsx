import React from 'react';

const testimonials = [
  {
    name: 'John Doe',
    role: 'Sales Manager',
    quote: 'This CRM has transformed our sales process. Highly recommend!',
  },
  {
    name: 'Jane Smith',
    role: 'Command Lead',
    quote: 'Intuitive and powerful. Our team productivity has doubled.',
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto bg-white">
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">What Our Users Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-gray-50 border border-gray-100 rounded-xl p-8"
          >
            <p className="text-gray-700 italic mb-6 text-lg">"{testimonial.quote}"</p>
            <div className="text-right">
              <p className="text-gray-900 font-semibold">{testimonial.name}</p>
              <p className="text-gray-500">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
