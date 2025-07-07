import Link from 'next/link';
import { getSortedPostsData, getSafePostUrl, parsePostDate } from '@/lib/blog';
import { format } from 'date-fns';
import TagList from '@/components/TagList';
import PageTracker from '@/components/PageTracker';

export default function Blog() {
  const allPostsData = getSortedPostsData();

  return (
    <>
      <PageTracker
        pageName="Blog"
        pageType="blog-index"
        customProperties={{
          totalPosts: allPostsData.length,
          hasPosts: allPostsData.length > 0
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Thoughts on technology, security research, PowerShell automation,
            and various technical adventures.
          </p>
        </div>

        {/* Blog Posts */}
        <div className="space-y-8">
          {allPostsData.map((post) => (
            <article
              key={post.slug}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 hover:shadow-md transition-shadow duration-200"
            >
              <div className="mb-4">
                <TagList tags={post.tags} size="sm" variant="default" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
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

              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>By {post.author}</span>
                  <span className="mx-2">•</span>
                  <time dateTime={post.date}>
                    {format(parsePostDate(post.date), 'MMMM d, yyyy')}
                  </time>
                </div>

                <Link
                  href={getSafePostUrl(post)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {allPostsData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No blog posts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Check back soon for new content!
            </p>
          </div>
        )}

        {/* Categories/Tags Section */}
        {allPostsData.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Popular Topics
              </h2>
              <Link
                href="/tags"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              >
                View all tags →
              </Link>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <TagList
                tags={Array.from(
                  new Set(allPostsData.flatMap((post) => post.tags))
                )}
                size="lg"
                variant="outline"
              />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
