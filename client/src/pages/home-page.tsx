import { Building2, Clock, Shield, CheckCircle, ArrowRight, Users, Zap, ArrowUpRight, CreditCard } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import Navbar from '@/components/shared/navbar';
import React, { useState } from 'react';

export default function HomePage() {
  const { user } = useAuth();
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="absolute inset-0 bg-[url('/api/placeholder/20/20')] opacity-5"></div>

      {/* Original Navbar */}
      <Navbar />

      <main className="relative max-w-7xl mx-auto px-4 py-16">
        {/* Decorative speed lines */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <div className="absolute transform rotate-45 h-1 w-32 bg-blue-600"></div>
          <div className="absolute transform rotate-45 h-1 w-24 bg-blue-600 translate-x-8"></div>
          <div className="absolute transform rotate-45 h-1 w-16 bg-blue-600 translate-x-16"></div>
        </div>

        <div className="text-center mb-16 relative">
          {/* Floating speed indicators */}
          <div className="absolute -top-8 left-1/4 bg-blue-600 text-white px-3 py-1 rounded-full transform -rotate-12 opacity-80">
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" /> Fast
            </span>
          </div>
          <div className="absolute top-0 right-1/4 bg-green-500 text-white px-3 py-1 rounded-full transform rotate-12 opacity-80">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> Easy
            </span>
          </div>

          {/* Enhanced Badge */}
          <div className="inline-block bg-blue-100 text-blue-600 px-6 py-3 rounded-full mb-8 shadow-md hover:shadow-lg transition-shadow">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">No credit card required</span>
            </span>
          </div>

          {/* Hero Section with MyRentCard branding */}
          <div className="relative">
            <h1 className="text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
                MyRentCard
              </span>
              <div className="absolute -right-4 top-0 text-yellow-400 text-xl">✨</div>
              <span className="block text-3xl mt-4 text-gray-800">
                One Form. Rent Anywhere.
              </span>
              <span className="block text-2xl mt-2 text-blue-600">
                100% Free to Use
              </span>
            </h1>
          </div>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Fill out your rental profile once and instantly apply to multiple properties.
            No account needed to start.
          </p>

          {/* CTA Buttons with Original Links */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
            <Link 
              href="/create-rentcard" 
              className="group bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transition-all"
              onMouseEnter={() => setHoveredCard('cta1')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              Create Free RentCard
              <ArrowRight className={`w-5 h-5 transition-transform ${hoveredCard === 'cta1' ? 'translate-x-1' : ''}`} />
            </Link>
            <Link 
              href="/create-screening" 
              className="group border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-medium hover:bg-blue-50 flex items-center justify-center gap-3 transition-all"
              onMouseEnter={() => setHoveredCard('cta2')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              Request Tenant Info
              <ArrowRight className={`w-5 h-5 transition-transform ${hoveredCard === 'cta2' ? 'translate-x-1' : ''}`} />
            </Link>
          </div>

          {/* Sample Links */}
          <div className="flex flex-wrap justify-center gap-8 text-blue-600 mb-16">
            <Link 
              href="/samples/rentcard" 
              className="group flex items-center gap-2 hover:text-blue-800 transition-colors"
            >
              <span>View Sample RentCard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/samples/screening-page" 
              className="group flex items-center gap-2 hover:text-blue-800 transition-colors"
            >
              <span>View Sample Screening Page</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Enhanced Benefits Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Clock, title: "Save Hours", desc: "Fill out one form and use it everywhere. No more repetitive applications." },
              { icon: Shield, title: "Secure & Private", desc: "You control what information to share with each landlord." },
              { icon: Users, title: "Pre-Qualify Fast", desc: "Get instant responses from properties that match your criteria." }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="relative bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
                onMouseEnter={() => setHoveredCard(`benefit${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <div className={`bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 transition-transform ${hoveredCard === `benefit${index}` ? 'scale-110' : ''}`}>
                  <benefit.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>

          {/* Dynamic Social Proof Section */}
          <div className="bg-white p-12 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50 to-transparent opacity-50"></div>

            <div className="relative">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-1 w-16 bg-blue-200 rounded"></div>
                <p className="text-xl font-semibold text-blue-800">Trusted by Thousands</p>
                <div className="h-1 w-16 bg-blue-200 rounded"></div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  "Got approved in 2 days!",
                  "Saved hours of paperwork",
                  "Best rental tool ever"
                ].map((review, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
                    onMouseEnter={() => setHoveredCard(`review${index}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="text-yellow-400 mb-3 flex gap-1">
                      {"★★★★★"}
                    </div>
                    <p className="text-gray-700 font-medium">"{review}"</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-lg font-semibold mb-2">Core features are completely free</p>
                <p className="text-gray-600">Optional premium features available for power users</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}