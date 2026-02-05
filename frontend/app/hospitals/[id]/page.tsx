'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * Hospital Rating Interface
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
 * Review Interface
 */
interface Review {
  _id: string;
  hospitalId: string;
  rating: number;
  comment: string;
  createdAt: string;
  isAnonymous: boolean;
  race?: string;
  experienceType?: string;
}

/**
 * Sentiment Interface
 */
interface Sentiment {
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Hospital Detail Page
 */
export default function HospitalDetail() {
  const router = useRouter();
  const params = useParams();
  const hospitalId = params?.id as string;

  const [hospital, setHospital] = useState<HospitalRating | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'ratings'>('overview');

  useEffect(() => {
    if (hospitalId) {
      fetchHospitalData();
    }
  }, [hospitalId]);

  /**
   * Fetch hospital data, reviews, and sentiment
   */
  const fetchHospitalData = async () => {
    try {
      setLoading(true);

      // Fetch hospital rating
      const ratingsResponse = await fetch('http://localhost:5001/ratings');
      const ratingsResult = await ratingsResponse.json();
      
      if (ratingsResult.success && ratingsResult.data) {
        const hospitalData = ratingsResult.data.find((r: HospitalRating) => r.hospitalId === hospitalId);
        if (hospitalData) {
          setHospital(hospitalData);
        }
      }

      // Fetch reviews
      const reviewsResponse = await fetch(`http://localhost:5001/hospitals/${hospitalId}/reviews`);
      const reviewsResult = await reviewsResponse.json();
      if (reviewsResult.success && reviewsResult.data) {
        setReviews(reviewsResult.data);
      }

      // Fetch sentiment
      const sentimentResponse = await fetch(`http://localhost:5001/hospitals/${hospitalId}/sentiment`);
      const sentimentResult = await sentimentResponse.json();
      if (sentimentResult.success && sentimentResult.data) {
        setSentiment(sentimentResult.data);
      }
    } catch (error) {
      console.error('Error fetching hospital data:', error);
    } finally {
      setLoading(false);
    }
  };

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
   * Get rating star display
   */
  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Get experience type styling based on type
   */
  const getExperienceTypeStyle = (type: string) => {
    switch (type) {
      case 'Compliment':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-600',
          iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' // Checkmark
        };
      case 'Complaint':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-600',
          iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' // X circle
        };
      case 'Suggestion':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-600',
          iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' // Lightbulb
        };
      case 'General Feedback':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-600',
          iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' // Chat
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-600',
          iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading hospital details...</p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hospital Not Found</h1>
          <Link href="/quality-ratings" className="text-green-600 hover:text-green-700">
            ← Back to Hospital List
          </Link>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const ratingDistributionData = sentiment && sentiment.ratingDistribution
    ? [
        { name: '5 Stars', value: sentiment.ratingDistribution[5] || 0, color: '#10b981' },
        { name: '4 Stars', value: sentiment.ratingDistribution[4] || 0, color: '#34d399' },
        { name: '3 Stars', value: sentiment.ratingDistribution[3] || 0, color: '#fbbf24' },
        { name: '2 Stars', value: sentiment.ratingDistribution[2] || 0, color: '#f59e0b' },
        { name: '1 Star', value: sentiment.ratingDistribution[1] || 0, color: '#ef4444' },
      ].filter(item => item.value > 0)
    : [];

  const demographicComparisonData = [
    {
      group: 'Black',
      grade: hospital.byGroup?.Black?.grade || 'N/A',
      score: hospital.byGroup?.Black?.score || 0,
    },
    {
      group: 'White',
      grade: hospital.byGroup?.White?.grade || 'N/A',
      score: hospital.byGroup?.White?.score || 0,
    },
    {
      group: 'Hispanic',
      grade: hospital.byGroup?.Hispanic?.grade || 'N/A',
      score: hospital.byGroup?.Hispanic?.score || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-green-200 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-6 flex justify-between">
          <Link 
            href="/quality-ratings"
            className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200 border border-gray-200 hover:border-green-300"
          >
            ← Back to List
          </Link>
          <Link 
            href="/report"
            className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md text-base font-medium hover:bg-green-700 transition-all duration-200 shadow-sm"
          >
            Submit Review
          </Link>
        </div>

        {/* Hospital Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{hospital.name}</h1>
              <p className="text-lg text-gray-600">{hospital.location}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getGradeColor(hospital.overallGrade)}`}>
                  Overall: {hospital.overallGrade}
                </span>
              </div>
              {sentiment && (
                <div className="text-sm text-gray-600">
                  {sentiment.averageRating.toFixed(1)}/5.0 from {sentiment.totalReviews} reviews
                </div>
              )}
            </div>
          </div>

          {/* Sentiment Summary */}
          {sentiment && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-700 leading-relaxed">{sentiment.summary}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('ratings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'ratings'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ratings & Charts
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6 w-full">
            {/* Key Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Metrics</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Overall Score</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {hospital.overallScore !== null ? hospital.overallScore : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Equity Gap Score</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {hospital.equityGapScore !== null ? hospital.equityGapScore.toFixed(2) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Total Reviews</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {sentiment?.totalReviews || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Demographic Ratings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ratings by Demographic</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {demographicComparisonData.map((item) => (
                  <div key={item.group} className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">{item.group} Patients</div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(item.grade)}`}>
                        {item.grade}
                      </span>
                      {item.score > 0 && (
                        <span className="text-sm text-gray-600">Score: {item.score}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4 w-full">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500 mb-4">No reviews yet for this hospital.</p>
                <Link
                  href="/report"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Be the first to review
                </Link>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        {getRatingStars(review.rating)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{review.rating}/5</span>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3 break-words">{review.comment}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-gray-500">Anonymous Review</span>
                      {review.race && (
                        <span className="inline-flex items-center text-xs text-gray-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                          <svg className="w-3 h-3 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {review.race}
                        </span>
                      )}
                      {review.experienceType && (() => {
                        const style = getExperienceTypeStyle(review.experienceType);
                        return (
                          <span className={`inline-flex items-center text-xs ${style.text} ${style.bg} px-2.5 py-1 rounded-md border ${style.border}`}>
                            <svg className={`w-3 h-3 mr-1.5 ${style.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.iconPath} />
                            </svg>
                            {review.experienceType}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="space-y-6 w-full">
            {/* Rating Distribution Chart */}
            {ratingDistributionData.length > 0 && (
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

            {/* Grade Comparison */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Grade Comparison by Demographic</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {demographicComparisonData.map((item) => (
                  <div key={item.group} className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">{item.group} Patients</div>
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getGradeColor(item.grade)}`}>
                      {item.grade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-green-500 text-white py-12 mt-auto w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="border-t border-green-500 pt-8 text-center">
            <p className="text-sm text-green-50">
              © 2026 Care Equity. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
