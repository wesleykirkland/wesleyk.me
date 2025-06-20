import Link from 'next/link';
import { getRecentPosts } from '@/lib/blog';

export default function Home() {
  const recentPosts = getRecentPosts(2);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to my corner of the internet
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              I&apos;m {process.env.NEXT_PUBLIC_NAME}, a {process.env.NEXT_PUBLIC_PROFESSIONAL_TITLE} specializing in PowerShell, O365, Azure, and Security Research.
              Here you&apos;ll find my thoughts on technology, security vulnerabilities I&apos;ve discovered, and various technical adventures.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/about"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Get-AboutMe
              </Link>
              <Link
                href="/security-research"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Security Research
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Recent Posts</h2>
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View all posts →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {recentPosts.map((post) => (
            <article key={post.slug} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-blue-600 transition-colors duration-200"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Skills/About Preview */}
      <section className="mt-12">
        <div className="bg-gray-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills & Expertise</h2>
          <p className="text-gray-700 mb-6">
            Wesley Kirkland started his career back in 2013 working as a lonely intern racking and stacking servers.
            Throughout the years he quickly advanced through his company and eventually found an all-star team to work with.
            Currently he is a {process.env.NEXT_PUBLIC_PROFESSIONAL_TITLE} working with PowerShell, O365, Exchange, Azure, and various SaaS applications.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['PowerShell', 'Azure', 'O365', 'Security Research', 'SCCM', 'Active Directory', 'Networking', 'Documentation'].map((skill) => (
              <div key={skill} className="bg-white rounded-lg p-3 text-center text-sm font-medium text-gray-700">
                {skill}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
