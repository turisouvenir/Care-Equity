'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getApiBase } from '@/lib/api';

/**
 * Hospital Interface
 * 
 * Represents a hospital option for the dropdown
 */
interface Hospital {
  id: string;
  name: string;
  location: string;
}

/**
 * Report Form Component
 * 
 * Anonymous report form that allows users to:
 * - Select a hospital
 * - Provide a rating (1-5)
 * - Submit a written comment/review
 */
export default function ReportForm() {
  const router = useRouter();
  
  // State management
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [race, setRace] = useState<string>('');
  const [experienceType, setExperienceType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  /**
   * Fetch hospitals from backend API
   */
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${getApiBase()}/hospitals`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setHospitals(result.data);
        } else {
          toast.error('Failed to load hospitals. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        toast.error('Failed to load hospitals. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedHospital) {
      toast.error('Please select a hospital');
      return;
    }

    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    if (!race) {
      toast.error('Please select your race/ethnicity');
      return;
    }

    if (!experienceType) {
      toast.error('Please select the type of experience');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch(`${getApiBase()}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hospitalId: selectedHospital,
          rating: rating,
          comment: comment.trim(),
          race: race,
          experienceType: experienceType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Report submitted successfully! Thank you for sharing your experience.');
        // Reset form
        setSelectedHospital('');
        setRating(0);
        setComment('');
        setRace('');
        setExperienceType('');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/quality-ratings');
        }, 2000);
      } else {
        toast.error(result.message || 'Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
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
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Report Your Experience
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8">
                Your anonymous report helps improve healthcare transparency and equity
              </p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-8 md:py-12 bg-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg border border-green-100 p-8 md:p-10">
              {/* Privacy Notice */}
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-900 font-semibold text-sm mb-1">Your Privacy Matters</p>
                    <p className="text-blue-800 text-sm">
                      All reports are submitted anonymously. We do not collect any personal information that could identify you.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Hospital Selection */}
                <div>
                  <label htmlFor="hospital" className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Hospital <span className="text-red-500">*</span>
                  </label>
                  {loading ? (
                    <div className="px-4 py-3 border-2 border-green-200 rounded-lg bg-gray-50">
                      <p className="text-gray-500 text-sm">Loading hospitals...</p>
                    </div>
                  ) : (
                    <select
                      id="hospital"
                      value={selectedHospital}
                      onChange={(e) => setSelectedHospital(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 bg-white transition-all"
                      required
                      disabled={submitting}
                    >
                      <option value="">-- Select a hospital --</option>
                      {hospitals.map((hospital) => (
                        <option key={hospital.id} value={hospital.id}>
                          {hospital.name} - {hospital.location}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Rating Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Your Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        disabled={submitting}
                        className={`flex-1 py-4 px-4 rounded-lg font-semibold text-lg transition-all ${
                          rating === value
                            ? 'bg-green-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {value}
                        <span className="block text-xs mt-1">
                          {value === 1 ? 'Poor' : value === 2 ? 'Fair' : value === 3 ? 'Good' : value === 4 ? 'Very Good' : 'Excellent'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <input type="hidden" value={rating} required />
                </div>

                {/* Comment/Review */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-semibold text-gray-900 mb-2">
                    Your Review/Comment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 bg-white transition-all resize-y"
                    placeholder="Share your experience at this hospital. Your feedback helps others make informed decisions..."
                    required
                    disabled={submitting}
                    maxLength={5000}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    {comment.length} / 5000 characters
                  </p>
                </div>

                {/* Race/Ethnicity Selection */}
                <div>
                  <label htmlFor="race" className="block text-sm font-semibold text-gray-900 mb-2">
                    Race/Ethnicity <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="race"
                    value={race}
                    onChange={(e) => setRace(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 bg-white transition-all"
                    required
                    disabled={submitting}
                  >
                    <option value="">-- Select your race/ethnicity --</option>
                    <option value="Black">Black or African American</option>
                    <option value="White">White</option>
                    <option value="Hispanic">Hispanic or Latino</option>
                    <option value="Asian">Asian</option>
                    <option value="Native American">Native American or Alaska Native</option>
                    <option value="Pacific Islander">Native Hawaiian or Pacific Islander</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    This information is required to help us identify and address healthcare disparities. Your response is completely anonymous.
                  </p>
                </div>

                {/* Experience Type Selection */}
                <div>
                  <label htmlFor="experienceType" className="block text-sm font-semibold text-gray-900 mb-2">
                    Type of Experience <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="experienceType"
                    value={experienceType}
                    onChange={(e) => setExperienceType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 bg-white transition-all"
                    required
                    disabled={submitting}
                  >
                    <option value="">-- Select type of experience --</option>
                    <option value="Compliment">Compliment - Positive experience</option>
                    <option value="Complaint">Complaint - Negative experience</option>
                    <option value="Suggestion">Suggestion - Ideas for improvement</option>
                    <option value="General Feedback">General Feedback - Mixed or neutral experience</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Help us categorize your feedback to better understand and address healthcare experiences.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting || loading}
                    className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Anonymous Report'
                    )}
                  </button>
                  <Link
                    href="/quality-ratings"
                    className="px-6 py-4 border-2 border-green-600 text-green-600 rounded-lg font-semibold text-lg hover:bg-green-50 transition-all text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Your report will be used to calculate hospital ratings and identify healthcare disparities
              </p>
              <Link
                href="/quality-ratings"
                className="text-green-600 hover:text-green-700 font-medium text-sm underline"
              >
                View Hospital Quality Ratings →
              </Link>
            </div>
          </div>
        </section>
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
    </div>
  );
}
