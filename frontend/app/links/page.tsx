'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getApiBase } from '@/lib/api';

/**
 * Article Interface
 */
interface Article {
  _id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  date?: string;
}

/**
 * Statistics Page - Healthcare Equity Articles and References
 */
export default function Statistics() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  /**
   * Fetch articles from backend API
   */
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`${getApiBase()}/articles`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Handle both cases: data exists or empty array
          setArticles(result.data || []);
          if (result.data && result.data.length === 0) {
            // No error, just empty - this is fine
            console.log('No articles found in database. Consider seeding articles.');
          }
        } else {
          setError(result.message || 'Failed to load articles. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        // Check if it's a network error (Failed to fetch)
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setError('Cannot connect to backend server. Please check your connection and try again.');
        } else {
          const errorMessage = error instanceof Error 
            ? `Failed to load articles: ${error.message}` 
            : 'Failed to load articles. Please check your connection and ensure the backend server is running.';
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Healthcare Equity Statistics & Research
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Explore research articles, studies, and reports that highlight healthcare disparities and the importance of equitable care delivery.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && articles.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <a
                key={article._id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col"
              >
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {article.description}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    {article.source}
                  </span>
                  {article.date && (
                    <span className="text-xs text-gray-400">
                      {article.date}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600 font-medium group-hover:text-green-700">
                  Read Article
                  <svg 
                    className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 mb-4">No articles available at this time.</p>
            <p className="text-sm text-gray-400">
              Articles need to be seeded in the database. Contact an administrator or use the seed endpoint.
            </p>
          </div>
        )}

        {/* Additional Resources Section */}
        <div className="mt-12 bg-green-50 rounded-lg border border-green-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Additional Resources
          </h2>
          <p className="text-gray-700 mb-6">
            For more information about healthcare equity and how to advocate for better care, visit these organizations:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Organizations</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Centers for Disease Control and Prevention (CDC)</li>
                <li>• Agency for Healthcare Research and Quality (AHRQ)</li>
                <li>• National Institutes of Health (NIH)</li>
                <li>• Commonwealth Fund</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Involved</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Report your healthcare experience anonymously</li>
                <li>• Share hospital ratings with your community</li>
                <li>• Advocate for healthcare equity in your area</li>
                <li>• Support organizations working for change</li>
              </ul>
            </div>
          </div>
        </div>
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
