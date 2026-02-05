'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Split text into words for animation
const splitTextIntoWords = (text: string) => {
  return text.split(' ');
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 bg-white ${
          isScrolled 
            ? 'border-b border-green-200 shadow-sm' 
            : 'border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left Corner */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-2xl font-bold text-green-600 hover:text-green-700 transition-colors cursor-pointer bg-transparent border-none"
            >
              Care Equity
            </button>
            
            {/* Navigation - Right Side */}
            <nav className="hidden md:flex items-center gap-1">
              <a 
                href="#problem" 
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200"
              >
                The Problem
              </a>
              <a 
                href="#features" 
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200"
              >
                Features
              </a>
              <a 
                href="#faq" 
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200"
              >
                FAQ
              </a>
              <Link 
                href="/quality-ratings"
                className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md text-base font-medium hover:bg-green-700 transition-all duration-200 shadow-sm"
              >
                GET STARTED
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section with Background Pattern */}
        <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white">
          {/* Decorative background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98112_1px,transparent_1px),linear-gradient(to_bottom,#10b98112_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {/* Animated word-by-word text */}
                <span className="inline-block">
                  {splitTextIntoWords('What if You Could Choose').map((word, index) => (
                    <span
                      key={`line1-${index}`}
                      className="inline-block mr-3 md:mr-4"
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </span>
                <br />
                <span className="text-green-600 inline-block">
                  {splitTextIntoWords('Safer Healthcare').map((word, index) => (
                    <span
                      key={`line2-${index}`}
                      className="inline-block mr-3 md:mr-4"
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${(splitTextIntoWords('What if You Could Choose').length * 0.1) + 0.3 + (index * 0.1)}s both`,
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </span>
                <br />
                <span className="inline-block">
                  {splitTextIntoWords('for Everyone?').map((word, index) => (
                    <span
                      key={`line3-${index}`}
                      className="inline-block mr-3 md:mr-4"
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${(splitTextIntoWords('What if You Could Choose').length * 0.1) + (splitTextIntoWords('Safer Healthcare').length * 0.1) + 0.6 + (index * 0.1)}s both`,
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </span>
              </h1>
              <p 
                className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed"
                style={{
                  animation: `fadeInFloat 0.8s ease-out 1.5s both`,
                }}
              >
                Care Equity is a healthcare quality tracker — built to empower patients with transparent data, while keeping your information secure and anonymous.
              </p>
              <div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                style={{
                  animation: `fadeInFloat 0.8s ease-out 1.8s both`,
                }}
              >
                <button className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-all hover:scale-105 shadow-lg">
                  GET STARTED
                </button>
                <button className="px-8 py-4 border-2 border-green-600 text-green-600 rounded-lg font-semibold text-lg hover:bg-green-50 transition-all">
                  See how it works
                </button>
              </div>
              <p 
                className="mt-6 text-sm text-gray-600"
                style={{
                  animation: `fadeInFloat 0.8s ease-out 2.1s both`,
                }}
              >
                Join patients and advocates working towards equitable healthcare
              </p>
            </div>
          </div>
        </section>

        {/* Why You'll Love It Section */}
        <section className="py-20 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Why You'll Love It
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Care Equity gives you the transparency you need without the complexity you don't — so you focus on making informed healthcare decisions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Anonymous & Secure
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Report experiences with complete anonymity. Your privacy is protected while your voice helps create change.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Data-Driven Insights
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Access transparent hospital ratings based on real patient experiences and health outcomes by demographic.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Easy to Use
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Find safer hospitals and report experiences in seconds. Simple interface designed for everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section id="problem" className="py-20 md:py-32 bg-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                The Hospital Quality Problem
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Severe disparities exist in maternal healthcare outcomes across different demographics
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-green-100">
                <div className="text-5xl font-bold text-green-600 mb-4">2.4x</div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Black patients died more often (11.5 per 100,000) than White patients (4.8 per 100,000)
                </p>
                <p className="text-sm text-gray-600">Source: KFF</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-green-100">
                <div className="text-5xl font-bold text-green-600 mb-4">2x</div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Black infants were at twice the risk of being at a hospital with high rates of mortality and morbidity
                </p>
                <p className="text-sm text-gray-600">Source: Harvard Online</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-green-100">
                <div className="text-5xl font-bold text-green-600 mb-4">10x</div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Black women were ten times more likely to report unfair treatment and discrimination from maternity care providers
                </p>
                <p className="text-sm text-gray-600">Source: The Century Foundation</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-green-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Hospital Distribution Disparities
                </h3>
                <p className="text-gray-700 mb-3 leading-relaxed">
                  <strong className="text-gray-900">75%</strong> of Black pregnant women are cared for by only <strong className="text-gray-900">25%</strong> of hospitals
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Some hospitals serving Black mothers received 'F' ratings from quality groups
                </p>
                <p className="text-sm text-gray-600 mt-4">Source: Health Affairs</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-green-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Patient Experience of Discrimination
                </h3>
                <p className="text-gray-700 mb-3 leading-relaxed">
                  <strong className="text-gray-900">30%</strong> of Black and Hispanic women reported provider mistreatment compared to <strong className="text-gray-900">21%</strong> of White women
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Patients who perceived racial bias were less likely to follow medical advice or seek care
                </p>
                <p className="text-sm text-gray-600 mt-4">Source: The Century Foundation</p>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Features Section */}
        <section id="features" className="py-20 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Advanced features for Transparent, Safe Healthcare
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                From anonymous reporting to hospital finder tools, Care Equity gives you the building blocks for informed healthcare decisions — with a clean, user-friendly experience.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div className="bg-green-50 p-8 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Anonymous Reporting
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Report experiences of bias or discrimination with complete anonymity. Your voice matters, and your privacy is protected.
                </p>
              </div>

              <div className="bg-green-50 p-8 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Hospital Ratings by Race
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Access transparent ratings on maternal health outcomes by race, helping you make informed decisions about where to receive care.
                </p>
              </div>

              <div className="bg-green-50 p-8 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Hospital Finder
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Find safer hospitals with comprehensive ratings and patient experiences. Make informed choices for you and your family.
                </p>
              </div>

              <div className="bg-green-50 p-8 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Data Aggregation
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Aggregate data to identify patterns and systemic issues, enabling advocacy and driving policy change for equitable healthcare.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-32 bg-green-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                About Equity Care
              </h2>
              <p className="text-xl text-gray-700">
                Common questions you might have around privacy, data security, and how Care Equity works
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-green-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  What is Care Equity, and why should I use it?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Care Equity is a healthcare quality tracker that empowers patients with transparent, data-driven information about hospital quality and patient experiences. By using Care Equity, you can make informed healthcare decisions, report experiences anonymously, and help create a more equitable healthcare system.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-green-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Who is Care Equity for?
                </h3>
                <div className="text-gray-700 leading-relaxed">
                  <p className="mb-2">
                    Care Equity is designed for anyone seeking healthcare, including:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                    <li>Patients looking for safer hospitals and quality care</li>
                    <li>Pregnant individuals choosing where to give birth</li>
                    <li>Advocates working to address healthcare inequities</li>
                    <li>Anyone who has experienced bias or discrimination in healthcare</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-green-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  How does Care Equity ensure my privacy?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  All reports are completely anonymous. We never collect personally identifiable information, and your reports cannot be traced back to you. Your privacy and security are our top priorities.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-green-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  How are hospital ratings calculated?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Hospital ratings are based on aggregated patient experiences, reported outcomes, and demographic-specific health data. We analyze patterns across multiple data points to provide transparent, reliable ratings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 md:py-32 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              You've Scrolled Enough. Time to Act.
            </h2>
            <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
              Start making informed healthcare decisions with the platform built for patients like you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-all hover:scale-105 shadow-lg">
                GET STARTED
              </button>
              <button className="px-8 py-4 border-2 border-green-600 text-green-600 rounded-lg font-semibold text-lg hover:bg-green-50 transition-all">
                CONTACT US
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-green-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Care Equity</h3>
              <p className="text-sm text-green-50">
                Empowering patients with data-driven insights to address healthcare inequities
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-green-50">
                <li><Link href="/" className="hover:text-white transition-colors">Hospital Finder</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Anonymous Reporting</Link></li>
                <li><Link href="/quality-ratings" className="hover:text-white transition-colors">Quality Ratings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-green-50">
                <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#problem" className="hover:text-white transition-colors">The Problem</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contact Us</h4>
              <p className="text-sm text-green-50">
                <a href="mailto:info@careequity.org" className="hover:text-white transition-colors">
                  info@careequity.org
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-green-500 pt-8 text-center">
            <p className="text-sm text-green-50">
              © 2026 Care Equity. All rights reserved.
            </p>
            <p className="text-xs text-green-100 mt-2">
              Code2040 Hackathon 2026 – Anonymous Healthcare Bias Tracker
            </p>
          </div>
        </div>
      </footer>

      {/* CSS Animations for Hero Section */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInFloat {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
