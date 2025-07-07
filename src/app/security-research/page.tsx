import Link from 'next/link';
import {
  getSecurityResearchPosts,
  getCaseStudyPosts,
  getSafeBlogPostUrl
} from '@/lib/blog';
import { format } from 'date-fns';
import TagList from '@/components/TagList';

// Helper functions for styling
function getSeverityClasses(severity: string): string {
  if (severity === 'Critical') {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }
  if (severity === 'High') {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }
  if (severity === 'Medium') {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }
  return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
}

function getStatusClasses(status: string): string {
  if (status === 'Disclosed' || status === 'Fixed') {
    return 'text-green-600 dark:text-green-400';
  }
  if (status === 'In Progress' || status === 'Under Review') {
    return 'text-yellow-600 dark:text-yellow-400';
  }
  return 'text-gray-600 dark:text-gray-400';
}

// Helper function to determine severity from tags
function getSeverityFromTags(tags: string[]): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (tags.includes('Critical')) return 'Critical';
  if (tags.includes('High')) return 'High';
  if (tags.includes('Medium')) return 'Medium';
  return 'Low';
}

// Helper function to determine case study type from tags
function getCaseStudyTypeFromTags(tags: string[]): string {
  if (tags.includes('Penetration Test')) return 'Penetration Test';
  if (tags.includes('Security Assessment')) return 'Security Assessment';
  if (tags.includes('Code Review')) return 'Code Review';
  if (tags.includes('Compliance Audit')) return 'Compliance Audit';
  if (tags.includes('Incident Response')) return 'Incident Response';
  return 'Other';
}

function getCaseStudyTypeClasses(type: string): string {
  if (type === 'Penetration Test') {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }
  if (type === 'Security Assessment') {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  }
  if (type === 'Code Review') {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
  if (type === 'Compliance Audit') {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  }
  if (type === 'Incident Response') {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
}

export default function SecurityResearch() {
  // Get security research posts and case studies dynamically from blog posts
  const securityResearchPosts = getSecurityResearchPosts();
  const caseStudyPosts = getCaseStudyPosts();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Security Research & Case Studies
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Documenting my journey in cybersecurity research, vulnerability
          discoveries, and responsible disclosure practices.
        </p>
      </div>

      {/* Research Philosophy */}
      <section className="mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Research Philosophy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Responsible Disclosure
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Always following responsible disclosure practices to help
                vendors fix vulnerabilities before public disclosure.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Educational Focus
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sharing knowledge and methodologies to help others learn about
                security research and vulnerabilities through abuse and misuse
                and platforms and services.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Community Driven
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Contributing to the security community through research,
                documentation, and collaboration. With an emphasis on fixing the
                greater good.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Areas */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Research Areas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Email Security
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Researching email security mechanisms, SPF/DKIM/DMARC
              implementations, and email gateway vulnerabilities.
            </p>
            <TagList
              tags={['SMTP', 'SPF', 'DKIM', 'Email Security']}
              size="sm"
              variant="default"
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              SaaS Applications
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Analyzing security implementations in Software-as-a-Service
              platforms and cloud-based applications.
            </p>
            <TagList
              tags={['OAuth', 'SAML', 'API Security', 'SaaS']}
              size="sm"
              variant="default"
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Authentication Systems
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Examining authentication mechanisms, single sign-on
              implementations, and identity management systems.
            </p>
            <TagList
              tags={['SSO', 'MFA', 'Identity', 'Authentication']}
              size="sm"
              variant="default"
            />
          </div>
        </div>
      </section>

      {/* Published Research & Case Studies */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Published Research */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Published Research
              </h2>
              <Link
                href="/blog"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View all →
              </Link>
            </div>

            {securityResearchPosts.length > 0 ? (
              <div className="space-y-4">
                {securityResearchPosts.map((post) => {
                  const formattedDate = format(
                    new Date(post.date),
                    'MMMM d, yyyy'
                  );
                  const postUrl = getSafeBlogPostUrl(post);

                  // Get security research metadata or use defaults based on tags
                  const severity =
                    post.securityResearch?.severity ??
                    getSeverityFromTags(post.tags);

                  const status = post.securityResearch?.status ?? 'Disclosed';

                  return (
                    <article
                      key={post.slug}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                    >
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          <Link
                            href={postUrl}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSeverityClasses(
                            severity
                          )}`}
                        >
                          {severity}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formattedDate}
                        </span>
                      </div>

                      <div className="mb-3">
                        <TagList
                          tags={post.tags.slice(0, 3)}
                          size="sm"
                          variant="default"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span
                          className={`text-xs font-medium ${getStatusClasses(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                        <Link
                          href={postUrl}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium"
                        >
                          Read more →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Security research coming soon!
                </p>
              </div>
            )}
          </div>

          {/* Case Studies */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Case Studies
              </h2>
              <Link
                href="/blog"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View all →
              </Link>
            </div>

            {caseStudyPosts.length > 0 ? (
              <div className="space-y-4">
                {caseStudyPosts.map((post) => {
                  const formattedDate = format(
                    new Date(post.date),
                    'MMMM d, yyyy'
                  );
                  const postUrl = getSafeBlogPostUrl(post);

                  // Get case study metadata or use defaults based on tags
                  const type =
                    post.caseStudy?.type ?? getCaseStudyTypeFromTags(post.tags);

                  const client = post.caseStudy?.client ?? 'Confidential';
                  const industry = post.caseStudy?.industry;

                  return (
                    <article
                      key={post.slug}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                    >
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          <Link
                            href={postUrl}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCaseStudyTypeClasses(
                            type
                          )}`}
                        >
                          {type}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formattedDate}
                        </span>
                      </div>

                      {(client !== 'Confidential' || industry) && (
                        <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                          {client !== 'Confidential' && (
                            <span>Client: {client}</span>
                          )}
                          {client !== 'Confidential' && industry && (
                            <span> • </span>
                          )}
                          {industry && <span>Industry: {industry}</span>}
                        </div>
                      )}

                      <div className="mb-3">
                        <TagList
                          tags={post.tags.slice(0, 3)}
                          size="sm"
                          variant="default"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Link
                          href={postUrl}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium"
                        >
                          View case study →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Case studies coming soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
