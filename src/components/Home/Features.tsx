import React from 'react';
import { Zap, Server, Route as RouteIcon, Shield, Waves, Sparkles } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-8 h-8 text-cyan-600" />,
    title: 'Lead Management',
    description: 'Track and nurture leads efficiently with automated workflows.',
  },
  {
    icon: <Server className="w-8 h-8 text-cyan-600" />,
    title: 'Deal Tracking',
    description: 'Monitor deal progress and forecast sales with real-time analytics.',
  },
  {
    icon: <RouteIcon className="w-8 h-8 text-cyan-600" />,
    title: 'Pipeline Visualization',
    description: 'Visualize your sales pipeline to identify bottlenecks and opportunities.',
  },
  {
    icon: <Shield className="w-8 h-8 text-cyan-600" />,
    title: 'Data Security',
    description: 'Keep your customer data secure with enterprise-grade security.',
  },
  {
    icon: <Waves className="w-8 h-8 text-cyan-600" />,
    title: 'Integration Ready',
    description: 'Seamlessly integrate with your favorite tools and platforms.',
  },
  {
    icon: <Sparkles className="w-8 h-8 text-cyan-600" />,
    title: 'AI Insights',
    description: 'Get smart insights and recommendations to close deals faster.',
  },
];

const Features = () => {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto bg-white">
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-gray-50 border border-gray-100 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
