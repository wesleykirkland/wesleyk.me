import Link from 'next/link';
import { getRecentPosts, getSafePostUrl } from '@/lib/blog';
import TagList from '@/components/TagList';
import PageTracker from '@/components/PageTracker';
import SearchBox from '@/components/SearchBox';

export default function Home() {
  const recentPosts = getRecentPosts(2);
  return (
    <>
      <PageTracker
        pageName="Home"
        pageType="landing"
        customProperties={{
          recentPostsCount: recentPosts.length,
          hasRecentPosts: recentPosts.length > 0
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to my corner of the internet
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
                I&apos;m {process.env.NEXT_PUBLIC_NAME}, a{' '}
                {process.env.NEXT_PUBLIC_PROFESSIONAL_TITLE} specializing in
                Cloud Technologies. With a focus on AWS, CI/CD,
                Containerization, Networking, Observability, and PowerShell.
                Additionally I love doing Security Research through misuse of
                systems. Here you&apos;ll find my thoughts on technology,
                security vulnerabilities I&apos;ve discovered, and various
                technical adventures and some of my thoughts on Home Automation
                and standards.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/about"
                  className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  Get-AboutMe
                </Link>
                <Link
                  href="/security-research"
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Security Research
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Find What You&apos;re Looking For
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Search through all blog posts, security research, and case studies
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchBox
              size="lg"
              placeholder="Search posts, topics, or technologies..."
              className="w-full"
            />
          </div>
        </section>

        {/* Recent Posts Section */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Recent Posts
            </h2>
            <Link
              href="/blog"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View all posts →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {recentPosts.map((post) => (
              <article
                key={post.slug}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="mb-4">
                  <div className="mb-3">
                    <TagList tags={post.tags} size="sm" variant="default" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    <Link
                      href={getSafePostUrl(post)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <Link
                      href={getSafePostUrl(post)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
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
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Skills & Expertise
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'PowerShell',
                'AWS',
                'O365',
                'Security Research',
                'Networking',
                'Active Directory',
                'Documentation',
                'Email',
                'SQL',
                'DNS/Domains',
                'CI/CD',
                'SSO'
              ].map((skill) => (
                <div
                  key={skill}
                  className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
