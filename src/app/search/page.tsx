'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  getSafePostUrl,
  parsePostDate,
  type BlogPostMetadata
} from '@/lib/client-blog-utils';
import SearchBox from '@/components/SearchBox';
import TagList from '@/components/TagList';
import PageTracker from '@/components/PageTracker';

interface SearchResult {
  post: BlogPostMetadata;
  relevanceScore: number;
  matchedFields: string[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [includeContent, setIncludeContent] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    // Load all tags on component mount
    const loadTags = async () => {
      try {
        const response = await fetch('/api/search?type=tags');
        const data = await response.json();
        if (data.success) {
          setAllTags(data.tags);
        }
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };

    loadTags();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const content = searchParams.get('content') === 'true';

    setQuery(q);
    setSelectedTags(tags);
    setIncludeContent(content);

    if (q.trim() || tags.length > 0) {
      performSearch(q, tags, content);
    }
  }, [searchParams]);

  const performSearch = async (
    searchQuery: string,
    tags: string[] = [],
    content: boolean = false
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (tags.length > 0) params.set('tags', tags.join(','));
      if (content) params.set('content', 'true');

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        console.error('Search failed:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set('q', newQuery.trim());
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (includeContent) params.set('content', 'true');

    window.history.pushState({}, '', `/search?${params.toString()}`);
    performSearch(newQuery, selectedTags, includeContent);
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);

    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (newTags.length > 0) params.set('tags', newTags.join(','));
    if (includeContent) params.set('content', 'true');

    window.history.pushState({}, '', `/search?${params.toString()}`);
    performSearch(query, newTags, includeContent);
  };

  return (
    <>
      <PageTracker
        pageName="Search"
        pageType="search"
        customProperties={{
          query: query,
          resultCount: results.length,
          hasResults: results.length > 0,
          selectedTags: selectedTags,
          includeContent: includeContent
        }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link
              href="/blog"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Blog
            </Link>
            <span className="mx-2">→</span>
            <span className="text-gray-900 dark:text-white">Search</span>
          </nav>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Search Blog Posts
          </h1>

          {/* Search Box */}
          <SearchBox
            initialValue={query}
            onSearch={handleSearch}
            size="lg"
            placeholder="Search posts by title, content, or tags..."
            className="mb-6"
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Searching...
            </p>
          </div>
        ) : (
          <>
            {/* Results header */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {results.length === 0
                  ? query.trim() || selectedTags.length > 0
                    ? 'No posts found'
                    : 'Enter a search term to get started'
                  : `Found ${results.length} ${
                      results.length === 1 ? 'post' : 'posts'
                    }`}
                {query.trim() && (
                  <span>
                    {' '}
                    for &quot;
                    <strong className="text-gray-900 dark:text-white">
                      {query}
                    </strong>
                    &quot;
                  </span>
                )}
              </p>
            </div>

            {/* Search results */}
            <div className="space-y-6">
              {results.map(({ post, matchedFields }) => (
                <article
                  key={post.slug}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="mb-4">
                    <TagList tags={post.tags} size="sm" variant="default" />
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    <Link
                      href={getSafePostUrl(post)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500 dark:text-gray-400">
                        {format(parsePostDate(post.date), 'MMM d, yyyy')}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">
                        Matched: {matchedFields.join(', ')}
                      </span>
                    </div>
                    <Link
                      href={getSafePostUrl(post)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Popular tags suggestion */}
            {results.length === 0 &&
              !query.trim() &&
              selectedTags.length === 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Popular Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
