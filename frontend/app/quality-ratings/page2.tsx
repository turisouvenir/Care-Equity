'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * HospitalRating Interface
 */
interface HospitalRating {
  hospitalId: string;
  name: string;
  city: string;
  state: string;
  location: string;
  overallGrade: string;
  overallScore: number | null;
  equityGapScore: number | null;
  byGroup: {
    Black?: { score: number; grade: string };
    White?: { score: number; grade: string };
    Hispanic?: { score: number; grade: string };
  };
}

/**
 * Hospital Sentiment Interface
 */
interface HospitalSentiment {
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  averageRating: number;
  totalReviews: number;
}

/**
 * QualityRatings Component - Redesigned with sidebar filters
 */
export default function QualityRatings() {
  const router = useRouter();
  
  // State management
  const [ratings, setRatings] = useState<HospitalRating[]>([]);
  const [filteredRatings, setFilteredRatings] = useState<HospitalRating[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'overall' | 'black' | 'disparity' | 'none'>('none');
  const [loading, setLoading] = useState<boolean>(true);
  const [locations, setLocations] = useState<string[]>([]);
  const [sentiments, setSentiments] = useState<Record<string, HospitalSentiment>>({});
  const [loadingSentiments, setLoadingSentiments] = useState<Record<string, boolean>>({});

  /**
   * Fetch ratings from backend API
   */
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/ratings');
        const result = await response.json();
        
        if (result.success && result.data) {
          setRatings(result.data);
          setFilteredRatings(result.data);
          
          const uniqueLocations = Array.from(
            new Set(result.data.map((r: HospitalRating) => r.location))
          ).sort() as string[];
          setLocations(uniqueLocations);
          
          // Fetch sentiments for all hospitals
          fetchAllSentiments(result.data);
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  /**
   * Fetch sentiment for all hospitals
   */
  const fetchAllSentiments = async (hospitalRatings: HospitalRating[]) => {
    const sentimentMap: Record<string, HospitalSentiment> = {};
    const loadingMap: Record<string, boolean> = {};
    
    hospitalRatings.forEach(rating => {
      loadingMap[rating.hospitalId] = true;
    });
    setLoadingSentiments(loadingMap);
    
    // Fetch sentiments in parallel
    const promises = hospitalRatings.map(async (rating) => {
      try {
        const response = await fetch(`http://localhost:5001/hospitals/${rating.hospitalId}/sentiment`);
        const result = await response.json();
        if (result.success && result.data) {
          sentimentMap[rating.hospitalId] = result.data;
        }
      } catch (error) {
        console.error(`Error fetching sentiment for ${rating.hospitalId}:`, error);
      }
    });
    
    await Promise.all(promises);
    setSentiments(sentimentMap);
    
    // Clear loading states
    const clearedLoading: Record<string, boolean> = {};
    hospitalRatings.forEach(rating => {
      clearedLoading[rating.hospitalId] = false;
    });
    setLoadingSentiments(clearedLoading);
  };

  /**
   * Check if hospital has significant disparity
   */
  const hasSignificantDisparity = (rating: HospitalRating): boolean => {
    const blackGrade = rating.byGroup?.Black?.grade;
    const whiteGrade = rating.byGroup?.White?.grade;
    
    if (!blackGrade || !whiteGrade || blackGrade === 'N/A' || whiteGrade === 'N/A') return false;
    
    const gradeToNum = (g: string) => ({ 'A': 4, 'B': 3, 'C': 2, 'D': 1 }[g] || 0);
    const blackNum = gradeToNum(blackGrade);
    const whiteNum = gradeToNum(whiteGrade);
    
    return Math.abs(blackNum - whiteNum) >= 2;
  };

  /**
   * Filter and sort ratings
   */
  useEffect(() => {
    let filtered = [...ratings];

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(r => r.location === selectedLocation);
    }

    if (sortBy === 'black') {
      filtered.sort((a, b) => {
        const aGrade = a.byGroup?.Black?.grade || 'Z';
        const bGrade = b.byGroup?.Black?.grade || 'Z';
        const gradeOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'N/A': 5, 'Z': 6 };
        return (gradeOrder[aGrade as keyof typeof gradeOrder] || 99) - (gradeOrder[bGrade as keyof typeof gradeOrder] || 99);
      });
    } else if (sortBy === 'disparity') {
      filtered.sort((a, b) => {
        const aHas = hasSignificantDisparity(a) ? 1 : 0;
        const bHas = hasSignificantDisparity(b) ? 1 : 0;
        return bHas - aHas;
      });
    } else if (sortBy === 'overall') {
      filtered.sort((a, b) => {
        const gradeOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'N/A': 5 };
        const aGrade = a.overallGrade || 'N/A';
        const bGrade = b.overallGrade || 'N/A';
        return (gradeOrder[aGrade as keyof typeof gradeOrder] || 99) - (gradeOrder[bGrade as keyof typeof gradeOrder] || 99);
      });
    }

    setFilteredRatings(filtered);
  }, [selectedLocation, sortBy, ratings]);

  /**
   * Get grade color
   */
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800 border-2 border-green-500';
      case 'B':
        return 'bg-green-100 text-green-800 border border-green-400';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-400';
      case 'D':
        return 'bg-red-200 text-red-900 border-2 border-red-600 font-bold';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get sentiment color and icon
   */
  const getSentimentDisplay = (sentiment: HospitalSentiment | undefined) => {
    if (!sentiment) {
      return {
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        icon: '😐',
        label: 'No reviews yet'
      };
    }
    
    if (sentiment.sentiment === 'positive') {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: '😊',
        label: 'Positive'
      };
    } else if (sentiment.sentiment === 'negative') {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: '😞',
        label: 'Negative'
      };
    } else {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: '😐',
        label: 'Neutral'
      };
    }
  };

  /**
   * Handle hospital card click
   */
  const handleHospitalClick = (hospitalId: string) => {
    router.push(`/hospitals/${hospitalId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-green-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left Corner */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-2xl font-bold text-green-600 hover:text-green-700 transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              Care Equity
            </button>
            
            {/* Navigation - Right Side */}
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/"
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200"
              >
                Home
              </Link>
              <Link 
                href="/quality-ratings-copy"
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200"
              >
                Ratings
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hospital Quality Ratings
          </h1>
          <p className="text-lg text-gray-600">
            Find hospitals with transparent ratings based on patient experiences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Filters</h2>
              
              {/* Location Filter */}
              <div className="mb-6">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 bg-white transition-all"
                >
                  <option value="all">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="mb-6">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 bg-white transition-all"
                >
                  <option value="none">No Sorting</option>
                  <option value="overall">Overall Rating</option>
                  <option value="black">Best for Black Patients</option>
                  <option value="disparity">Show Disparities First</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredRatings.length}</span> of{' '}
                  <span className="font-semibold text-gray-900">{ratings.length}</span> hospitals
                </p>
              </div>
            </div>
          </aside>

          {/* Right Side - Hospital Cards */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Loading hospitals...</p>
              </div>
            ) : filteredRatings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500">No hospitals found matching your filters.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredRatings.map((rating) => {
                  const sentiment = sentiments[rating.hospitalId];
                  const sentimentDisplay = getSentimentDisplay(sentiment);
                  const isLoadingSentiment = loadingSentiments[rating.hospitalId];
                  
                  return (
                    <div
                      key={rating.hospitalId}
                      onClick={() => handleHospitalClick(rating.hospitalId)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      {/* Hospital Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                            {rating.name}
                          </h3>
                          <p className="text-sm text-gray-600">{rating.location}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(rating.overallGrade)}`}>
                          {rating.overallGrade}
                        </span>
                      </div>

                      {/* Sentiment Section */}
                      <div className={`${sentimentDisplay.bgColor} rounded-lg p-4 mb-4`}>
                        {isLoadingSentiment ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                            <span className="text-sm text-gray-600">Loading sentiment...</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{sentimentDisplay.icon}</span>
                              <span className={`text-sm font-semibold ${sentimentDisplay.color}`}>
                                {sentimentDisplay.label}
                              </span>
                              {sentiment && (
                                <span className="text-xs text-gray-500 ml-auto">
                                  {sentiment.averageRating.toFixed(1)}/5.0 ({sentiment.totalReviews} reviews)
                                </span>
                              )}
                            </div>
                            {sentiment && (
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {sentiment.summary}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">Black</div>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getGradeColor(rating.byGroup?.Black?.grade || 'N/A')}`}>
                            {rating.byGroup?.Black?.grade || 'N/A'}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">White</div>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getGradeColor(rating.byGroup?.White?.grade || 'N/A')}`}>
                            {rating.byGroup?.White?.grade || 'N/A'}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600 mb-1">Hispanic</div>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getGradeColor(rating.byGroup?.Hispanic?.grade || 'N/A')}`}>
                            {rating.byGroup?.Hispanic?.grade || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Disparity Alert */}
                      {hasSignificantDisparity(rating) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Significant Disparity
                          </span>
                        </div>
                      )}

                      {/* View Details Link */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <span className="text-sm text-green-600 font-medium group-hover:text-green-700">
                          View Details →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-500 text-white py-12 mt-16">
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
                <li><Link href="/report" className="hover:text-white transition-colors">Anonymous Reporting</Link></li>
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
