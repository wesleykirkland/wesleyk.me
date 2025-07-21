'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { sanitizeCatUrl } from '@/lib/urlSanitizer';

interface CatData {
  success: boolean;
  image?: string;
  filename?: string;
  url?: string;
  timestamp?: string;
  fileSize?: number;
  lastModified?: string;
  totalCats?: number;
  error?: string;
  message?: string;
}

interface RandomCatProps {
  showInfo?: boolean;
  autoRefresh?: number; // Auto refresh interval in seconds
  className?: string;
}

export default function RandomCat({
  showInfo = false,
  autoRefresh,
  className = ''
}: Readonly<RandomCatProps>) {
  const [catData, setCatData] = useState<CatData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomCat = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = showInfo ? '/api/cat?info=true' : '/api/cat';
      const response = await fetch(url);
      const data: CatData = await response.json();

      if (data.success) {
        // Sanitize the URL before setting the data
        const sanitizedData = {
          ...data,
          url: data.url ? sanitizeCatUrl(data.url) : data.url
        };
        setCatData(sanitizedData);
      } else {
        setError(data.error ?? 'Failed to fetch cat image');
      }
    } catch (err) {
      setError('Network error: Failed to fetch cat image');
      console.error('Error fetching cat:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRandomCat();
  }, [showInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && autoRefresh > 0) {
      const interval = setInterval(fetchRandomCat, autoRefresh * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (error) {
    return (
      <div
        className={`p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}
      >
        <div className="flex items-center mb-4">
          <div className="text-4xl mr-3">😿</div>
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              No Cats Found
            </h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
        <div className="text-sm text-red-600 dark:text-red-400">
          <p>To fix this:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>
              Add cat images to the{' '}
              <code className="bg-red-100 dark:bg-red-800 px-1 rounded">
                /public/cats
              </code>{' '}
              directory
            </li>
            <li>Supported formats: .jpg, .jpeg, .png, .gif, .webp</li>
            <li>Refresh this component</li>
          </ol>
        </div>
        <button
          onClick={fetchRandomCat}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🐱 Random Cat
        </h3>
        <button
          onClick={fetchRandomCat}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : 'New Cat'}
        </button>
      </div>

      {loading && !catData && (
        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-2">🐱</div>
            <p className="text-gray-600 dark:text-gray-300">Loading cat...</p>
          </div>
        </div>
      )}

      {catData?.image && (
        <div>
          <div className="relative mb-4">
            <Image
              src={catData.image}
              alt={`Random cat: ${catData.filename}`}
              width={400}
              height={300}
              className="w-full h-64 object-cover rounded-lg"
              unoptimized={true} // Since we're serving random images
            />
            {loading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <div className="animate-spin text-4xl mb-2">🐱</div>
                  <p>Loading new cat...</p>
                </div>
              </div>
            )}
          </div>

          {showInfo && (
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Filename:</strong> {catData.filename}
                </div>
                {catData.totalCats && (
                  <div>
                    <strong>Total Cats:</strong> {catData.totalCats}
                  </div>
                )}
                {catData.fileSize && (
                  <div>
                    <strong>File Size:</strong>{' '}
                    {formatFileSize(catData.fileSize)}
                  </div>
                )}
                {catData.lastModified && (
                  <div>
                    <strong>Last Modified:</strong>{' '}
                    {formatDate(catData.lastModified)}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <strong>Direct URL:</strong>{' '}
                {(() => {
                  const safeUrl = sanitizeCatUrl(catData.url ?? '');
                  return safeUrl ? (
                    <a
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {safeUrl}
                    </a>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      Invalid URL
                    </span>
                  );
                })()}
              </div>
            </div>
          )}

          {autoRefresh && (
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              Auto-refreshing every {autoRefresh} seconds
            </div>
          )}
        </div>
      )}
    </div>
  );
}
