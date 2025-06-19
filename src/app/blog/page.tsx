import Link from 'next/link';
import { getSortedPostsData } from '@/lib/blog';

export default function Blog() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Thoughts on technology, security research, PowerShell automation, and various technical adventures.
        </p>
      </div>

      {/* Blog Posts */}
      <div className="space-y-8">
        {allPostsData.map((post) => (
          <article key={post.slug} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              <Link 
                href={`/blog/${post.slug}`} 
                className="hover:text-blue-600 transition-colors duration-200"
              >
                {post.title}
              </Link>
            </h2>
            
            <p className="text-gray-600 mb-4 leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-500">
                <span>By {post.author}</span>
                <span className="mx-2">•</span>
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              
              <Link 
                href={`/blog/${post.slug}`} 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
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
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-600">Check back soon for new content!</p>
        </div>
      )}

      {/* Categories/Tags Section */}
      {allPostsData.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Topics</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex flex-wrap gap-3">
              {Array.from(new Set(allPostsData.flatMap(post => post.tags))).map((tag) => (
                <span 
                  key={tag} 
                  className="inline-block bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
