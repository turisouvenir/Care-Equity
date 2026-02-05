'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hospital Interface
 */
interface Hospital {
  id: string;
  name: string;
  location: string;
  city?: string;
  state?: string;
}

/**
 * Find Hospitals Page
 * 
 * Displays all hospitals on a Google Map with interactive features
 */
export default function FindHospitals() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredHospital, setHoveredHospital] = useState<string | null>(null);

  /**
   * Fetch hospitals from backend API
   */
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/hospitals');
        const result = await response.json();
        
        if (result.success && result.data) {
          setHospitals(result.data);
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  /**
   * Generate Google Maps URL showing all 20 specific hospital locations
   * Uses a search query format that Google Maps can parse to show multiple locations
   */
  const getGoogleMapsUrl = () => {
    if (hospitals.length === 0) return '';
    // Try to create a search that includes all hospitals
    // Format: hospital1, location1 | hospital2, location2 | ...
    const allHospitals = hospitals.map(h => `${h.name}, ${h.location}`).join(' | ');
    // Use search API with all hospital names and locations
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(allHospitals)}`;
  };

  /**
   * Get directions to a specific hospital
   */
  const getDirectionsUrl = (hospital: Hospital) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${hospital.name}, ${hospital.location}`)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-green-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-2xl font-bold text-green-600 hover:text-green-700 transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              Care Equity
            </button>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/"
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200"
              >
                Home
              </Link>
              <Link 
                href="/quality-ratings"
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200"
              >
                Ratings
              </Link>
              <Link 
                href="/find-hospitals"
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200 bg-green-50 text-green-600"
              >
                Find Hospitals
              </Link>
              <Link 
                href="/links"
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200"
              >
                Newsletters
              </Link>
              <Link 
                href="/report"
                className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md text-base font-medium hover:bg-green-700 transition-all duration-200 shadow-sm"
              >
                Submit Anonymous Form
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-green-50 to-white pt-16 md:pt-24 pb-8 md:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Find Hospitals Near You
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8">
                Explore {hospitals.length} hospitals on an interactive map and get directions
              </p>
            </div>
          </div>
        </section>

        {/* Map and Hospital List Section */}
        <section className="py-8 md:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Loading hospitals...</p>
              </div>
            ) : hospitals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No hospitals found.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Hospital List - Left Side */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      All Hospitals ({hospitals.length})
                    </h2>
                    <div className="space-y-2">
                      {hospitals.map((hospital) => (
                        <div
                          key={hospital.id}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            hoveredHospital === hospital.id
                              ? 'border-green-500 bg-green-50 shadow-md'
                              : 'border-green-100 bg-white hover:border-green-300 hover:bg-green-50'
                          }`}
                          onMouseEnter={() => setHoveredHospital(hospital.id)}
                          onMouseLeave={() => setHoveredHospital(null)}
                        >
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {hospital.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {hospital.location}
                          </p>
                          <div className="flex gap-2">
                            <a
                              href={getDirectionsUrl(hospital)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Get Directions
                            </a>
                            <Link
                              href={`/hospitals/${hospital.id}`}
                              className="px-3 py-2 border border-green-600 text-green-600 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Google Maps - Right Side */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
                    <div className="aspect-video w-full bg-green-50 relative flex items-center justify-center">
                      <div className="text-center p-8 max-w-md">
                        <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">View All {hospitals.length} Hospitals</h3>
                        <p className="text-gray-600 mb-4">
                          Click below to see all {hospitals.length} hospitals on Google Maps. You can then get directions to any of them.
                        </p>
                        <a
                          href={getGoogleMapsUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          View All {hospitals.length} Hospitals on Google Maps
                        </a>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 border-t border-green-100">
                      <p className="text-sm text-gray-600 text-center">
                        Hover over a hospital in the list to highlight it. Click "Get Directions" to open Google Maps with directions to that specific hospital.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-12 bg-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Need More Information?
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/quality-ratings"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  View Hospital Ratings
                </Link>
                <Link
                  href="/report"
                  className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Report Your Experience
                </Link>
              </div>
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
                <li><Link href="/find-hospitals" className="hover:text-white transition-colors">Hospital Finder</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Anonymous Reporting</Link></li>
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
