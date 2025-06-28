import Link from 'next/link';

// Mock security research data - we'll replace this with real data later
const securityResearch = [
  {
    id: 1,
    title: 'Mimecast Sender Address Verification Vulnerability',
    description:
      "Discovered a vulnerability in Mimecast's sender address verification system that could allow email spoofing attacks.",
    date: 'January 10, 2020',
    status: 'Disclosed',
    severity: 'High',
    tags: ['Email Security', 'Mimecast', 'Spoofing'],
    slug: 'my-first-vulnerability-mimecast-sender-address-verification'
  }
];

export default function SecurityResearch() {
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
                security research and vulnerability assessment.
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
                documentation, and collaboration.
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
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                SMTP
              </span>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                SPF
              </span>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                DKIM
              </span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              SaaS Applications
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Analyzing security implementations in Software-as-a-Service
              platforms and cloud-based applications.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                OAuth
              </span>
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                SAML
              </span>
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                API Security
              </span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Authentication Systems
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Examining authentication mechanisms, single sign-on
              implementations, and identity management systems.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                SSO
              </span>
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                MFA
              </span>
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                Identity
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Published Research */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Published Research
          </h2>
          <Link
            href="/blog"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            View all posts →
          </Link>
        </div>

        {securityResearch.length > 0 ? (
          <div className="space-y-6">
            {securityResearch.map((research) => (
              <article
                key={research.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      <Link
                        href={`/blog/${research.slug}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        {research.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {research.description}
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end space-y-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        research.severity === 'High'
                          ? 'bg-red-100 text-red-800'
                          : research.severity === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {research.severity} Severity
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {research.date}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {research.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium ${
                      research.status === 'Disclosed'
                        ? 'text-green-600'
                        : research.status === 'In Progress'
                          ? 'text-yellow-600'
                          : 'text-gray-600'
                    }`}
                  >
                    Status: {research.status}
                  </span>
                  <Link
                    href={`/blog/${research.slug}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Read full case study →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              More security research case studies coming soon!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
