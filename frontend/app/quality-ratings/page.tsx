'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { API_BASE } from '@/lib/api';

/**
 * HospitalRating Interface
 * 
 * TypeScript interface defining the structure of hospital rating data
 * that comes from the backend API endpoint /ratings
 */
interface HospitalRating {
  hospitalId: string;        // Unique hospital identifier (e.g., "HOSP_001")
  name: string;              // Hospital name
  city: string;              // City location
  state: string;             // State location
  location: string;          // Combined "City, State" string
  overallGrade: string;      // Overall letter grade (A, B, C, D)
  overallScore: number | null;      // Overall score (0-100) or null
  equityGapScore: number | null;     // Equity gap measure or null
  byGroup: {                 // Ratings broken down by demographic group
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
}

/**
 * QualityRatings Component
 * 
 * Main page component that displays hospital quality ratings in a filterable table.
 * Features:
 * - Fetches data from backend API
 * - Location dropdown filter (All Locations + specific cities)
 * - Animated table rows
 * - Responsive design
 */
export default function QualityRatings() {
  const router = useRouter();
  
  // State management for component data
  const [ratings, setRatings] = useState<HospitalRating[]>([]);           // All ratings from API
  const [filteredRatings, setFilteredRatings] = useState<HospitalRating[]>([]); // Filtered ratings for display
  const [selectedLocation, setSelectedLocation] = useState<string>('all'); // Selected location filter
  const [sortBy, setSortBy] = useState<'overall' | 'black' | 'disparity' | 'none'>('none'); // Sort option
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table'); // View mode (table or cards)
  const [loading, setLoading] = useState<boolean>(true);                  // Loading state
  const [locations, setLocations] = useState<string[]>([]);               // Unique locations for dropdown
  const [sentiments, setSentiments] = useState<Record<string, HospitalSentiment>>({}); // Sentiment data by hospital ID
  const [loadingSentiments, setLoadingSentiments] = useState<Record<string, boolean>>({}); // Loading state for sentiments
  const [selectedHospitalForChart, setSelectedHospitalForChart] = useState<string>('');
  const [chartTab, setChartTab] = useState<string>('overview');
  const [loadingSelectedSentiment, setLoadingSelectedSentiment] = useState<boolean>(false);
  const [selectedHospitalSentiment, setSelectedHospitalSentiment] = useState<HospitalSentiment | null>(null);

  /**
   * useEffect: Fetch ratings from backend API
   * 
   * Runs once when component mounts (empty dependency array []).
   * Fetches hospital ratings from the backend and populates the state.
   */
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/ratings`);
        const result = await response.json();
        
        // If API call was successful and data exists
        if (result.success && result.data) {
          setRatings(result.data);              // Store all ratings
          setFilteredRatings(result.data);      // Initially show all ratings
          
          // Extract unique locations from all hospitals
          // Creates array of unique "City, State" strings, sorted alphabetically
          const uniqueLocations = Array.from(
            new Set(result.data.map((r: HospitalRating) => r.location))
          ).sort() as string[];
          setLocations(uniqueLocations); // Populate dropdown options
          
          // Fetch sentiments for all hospitals
          fetchAllSentiments(result.data);
        } else {
          console.warn('No hospital data received from API');
        }
      } catch (error) {
        // Handle errors (network issues, API down, etc.)
        console.error('Error fetching ratings:', error);
      } finally {
        setLoading(false); // Hide loading spinner
      }
    };

    fetchRatings();
  }, []); // Empty array = run only once on mount

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
        const response = await fetch(`${API_BASE}/hospitals/${rating.hospitalId}/sentiment`);
        const result = await response.json();
        if (result.success && result.data) {
          sentimentMap[rating.hospitalId] = result.data;
        }
      } catch (error) {
        console.error(`Error fetching sentiment for ${rating.hospitalId}:`, error);
      }
    });
    
    await Promise.all(promises);
    
    // Update loading states
    const updatedLoadingMap: Record<string, boolean> = {};
    hospitalRatings.forEach(rating => {
      updatedLoadingMap[rating.hospitalId] = false;
    });
    setLoadingSentiments(updatedLoadingMap);
    setSentiments(sentimentMap);
  };

  /**
   * Fetch sentiment for selected hospital (for individual charts)
   */
  useEffect(() => {
    if (selectedHospitalForChart && chartTab === 'individual') {
      const fetchSelectedSentiment = async () => {
        try {
          setLoadingSelectedSentiment(true);
          const response = await fetch(`${API_BASE}/hospitals/${selectedHospitalForChart}/sentiment`);
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
    
    // Convert grades to numbers for comparison
    const gradeToNum = (g: string) => ({ 'A': 4, 'B': 3, 'C': 2, 'D': 1 }[g] || 0);
    const blackNum = gradeToNum(blackGrade);
    const whiteNum = gradeToNum(whiteGrade);
    
    // Significant disparity = 2+ grade difference
    return Math.abs(blackNum - whiteNum) >= 2;
  };

  /**
   * Helper: Calculate statistics for filtered hospitals
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
   * useEffect: Filter and sort ratings based on location and sort option
   * 
   * Runs whenever selectedLocation, sortBy, or ratings change.
   * Filters and sorts the ratings array and updates filteredRatings for display.
   */
  useEffect(() => {
    // Start with a copy of all ratings
    let filtered = [...ratings];

    // Filter by location if not "all"
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(r => r.location === selectedLocation);
    }

    // Apply sorting
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
        return bHas - aHas; // Show disparities first
      });
    } else if (sortBy === 'overall') {
      filtered.sort((a, b) => {
        const gradeOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'N/A': 5 };
        const aGrade = a.overallGrade || 'N/A';
        const bGrade = b.overallGrade || 'N/A';
        return (gradeOrder[aGrade as keyof typeof gradeOrder] || 99) - (gradeOrder[bGrade as keyof typeof gradeOrder] || 99);
      });
    }

    // Update filtered results (triggers table re-render)
    setFilteredRatings(filtered);
  }, [selectedLocation, sortBy, ratings]); // Re-run when these change

  /**
   * getGradeColor Helper Function
   * 
   * Returns Tailwind CSS classes for styling grade badges based on letter grade.
   * Enhanced with borders to make D grades more prominent.
   * 
   * @param grade - Letter grade (A, B, C, D, or N/A)
   * @returns Tailwind CSS class string for badge styling
   */
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800 border-2 border-green-500';  // Excellent - green with border
      case 'B':
        return 'bg-green-100 text-green-800 border border-green-400';  // Good - green with border
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-400'; // Fair - yellow with border
      case 'D':
        return 'bg-red-200 text-red-900 border-2 border-red-600 font-bold';      // Poor - darker red, bold, prominent border
      default:
        return 'bg-gray-100 text-gray-800';    // Unknown/N/A - gray
    }
  };

  /**
   * getDisparityBadge Helper Function
   * 
   * Returns a warning badge if the hospital has significant disparities
   * between racial groups (2+ grade difference).
   */
  const getDisparityBadge = (rating: HospitalRating) => {
    if (hasSignificantDisparity(rating)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          SIGNIFICANT DISPARITY
        </span>
      );
    }
    return null;
  };

  /**
   * getGroupGrade Helper Function
   * 
   * Extracts the grade for a specific demographic group from the byGroup object.
   * Returns 'N/A' if the group doesn't have a rating.
   * 
   * @param byGroup - Object containing ratings by demographic group
   * @param group - Which group to get the grade for ('Black', 'White', or 'Hispanic')
   * @returns Letter grade for that group or 'N/A'
   */
  const getGroupGrade = (byGroup: HospitalRating['byGroup'], group: 'Black' | 'White' | 'Hispanic') => {
    return byGroup[group]?.grade || 'N/A'; // Use optional chaining and default to 'N/A'
  };

  // Calculate stats for display
  const stats = !loading && ratings.length > 0 ? calculateStats(filteredRatings) : null;

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

  return (
    <div className="min-h-screen bg-white">
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
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200"
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
                Hospital Quality Ratings
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8">
                Transparent, data-driven ratings based on patient experiences and health outcomes by demographic
              </p>
            </div>
          </div>
        </section>

        {/* Grade Legend Section */}
        <section className="bg-green-50 py-6 border-b border-green-200">
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

        {/* Quick Stats Section */}
        {stats && (
          <section className="bg-white py-6 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          </section>
        )}

        {/* Charts Section - Visualizing Percentages and Disparities */}
        {!loading && filteredRatings.length > 0 && (
          <section className="bg-green-50 py-12 border-b border-green-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Rating Distribution by Demographic
                </h2>
                <p className="text-gray-600">
                  Percentage of hospitals by grade for each patient group
                </p>
              </div>

              {/* Comparison Bar Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  Grade Distribution Comparison (% of Hospitals)
                </h3>
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

              {/* Individual Pie Charts for Each Demographic */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Black Patients Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    Black Patients
                  </h3>
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
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Total: {gradeDistribution.black.reduce((sum, d) => sum + d.count, 0)} hospitals
                  </div>
                </div>

                {/* White Patients Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    White Patients
                  </h3>
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
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Total: {gradeDistribution.white.reduce((sum, d) => sum + d.count, 0)} hospitals
                  </div>
                </div>

                {/* Hispanic Patients Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    Hispanic Patients
                  </h3>
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
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Total: {gradeDistribution.hispanic.reduce((sum, d) => sum + d.count, 0)} hospitals
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="mt-8 bg-white rounded-xl shadow-sm border border-green-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <div>
                      <span className="font-semibold">Black Patients:</span> Only{' '}
                      {gradeDistribution.black.find(d => d.grade === 'A')?.percentage || 0}% receive A ratings
                      vs {gradeDistribution.white.find(d => d.grade === 'A')?.percentage || 0}% for White patients
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <div>
                      <span className="font-semibold">D Ratings:</span> {gradeDistribution.black.find(d => d.grade === 'D')?.percentage || 0}% 
                      of hospitals rate D for Black patients vs {gradeDistribution.white.find(d => d.grade === 'D')?.percentage || 0}% for White
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <div>
                      <span className="font-semibold">Disparity Gap:</span> {stats?.withDisparities || 0} hospitals 
                      ({Math.round(((stats?.withDisparities || 0) / (stats?.total || 1)) * 100)}%) show significant disparities
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Hospital Ratings Table - Right after hero section */}
        <section className="pt-0 pb-8 md:pb-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters and View Toggle */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
                {/* Location Filter */}
                <div className="flex-1">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Location
                  </label>
                  <select
                    id="location"
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

                {/* Sort Filter */}
                <div className="flex-1">
                  <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    id="sort"
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

              {/* View Toggle (Table/Cards) */}
              <div className="flex justify-center">
                <div className="flex gap-2 border border-green-200 rounded-lg p-1 bg-white">
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
                    onClick={() => setViewMode('cards')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'cards' 
                        ? 'bg-green-600 text-white' 
                        : 'text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    Card View
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State - Shows spinner while fetching data from API */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Loading ratings...</p>
              </div>
            )}

            {/* Table View - Displays filtered hospital ratings */}
            {!loading && viewMode === 'table' && (
              <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    {/* Table Header */}
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
                    {/* Table Body - Renders filtered ratings */}
                    <tbody className="divide-y divide-green-100">
                      {/* Empty State - Shows when no hospitals match filters */}
                      {filteredRatings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            No hospitals found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        // Map through filtered ratings and render each as a table row
                        filteredRatings.map((rating, index) => (
                          <tr
                            key={rating.hospitalId} // React key for list rendering
                            className="hover:bg-green-50 transition-all duration-300 ease-in-out" // Hover effect
                            style={{
                              // Animation: Each row fades in with a staggered delay
                              // index * 0.05s creates a cascading effect (row 0 = 0s, row 1 = 0.05s, etc.)
                              animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`,
                            }}
                          >
                            {/* Hospital Name - Clickable link to exact hospital address */}
                            <td className="px-6 py-4">
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${rating.name}, ${rating.location}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center gap-2 text-sm text-gray-900 font-medium hover:text-green-600 transition-all duration-300 cursor-pointer"
                              >
                                <span>{rating.name}</span>
                                <svg 
                                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 text-green-600" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
                                <span className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 text-xs text-green-600 font-medium whitespace-nowrap transition-all duration-300 pointer-events-none">
                                  View on Google Maps
                                </span>
                              </a>
                            </td>
                            
                            {/* Location (City, State) */}
                            <td className="px-6 py-4 text-sm text-gray-700">{rating.location}</td>
                            
                            {/* Overall Rating Badge */}
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(rating.overallGrade)}`}>
                                {rating.overallGrade}
                              </span>
                            </td>
                            
                            {/* Black Patients Rating Badge */}
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(getGroupGrade(rating.byGroup, 'Black'))}`}>
                                {getGroupGrade(rating.byGroup, 'Black')}
                              </span>
                            </td>
                            
                            {/* White Patients Rating Badge */}
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(getGroupGrade(rating.byGroup, 'White'))}`}>
                                {getGroupGrade(rating.byGroup, 'White')}
                              </span>
                            </td>
                            
                            {/* Hispanic Patients Rating Badge */}
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(getGroupGrade(rating.byGroup, 'Hispanic'))}`}>
                                {getGroupGrade(rating.byGroup, 'Hispanic')}
                              </span>
                            </td>
                            
                            {/* Reviews & Sentiment */}
                            <td className="px-6 py-4">
                              {loadingSentiments[rating.hospitalId] ? (
                                <span className="text-xs text-gray-400">Loading...</span>
                              ) : sentiments[rating.hospitalId] ? (
                                <div className="flex flex-col gap-1">
                                  <Link
                                    href={`/hospitals/${rating.hospitalId}`}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium"
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

            {/* Card View - Mobile-friendly card layout */}
            {!loading && viewMode === 'cards' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRatings.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No hospitals found matching your filters.
                  </div>
                ) : (
                  filteredRatings.map((rating, index) => (
                    <div
                      key={rating.hospitalId}
                      className="bg-white rounded-lg border border-green-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
                      style={{
                        animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${rating.name}, ${rating.location}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative inline-flex items-center gap-2 text-lg font-semibold text-gray-900 pr-2 hover:text-green-600 transition-all duration-300 cursor-pointer"
                        >
                          <span>{rating.name}</span>
                          <svg 
                            className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 text-green-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
                          <span className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 text-xs text-green-600 font-medium whitespace-nowrap transition-all duration-300 pointer-events-none">
                            View on Maps
                          </span>
                        </a>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{rating.location}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 font-medium">Overall:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(rating.overallGrade)}`}>
                            {rating.overallGrade}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 font-medium">Black:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(getGroupGrade(rating.byGroup, 'Black'))}`}>
                            {getGroupGrade(rating.byGroup, 'Black')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 font-medium">White:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(getGroupGrade(rating.byGroup, 'White'))}`}>
                            {getGroupGrade(rating.byGroup, 'White')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 font-medium">Hispanic:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(getGroupGrade(rating.byGroup, 'Hispanic'))}`}>
                            {getGroupGrade(rating.byGroup, 'Hispanic')}
                          </span>
                        </div>
                      </div>
                      {/* Reviews & Sentiment */}
                      <div className="mt-4 pt-4 border-t border-green-100">
                        {loadingSentiments[rating.hospitalId] ? (
                          <span className="text-xs text-gray-400">Loading reviews...</span>
                        ) : sentiments[rating.hospitalId] ? (
                          <div className="flex items-center justify-between">
                            <Link
                              href={`/hospitals/${rating.hospitalId}`}
                              className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              {sentiments[rating.hospitalId].totalReviews} review{sentiments[rating.hospitalId].totalReviews !== 1 ? 's' : ''}
                            </Link>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              sentiments[rating.hospitalId].sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                              sentiments[rating.hospitalId].sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sentiments[rating.hospitalId].sentiment}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No reviews yet</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {!loading && filteredRatings.length > 0 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing {filteredRatings.length} of {ratings.length} hospitals
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-4">
                * Ratings are based on aggregated patient reports and health outcome data
              </p>
              <Link
                href="/report"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Report Your Experience
              </Link>
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
                href="/report"
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
                <li><Link href="/quality-ratings" className="hover:text-white transition-colors">Ratings</Link></li>
                <li><Link href="/find-hospitals" className="hover:text-white transition-colors">Find Hospitals</Link></li>
                <li><Link href="/links" className="hover:text-white transition-colors">Newsletters</Link></li>
                <li><Link href="/report" className="hover:text-white transition-colors">Submit Anonymous Form</Link></li>
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
      {/* 
        fadeIn animation: Creates smooth fade-in effect for table rows
        - Starts invisible (opacity: 0) and slightly below (translateY(10px))
        - Animates to visible (opacity: 1) and normal position (translateY(0))
        - Used with staggered delays in table row rendering for cascading effect
      */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;              /* Start invisible */
            transform: translateY(10px); /* Start 10px below final position */
          }
          to {
            opacity: 1;              /* End fully visible */
            transform: translateY(0); /* End at normal position */
          }
        }
      `}</style>
    </div>
  );
}
