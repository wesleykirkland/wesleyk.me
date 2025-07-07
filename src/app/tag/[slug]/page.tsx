import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getAllTags,
  getTagFromSlug,
  getPostsByTag,
  getSafePostUrl,
  getTagSlug
} from '@/lib/blog';
import { format } from 'date-fns';
import PageTracker from '@/components/PageTracker';

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all tags
export async function generateStaticParams() {
  const tags = getAllTags();

  return tags.map((tag) => ({
    slug: getTagSlug(tag)
  }));
}

// Helper function to convert slug back to readable tag name
function getTagNameFromSlug(slug: string): string {
  // Convert slug back to a readable format
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = getTagFromSlug(slug) || getTagNameFromSlug(slug);
  const posts = getPostsByTag(tag);

  return {
    title: `Posts tagged "${tag}" - ${process.env.NEXT_PUBLIC_NAME}`,
    description: `Browse all ${posts.length} posts tagged with "${tag}" on ${process.env.NEXT_PUBLIC_NAME}'s blog.`,
    openGraph: {
      title: `Posts tagged "${tag}"`,
      description: `Browse all ${posts.length} posts tagged with "${tag}".`,
      type: 'website'
    }
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = getTagFromSlug(slug) || getTagNameFromSlug(slug);
  const posts = getPostsByTag(tag);
  const allTags = getAllTags();
  const isExistingTag = getTagFromSlug(slug) !== null;

  return (
    <>
      <PageTracker
        pageName={`Tag: ${tag}`}
        pageType="tag-archive"
        customProperties={{
          tag: tag,
          tagSlug: slug,
          postCount: posts.length,
          hasPosts: posts.length > 0
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <Link
              href="/tags"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Tags
            </Link>
            <span className="mx-2">→</span>
            <span className="text-gray-900 dark:text-white">{tag}</span>
          </nav>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Posts tagged &ldquo;{tag}&rdquo;
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
          </p>
        </div>

        {/* Posts */}
        {posts.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-2">
            {posts.map((post) => {
              const formattedDate = format(new Date(post.date), 'MMMM d, yyyy');

              return (
                <article
                  key={post.slug}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    <Link
                      href={getSafePostUrl(post)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <time dateTime={post.date}>{formattedDate}</time>
                    <span className="mx-2">•</span>
                    <span>{post.author}</span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((postTag) => (
                      <Link
                        key={postTag}
                        href={`/tag/${getTagSlug(postTag)}`}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                          postTag === tag
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
                        }`}
                      >
                        {postTag}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={getSafePostUrl(post)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Read more →
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              No posts found for &ldquo;{tag}&rdquo;
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              {isExistingTag
                ? "This tag exists but doesn't have any posts yet. Check back later for new content!"
                : "This tag doesn't exist yet, but it's ready for future content. When posts are tagged with this topic, they'll appear here."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/blog"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                Browse All Posts
              </Link>
              <Link
                href="/tags"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                View All Tags
              </Link>
            </div>
          </div>
        )}

        {/* Related Tags */}
        {allTags.length > 1 && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Browse Other Tags
            </h2>

            <div className="flex flex-wrap gap-3">
              {allTags
                .filter((t) => t !== tag)
                .map((otherTag) => {
                  const tagPosts = getPostsByTag(otherTag);
                  return (
                    <Link
                      key={otherTag}
                      href={`/tag/${getTagSlug(otherTag)}`}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <span className="font-medium">{otherTag}</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {tagPosts.length}
                      </span>
                    </Link>
                  );
                })}
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
    </>
  );
}
