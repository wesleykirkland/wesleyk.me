import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllTags, getTagFromSlug, getPostsByTag, getPostUrl, getTagSlug } from '@/lib/blog';
import { format } from 'date-fns';

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all tags
export async function generateStaticParams() {
  const tags = getAllTags();
  
  return tags.map((tag) => ({
    slug: getTagSlug(tag),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = getTagFromSlug(slug);
  
  if (!tag) {
    return {
      title: 'Tag Not Found',
    };
  }

  const posts = getPostsByTag(tag);

  return {
    title: `Posts tagged "${tag}" - ${process.env.NEXT_PUBLIC_NAME}`,
    description: `Browse all ${posts.length} posts tagged with "${tag}" on ${process.env.NEXT_PUBLIC_NAME}'s blog.`,
    openGraph: {
      title: `Posts tagged "${tag}"`,
      description: `Browse all ${posts.length} posts tagged with "${tag}".`,
      type: 'website',
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = getTagFromSlug(slug);
  
  if (!tag) {
    notFound();
  }

  const posts = getPostsByTag(tag);
  const allTags = getAllTags();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400">
            Blog
          </Link>
          <span className="mx-2">→</span>
          <Link href="/tags" className="hover:text-blue-600 dark:hover:text-blue-400">
            Tags
          </Link>
          <span className="mx-2">→</span>
          <span className="text-gray-900 dark:text-white">{tag}</span>
        </nav>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Posts tagged "{tag}"
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
        </p>
      </div>

      {/* Posts */}
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
                  href={getPostUrl(post)}
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
                href={getPostUrl(post)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                Read more →
              </Link>
            </article>
          );
        })}
      </div>

      {/* Related Tags */}
      {allTags.length > 1 && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Browse Other Tags
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {allTags
              .filter(t => t !== tag)
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
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to All Posts
        </Link>
      </div>
    </div>
  );
}
