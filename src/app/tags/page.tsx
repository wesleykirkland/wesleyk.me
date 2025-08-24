import Link from 'next/link';
import { getAllTags, getPostsByTag, getTagSlug } from '@/lib/blog';
import SearchBox from '@/components/SearchBox';

export const metadata = {
  title: `All Tags - ${process.env.NEXT_PUBLIC_NAME}`,
  description: 'Browse all tags and topics covered on the blog.'
};

export default function TagsPage() {
  const allTags = getAllTags();

  // Get tag counts and sort by popularity
  const tagsWithCounts = allTags
    .map((tag) => ({
      tag,
      count: getPostsByTag(tag).length,
      slug: getTagSlug(tag)
    }))
    .sort((a, b) => b.count - a.count);

  return (
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
          <span className="text-gray-900 dark:text-white">Tags</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          All Tags
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Browse posts by topic. {allTags.length}{' '}
          {allTags.length === 1 ? 'tag' : 'tags'} available.
        </p>

        {/* Search Box */}
        <div className="max-w-2xl">
          <SearchBox
            placeholder="Search posts or filter by tags..."
            size="md"
            className="w-full"
          />
        </div>
      </div>

      {/* Tags Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tagsWithCounts.map(({ tag, count, slug }) => (
          <Link
            key={tag}
            href={`/tag/${slug}`}
            className="group block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {tag}
              </h2>

              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {count} {count === 1 ? 'post' : 'posts'}
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              View all posts tagged with &ldquo;{tag}&rdquo;
            </p>
          </Link>
        ))}
      </div>

      {/* Popular Tags Section */}
      {tagsWithCounts.length > 6 && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Most Popular Tags
          </h2>

          <div className="flex flex-wrap gap-3">
            {tagsWithCounts.slice(0, 6).map(({ tag, count, slug }) => (
              <Link
                key={tag}
                href={`/tag/${slug}`}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="font-medium">{tag}</span>
                <span
                  className="ml-2 text-xs bg-white/20 text-white px-2 py-1 rounded-full min-w-6 inline-flex items-center justify-center leading-none"
                  aria-label={`${count} ${count === 1 ? 'post' : 'posts'}`}
                >
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back to Blog */}
      <div className="mt-12 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to All Posts
        </Link>
      </div>
    </div>
  );
}
