'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getApiBase } from '@/lib/api';

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

interface HospitalSentiment {
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * QualityRatings Component - Merged version with card view, table view, and charts
 */
export default function QualityRatings() {
  const router = useRouter();
  const pathname = usePathname();
  
  // State management
  const [ratings, setRatings] = useState<HospitalRating[]>([]);
  const [filteredRatings, setFilteredRatings] = useState<HospitalRating[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'overall' | 'black' | 'disparity' | 'none'>('none');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'charts'>('cards');
  const [chartTab, setChartTab] = useState<'individual' | 'general'>('general');
  const [selectedHospitalForChart, setSelectedHospitalForChart] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [locations, setLocations] = useState<string[]>([]);
  const [sentiments, setSentiments] = useState<Record<string, HospitalSentiment>>({});
  const [loadingSentiments, setLoadingSentiments] = useState<Record<string, boolean>>({});
  const [selectedHospitalSentiment, setSelectedHospitalSentiment] = useState<HospitalSentiment | null>(null);
  const [loadingSelectedSentiment, setLoadingSelectedSentiment] = useState<boolean>(false);

  /**
   * Fetch ratings from backend API
   */
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${getApiBase()}/ratings`);
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
        const response = await fetch(`${getApiBase()}/hospitals/${rating.hospitalId}/sentiment`);
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
   * Fetch sentiment for selected hospital (for individual charts)
   */
  useEffect(() => {
    if (selectedHospitalForChart && chartTab === 'individual') {
      const fetchSelectedSentiment = async () => {
        try {
          setLoadingSelectedSentiment(true);
          const response = await fetch(`${getApiBase()}/hospitals/${selectedHospitalForChart}/sentiment`);
          const result = await response.json();
          if (result.success && result.data) {
            setSelectedHospitalSentiment(result.data);
          }
        } catch (error) {
          console.error('Error fetching selected hospital sentiment:', error);
        } finally {
          setLoadingSelectedSentiment(false);
        }
      };
      fetchSelectedSentiment();
    }
  }, [selectedHospitalForChart, chartTab]);

  /**
   * Check if hospital has significant disparity (2+ grade difference between Black and White patients)
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
   * Calculate statistics for filtered hospitals
   */
  const calculateStats = (ratings: HospitalRating[]) => {
    const total = ratings.length;
    const withDisparities = ratings.filter(hasSignificantDisparity).length;
    const excellentAll = ratings.filter(r => 
      r.byGroup?.Black?.grade === 'A' && 
      r.byGroup?.White?.grade === 'A' && 
      r.byGroup?.Hispanic?.grade === 'A'
    ).length;
    const concerningMultiple = ratings.filter(r => {
      const grades = [r.byGroup?.Black?.grade, r.byGroup?.White?.grade, r.byGroup?.Hispanic?.grade].filter(Boolean);
      return grades.filter(g => g === 'C' || g === 'D').length >= 2;
    }).length;
    
    return { total, withDisparities, excellentAll, concerningMultiple };
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
   * Get group grade helper
   */
  const getGroupGrade = (byGroup: HospitalRating['byGroup'], group: 'Black' | 'White' | 'Hispanic') => {
    return byGroup[group]?.grade || 'N/A';
  };

  /**
   * Calculate grade distribution percentages by demographic group
   */
  const calculateGradeDistribution = (ratings: HospitalRating[]) => {
    const total = ratings.length;
    if (total === 0) return { black: [], white: [], hispanic: [] };

    const gradeCounts = {
      black: { A: 0, B: 0, C: 0, D: 0 },
      white: { A: 0, B: 0, C: 0, D: 0 },
      hispanic: { A: 0, B: 0, C: 0, D: 0 },
    };

    ratings.forEach(r => {
      const blackGrade = r.byGroup?.Black?.grade;
      const whiteGrade = r.byGroup?.White?.grade;
      const hispanicGrade = r.byGroup?.Hispanic?.grade;

      if (blackGrade && ['A', 'B', 'C', 'D'].includes(blackGrade)) {
        gradeCounts.black[blackGrade as keyof typeof gradeCounts.black]++;
      }
      if (whiteGrade && ['A', 'B', 'C', 'D'].includes(whiteGrade)) {
        gradeCounts.white[whiteGrade as keyof typeof gradeCounts.white]++;
      }
      if (hispanicGrade && ['A', 'B', 'C', 'D'].includes(hispanicGrade)) {
        gradeCounts.hispanic[hispanicGrade as keyof typeof gradeCounts.hispanic]++;
      }
    });

    const formatData = (counts: typeof gradeCounts.black, groupName: string) => {
      return ['A', 'B', 'C', 'D'].map(grade => ({
        grade,
        count: counts[grade as keyof typeof counts],
        percentage: total > 0 ? Math.round((counts[grade as keyof typeof counts] / total) * 100) : 0,
        group: groupName,
      }));
    };

    return {
      black: formatData(gradeCounts.black, 'Black'),
      white: formatData(gradeCounts.white, 'White'),
      hispanic: formatData(gradeCounts.hispanic, 'Hispanic'),
    };
  };

  // Calculate stats for display
  const stats = !loading && ratings.length > 0 ? calculateStats(filteredRatings) : null;

  // Calculate grade distribution for charts
  const gradeDistribution = !loading && filteredRatings.length > 0 
    ? calculateGradeDistribution(filteredRatings) 
    : { black: [], white: [], hispanic: [] };

  // Prepare data for comparison chart
  const comparisonData = ['A', 'B', 'C', 'D'].map(grade => ({
    grade,
    Black: gradeDistribution.black.find(d => d.grade === grade)?.percentage || 0,
    White: gradeDistribution.white.find(d => d.grade === grade)?.percentage || 0,
    Hispanic: gradeDistribution.hispanic.find(d => d.grade === grade)?.percentage || 0,
  }));

  // Colors for charts
  const gradeColors = {
    A: '#10b981', // green-500
    B: '#34d399', // green-400
    C: '#fbbf24', // yellow-400
    D: '#ef4444', // red-500
  };

  // Prepare individual hospital chart data
  const selectedHospital = ratings.find(r => r.hospitalId === selectedHospitalForChart);
  const ratingDistributionData = selectedHospitalSentiment && selectedHospitalSentiment.ratingDistribution
    ? [
        { name: '5 Stars', value: selectedHospitalSentiment.ratingDistribution[5] || 0, color: '#10b981' },
        { name: '4 Stars', value: selectedHospitalSentiment.ratingDistribution[4] || 0, color: '#34d399' },
        { name: '3 Stars', value: selectedHospitalSentiment.ratingDistribution[3] || 0, color: '#fbbf24' },
        { name: '2 Stars', value: selectedHospitalSentiment.ratingDistribution[2] || 0, color: '#f59e0b' },
        { name: '1 Star', value: selectedHospitalSentiment.ratingDistribution[1] || 0, color: '#ef4444' },
      ].filter(item => item.value > 0)
    : [];

  const demographicComparisonData = selectedHospital ? [
    {
      group: 'Black',
      grade: selectedHospital.byGroup?.Black?.grade || 'N/A',
      score: selectedHospital.byGroup?.Black?.score || 0,
    },
    {
      group: 'White',
      grade: selectedHospital.byGroup?.White?.grade || 'N/A',
      score: selectedHospital.byGroup?.White?.score || 0,
    },
    {
      group: 'Hispanic',
      grade: selectedHospital.byGroup?.Hispanic?.grade || 'N/A',
      score: selectedHospital.byGroup?.Hispanic?.score || 0,
    },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-green-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left Corner */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-2xl font-bold text-green-600 hover:text-green-700 transition-colors cursor-pointer bg-transparent border-none p-0 hover:scale-105"
            >
              <img src="/icon.png" alt="Care Equity" className="w-8 h-8" />
              <span>Care Equity</span>
            </button>
            
            {/* Navigation - Right Side */}
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/"
                className={`px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  pathname === '/' 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/quality-ratings"
                className={`px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  pathname === '/quality-ratings' 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                Ratings
              </Link>
              <Link 
                href="/find-hospitals"
                className={`px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  pathname === '/find-hospitals' 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                Find Hospitals
              </Link>
              <Link 
                href="/links"
                className={`px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  pathname === '/links' 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Hospital Quality Ratings
              </h1>
          <p className="text-lg text-gray-600">
            Find hospitals with transparent ratings based on patient experiences
              </p>
            </div>

        {/* Grade Legend Section */}
        <section className="bg-green-50 py-6 border-b border-green-200 rounded-lg mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm mb-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border-2 border-green-500">A</span>
                <span className="text-gray-700">Excellent - Minimal disparities</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-400">B</span>
                <span className="text-gray-700">Good - Some equity gaps</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-400">C</span>
                <span className="text-gray-700">Fair - Notable disparities</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-200 text-red-900 border-2 border-red-600 font-bold">D</span>
                <span className="text-gray-700">Poor - Major disparities</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-600">
              Grades based on maternal mortality, severe complications, and patient safety measures
            </p>
          </div>
        </section>

        {/* View Mode Toggle */}
        <div className="mb-6 flex justify-center">
          <div className="flex gap-2 border border-green-200 rounded-lg p-1 bg-white">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-700 hover:bg-green-50'
              }`}
            >
              Card View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-700 hover:bg-green-50'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('charts')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'charts' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-700 hover:bg-green-50'
              }`}
            >
              Charts
            </button>
          </div>
        </div>

        {/* Card View */}
        {viewMode === 'cards' && (
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
                        onClick={() => router.push(`/hospitals/${rating.hospitalId}`)}
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
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="location-table" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Location
                </label>
                <select
                  id="location-table"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 bg-white transition-all"
                >
                  <option value="all">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label htmlFor="sort-table" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sort-table"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 bg-white transition-all"
                >
                  <option value="none">No Sorting</option>
                  <option value="overall">Overall Rating</option>
                  <option value="black">Best for Black Patients</option>
                  <option value="disparity">Show Disparities First</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Loading ratings...</p>
              </div>
            )}

            {/* Table */}
            {!loading && (
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
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reviews</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-100">
                      {filteredRatings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            No hospitals found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredRatings.map((rating, index) => (
                          <tr
                            key={rating.hospitalId}
                            onClick={() => router.push(`/hospitals/${rating.hospitalId}`)}
                            className="hover:bg-green-50 transition-all duration-300 ease-in-out cursor-pointer"
                            style={{
                              animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`,
                            }}
                          >
                            <td className="px-6 py-4">
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="group relative inline-flex items-center gap-2"
                              >
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${rating.name}, ${rating.location}`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-gray-900 font-medium hover:text-green-600 transition-all duration-300"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {rating.name}
                                </a>
                                <svg 
                                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 text-green-600" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">{rating.location}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(rating.overallGrade)}`}>
                                {rating.overallGrade}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(getGroupGrade(rating.byGroup, 'Black'))}`}>
                                {getGroupGrade(rating.byGroup, 'Black')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(getGroupGrade(rating.byGroup, 'White'))}`}>
                                {getGroupGrade(rating.byGroup, 'White')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(getGroupGrade(rating.byGroup, 'Hispanic'))}`}>
                                {getGroupGrade(rating.byGroup, 'Hispanic')}
                              </span>
                            </td>
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              {loadingSentiments[rating.hospitalId] ? (
                                <span className="text-xs text-gray-400">Loading...</span>
                              ) : sentiments[rating.hospitalId] ? (
                                <div className="flex flex-col gap-1">
                                  <Link
                                    href={`/hospitals/${rating.hospitalId}`}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {sentiments[rating.hospitalId].totalReviews} review{sentiments[rating.hospitalId].totalReviews !== 1 ? 's' : ''}
                                  </Link>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    sentiments[rating.hospitalId].sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                    sentiments[rating.hospitalId].sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {sentiments[rating.hospitalId].sentiment}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">No reviews</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Charts View */}
        {viewMode === 'charts' && (
          <div className="space-y-6 w-full">
            {/* Chart Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setChartTab('general')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      chartTab === 'general'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    General Statistics
                  </button>
                  <button
                    onClick={() => setChartTab('individual')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      chartTab === 'individual'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Individual Hospitals
                  </button>
                </nav>
              </div>
            </div>

            {/* General Statistics Tab */}
            {chartTab === 'general' && (
              <div className="space-y-6 w-full min-h-[400px]">
                {!loading && filteredRatings.length > 0 ? (
                  <>
                    {/* Quick Stats */}
                    {stats && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Hospitals Shown</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{stats.withDisparities}</div>
                  <div className="text-sm text-gray-600">With Significant Disparities</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.excellentAll}</div>
                  <div className="text-sm text-gray-600">Excellent Across All Groups</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.concerningMultiple}</div>
                  <div className="text-sm text-gray-600">Concerning Ratings</div>
                        </div>
                      </div>
                    </div>
                    )}

              {/* Comparison Bar Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 w-full overflow-hidden">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                        Grade Distribution Comparison (% of Hospitals)
                      </h3>
                      <div className="w-full overflow-hidden">
                        <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="grade" 
                      stroke="#6b7280"
                      tick={{ fill: '#374151', fontSize: 14, fontWeight: 600 }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fill: '#374151', fontSize: 12 }}
                      label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                    />
                    <Tooltip 
                      formatter={(value: number | undefined) => [`${value || 0}%`, '']}
                      contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="square"
                    />
                          <Bar dataKey="Black" fill="#ef4444" name="Black Patients" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="White" fill="#10b981" name="White Patients" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Hispanic" fill="#3b82f6" name="Hispanic Patients" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Individual Pie Charts for Each Demographic */}
                    <div className="grid md:grid-cols-3 gap-6 w-full">
                      {/* Black Patients Pie Chart */}
                      <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 w-full overflow-hidden">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                          Black Patients
                        </h3>
                        <div className="w-full overflow-hidden">
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={gradeDistribution.black}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry: any) => `${entry.grade}: ${entry.percentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                              >
                                {gradeDistribution.black.map((entry, index) => (
                                  <Cell key={`cell-black-${index}`} fill={gradeColors[entry.grade as keyof typeof gradeColors]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number | undefined, name: string | undefined, props: any) => [
                                `${props.payload.percentage}% (${value || 0} hospitals)`,
                                props.payload.grade || ''
                              ]} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 text-center text-sm text-gray-600">
                          Total: {gradeDistribution.black.reduce((sum, d) => sum + d.count, 0)} hospitals
                        </div>
                      </div>

                      {/* White Patients Pie Chart */}
                      <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 w-full overflow-hidden">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                          White Patients
                        </h3>
                        <div className="w-full overflow-hidden">
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={gradeDistribution.white}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry: any) => `${entry.grade}: ${entry.percentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                              >
                                {gradeDistribution.white.map((entry, index) => (
                                  <Cell key={`cell-white-${index}`} fill={gradeColors[entry.grade as keyof typeof gradeColors]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number | undefined, name: string | undefined, props: any) => [
                                `${props.payload.percentage}% (${value || 0} hospitals)`,
                                props.payload.grade || ''
                              ]} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 text-center text-sm text-gray-600">
                          Total: {gradeDistribution.white.reduce((sum, d) => sum + d.count, 0)} hospitals
                        </div>
                      </div>

                      {/* Hispanic Patients Pie Chart */}
                      <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 w-full overflow-hidden">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                          Hispanic Patients
                        </h3>
                        <div className="w-full overflow-hidden">
                          <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={gradeDistribution.hispanic}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.grade}: ${entry.percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {gradeDistribution.hispanic.map((entry, index) => (
                          <Cell key={`cell-hispanic-${index}`} fill={gradeColors[entry.grade as keyof typeof gradeColors]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number | undefined, name: string | undefined, props: any) => [
                        `${props.payload.percentage}% (${value || 0} hospitals)`,
                        props.payload.grade || ''
                      ]} />
                    </PieChart>
                  </ResponsiveContainer>
                    </div>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Total: {gradeDistribution.hispanic.reduce((sum, d) => sum + d.count, 0)} hospitals
                  </div>
                </div>
              </div>

              {/* Key Insights */}
                <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 w-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Key Insights</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                      <span className="text-red-600 font-bold text-xl mt-0.5">•</span>
                      <div className="text-base text-gray-800 leading-relaxed">
                        <span className="font-bold text-gray-900">Black Patients:</span> Only{' '}
                        <span className="font-semibold text-red-600">{gradeDistribution.black.find(d => d.grade === 'A')?.percentage || 0}%</span> receive A ratings
                        vs <span className="font-semibold text-green-600">{gradeDistribution.white.find(d => d.grade === 'A')?.percentage || 0}%</span> for White patients
                    </div>
                  </div>
                    <div className="flex items-start gap-3">
                      <span className="text-red-600 font-bold text-xl mt-0.5">•</span>
                      <div className="text-base text-gray-800 leading-relaxed">
                        <span className="font-bold text-gray-900">D Ratings:</span> <span className="font-semibold text-red-600">{gradeDistribution.black.find(d => d.grade === 'D')?.percentage || 0}%</span> 
                        {' '}of hospitals rate D for Black patients vs <span className="font-semibold text-green-600">{gradeDistribution.white.find(d => d.grade === 'D')?.percentage || 0}%</span> for White
                    </div>
                  </div>
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-600 font-bold text-xl mt-0.5">•</span>
                      <div className="text-base text-gray-800 leading-relaxed">
                        <span className="font-bold text-gray-900">Disparity Gap:</span> <span className="font-semibold text-yellow-600">{stats?.withDisparities || 0}</span> hospitals 
                      ({Math.round(((stats?.withDisparities || 0) / (stats?.total || 1)) * 100)}%) show significant disparities
                    </div>
                  </div>
                </div>
              </div>
                  </>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center w-full">
                    <p className="text-gray-500">No data available to display statistics.</p>
                  </div>
                )}
              </div>
            )}

            {/* Individual Hospitals Tab */}
            {chartTab === 'individual' && (
              <div className="space-y-6 min-w-7xl mx-auto min-h-[400px]">
                {/* Hospital Selector */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full">
                  <label htmlFor="hospital-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select a Hospital
                  </label>
                  <select
                    id="hospital-select"
                    value={selectedHospitalForChart}
                    onChange={(e) => setSelectedHospitalForChart(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 bg-white transition-all"
                  >
                    <option value="">-- Select a hospital --</option>
                    {ratings.map((rating) => (
                      <option key={rating.hospitalId} value={rating.hospitalId}>
                        {rating.name} - {rating.location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Charts for Selected Hospital */}
                {selectedHospitalForChart && selectedHospital && (
                  <div className="space-y-6 w-full">
                    {/* Hospital Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedHospital.name}</h2>
                      <p className="text-lg text-gray-600 mb-4">{selectedHospital.location}</p>
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getGradeColor(selectedHospital.overallGrade)}`}>
                          Overall: {selectedHospital.overallGrade}
                        </span>
                        {selectedHospitalSentiment && (
                          <div className="text-sm text-gray-600">
                            {selectedHospitalSentiment.averageRating.toFixed(1)}/5.0 from {selectedHospitalSentiment.totalReviews} reviews
                </div>
                        )}
              </div>
            </div>

                    {/* Loading State */}
                    {loadingSelectedSentiment && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        <p className="mt-4 text-gray-600">Loading hospital data...</p>
              </div>
            )}

                    {/* Rating Distribution Chart */}
                    {!loadingSelectedSentiment && ratingDistributionData.length > 0 && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full overflow-hidden">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Rating Distribution</h2>
                        <div className="w-full">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={ratingDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry: any) => `${entry.name}: ${entry.value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {ratingDistributionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                </div>
              </div>
            )}

                    {/* Demographic Comparison Chart */}
                    {!loadingSelectedSentiment && demographicComparisonData.length > 0 && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full overflow-hidden">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Demographic Comparison</h2>
                        <div className="w-full overflow-hidden">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={demographicComparisonData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="group" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="score" fill="#10b981" name="Score" />
                            </BarChart>
                          </ResponsiveContainer>
                  </div>
              </div>
            )}

                    {/* No Data Message */}
                    {!loadingSelectedSentiment && !selectedHospitalSentiment && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 mb-4">No review data available for this hospital.</p>
              <Link
                          href={`/hospitals/${selectedHospitalForChart}`}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                          View Hospital Details
              </Link>
            </div>
                    )}
          </div>
                )}

                {/* No Hospital Selected */}
                {!selectedHospitalForChart && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center w-full">
                    <p className="text-gray-500">Please select a hospital to view its charts.</p>
            </div>
                )}
                </div>
            )}
              </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-green-500 text-white py-12 mt-auto">
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
              Code 2040 Hackathon 2026. Team 15.
            </p>
          </div>
        </div>
      </footer>

      {/* CSS Animation for Table Rows */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
