import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostByPermalink, getPostData, getSortedPostsData, getPostPermalink, getWordPressPermalink, isWordPressPermalink } from '@/lib/blog';
import { format } from 'date-fns';

interface BlogPostPageProps {
  params: Promise<{
    permalink: string[];
  }>;
}

// Generate static params for all blog posts (both modern and WordPress URLs)
export async function generateStaticParams() {
  const posts = getSortedPostsData();
  const params = [];

  for (const post of posts) {
    // Add modern permalink (slug-based)
    const modernPermalink = getPostPermalink(post);
    params.push({
      permalink: modernPermalink.split('/'),
    });

    // Add WordPress permalink for backward compatibility
    const wpPermalink = getWordPressPermalink(post);
    if (wpPermalink !== modernPermalink) {
      params.push({
        permalink: wpPermalink.split('/'),
      });
    }
  }

  return params;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps) {
  const { permalink } = await params;
  const permalinkPath = permalink.join('/');
  const postMeta = getPostByPermalink(permalinkPath);
  
  if (!postMeta) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${postMeta.title} - ${process.env.NEXT_PUBLIC_NAME}`,
    description: postMeta.excerpt,
    openGraph: {
      title: postMeta.title,
      description: postMeta.excerpt,
      type: 'article',
      publishedTime: postMeta.date,
      authors: [postMeta.author],
      images: postMeta.featuredImage ? [postMeta.featuredImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: postMeta.title,
      description: postMeta.excerpt,
      images: postMeta.featuredImage ? [postMeta.featuredImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { permalink } = await params;
  const permalinkPath = permalink.join('/');

  // Check if this is a blog post
  const postMeta = getPostByPermalink(permalinkPath);

  if (!postMeta) {
    notFound();
  }

  // Check if this is a WordPress-style URL that should redirect to modern URL
  if (isWordPressPermalink(permalinkPath, postMeta)) {
    // 301/308 permanent redirect from WordPress permalink to modern slug-based URL
    permanentRedirect(`/${getPostPermalink(postMeta)}`);
  }

  const post = await getPostData(postMeta.slug);
  const formattedDate = format(new Date(post.date), 'MMMM d, yyyy');

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6">
            <time dateTime={post.date} className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formattedDate}
            </time>
            
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {post.author}
            </span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8">
              <Image
                src={post.featuredImage}
                alt={post.title}
                width={800}
                height={256}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
        </header>

        {/* Content */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-900 dark:prose-code:text-gray-100 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Published on {formattedDate} by {post.author}
            </div>
            
            <Link
              href="/blog"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
}
