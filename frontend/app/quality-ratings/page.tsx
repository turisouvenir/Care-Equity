'use client';

import Link from 'next/link';

export default function QualityRatings() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-green-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors">
              Care Equity
            </Link>
            <nav className="hidden md:flex gap-8">
              <Link href="/#problem" className="text-gray-700 hover:text-green-600 transition-colors text-sm font-medium">
                The Problem
              </Link>
              <Link href="/#features" className="text-gray-700 hover:text-green-600 transition-colors text-sm font-medium">
                Features
              </Link>
              <Link href="/#faq" className="text-gray-700 hover:text-green-600 transition-colors text-sm font-medium">
                FAQ
              </Link>
              <Link href="/" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                GET STARTED
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-green-50 to-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Hospital Quality Ratings
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8">
                Transparent, data-driven ratings based on patient experiences and health outcomes by demographic
              </p>
            </div>
          </div>
        </section>

        {/* How Ratings Work */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How Our Ratings Work
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Our quality ratings are calculated using multiple data sources to provide you with comprehensive, reliable information
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-green-50 p-8 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Patient Reports
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Anonymous patient experiences and reports of bias, discrimination, or quality of care issues
                </p>
              </div>

              <div className="bg-green-50 p-8 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Health Outcomes
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Maternal and infant mortality rates, complication rates, and other health outcome metrics by demographic
                </p>
              </div>

              <div className="bg-green-50 p-8 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Demographic Analysis
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Ratings broken down by race, ethnicity, and other demographic factors to identify disparities
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Rating System */}
        <section className="py-16 md:py-24 bg-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Rating System
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Our ratings use a comprehensive scoring system to help you make informed decisions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-green-500">
                <div className="text-4xl font-bold text-green-600 mb-3">A</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Excellent</h3>
                <p className="text-sm text-gray-700">
                  Outstanding quality of care with minimal disparities across demographics
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-green-400">
                <div className="text-4xl font-bold text-green-500 mb-3">B</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Good</h3>
                <p className="text-sm text-gray-700">
                  High quality care with some areas for improvement in equity
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-yellow-400">
                <div className="text-4xl font-bold text-yellow-600 mb-3">C</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fair</h3>
                <p className="text-sm text-gray-700">
                  Adequate care but notable disparities exist across demographics
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-red-400">
                <div className="text-4xl font-bold text-red-600 mb-3">D</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Poor</h3>
                <p className="text-sm text-gray-700">
                  Significant quality issues and major disparities in care outcomes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Ratings Table */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Hospital Ratings
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Search and filter hospitals by location, rating, and demographic outcomes
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by hospital name or location..."
                  className="w-full px-4 py-3 pl-12 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 text-gray-900"
                />
                <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Sample Table */}
            <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hospital Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Overall Rating</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Black Patients</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">White Patients</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hispanic Patients</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    <tr className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">City General Hospital</td>
                      <td className="px-6 py-4 text-sm text-gray-700">New York, NY</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">A</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">A</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">A</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">A</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Regional Medical Center</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Chicago, IL</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">B</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">C</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">B</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">B</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Community Health Hospital</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Los Angeles, CA</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">C</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">D</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">B</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">C</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">Metro Hospital</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Houston, TX</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">C</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">D</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">B</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">C</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-4">
                * Ratings are based on aggregated patient reports and health outcome data
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Report Your Experience
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-green-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Help Build Better Ratings
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Your anonymous report helps improve the accuracy of our ratings and creates transparency in healthcare
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-all hover:scale-105 shadow-lg"
              >
                Submit Anonymous Report
              </Link>
              <Link
                href="/"
                className="px-8 py-4 border-2 border-green-600 text-green-600 rounded-lg font-semibold text-lg hover:bg-green-50 transition-all"
              >
                Learn More
              </Link>
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
                <li><Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/#problem" className="hover:text-white transition-colors">The Problem</Link></li>
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
    </div>
  );
}
