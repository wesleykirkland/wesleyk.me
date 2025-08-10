import Image from 'next/image';
import PageTracker from '@/components/PageTracker';
import CatLink from '@/components/CatLink';

export default function About() {
  return (
    <>
      <PageTracker
        pageName="About"
        pageType="profile"
        customProperties={{
          section: 'about-me',
          hasProfileImage: true
        }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About Me
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {process.env.NEXT_PUBLIC_FULL_TITLE}
            </p>
          </div>

          {/* Profile Image */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-600 shadow-lg">
              <Image
                src="/images/general/circle_headshot.png"
                alt={`${process.env.NEXT_PUBLIC_NAME} headshot`}
                width={128}
                height={128}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* History Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              History
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Wesley Kirkland started his career back in 2013 working as a
              lonely intern racking and stacking servers. Throughout the years
              he quickly advanced through his company and eventually found an
              all-star team to work with. Today he is a{' '}
              {process.env.NEXT_PUBLIC_PROFESSIONAL_TITLE} working with AWS,
              Next.js, and Python with various other technologies blending
              hands-on problem-solving with big-picture architecture. I'm a
              hands on problem solver both are work and around the house. When
              I'm not at my day job I'm running{' '}
              <a
                href="https://etsa.tech"
                target="_blank"
                className="link-external"
              >
                ETSA
              </a>{' '}
              for my local community. Or I'm deep into a personal project or
              tackling endless house upgrades.. At the end of the day I get to
              see myy crew of my beautiful wife, and our 4 beautiful fur babies
              kitties each with a name as whimsical as their personalities.
            </p>
          </section>

          {/* Skills Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Technical Skills
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Solutions and Cloud Architecture
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    PowerShell Scripting & Automation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Microsoft O365 & Exchange Administration
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Observability and Monitoring
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Relational Database Management
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    CI/CD (Continuous Integration and Continuous Delivery)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    AWS Cloud Services
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    IAM (Identity and Access Management)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    Active Directory Management
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Specializations
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    Security Research & Vulnerability Assessment
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    SSO & SAML (Security Assertion Markup Language)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    Windows Server Administration
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    Virtualization Technologies (VMWare, Containerization)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    Documentation, SOPs, & Process Improvement
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    System Architecture
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    Networking (On-Premise & Cloud)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    Web Presence (Domain Names, DNS, and Redirects)
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Current Focus */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Current Focus
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Currently working as a{' '}
                {process.env.NEXT_PUBLIC_PROFESSIONAL_TITLE}, focusing on:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                  <span>
                    Managing complex AWS Infrastructure in a HIPPA and SOC II
                    environment
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                  <span>
                    Increasing observability through distributed tracing,
                    synthetic tests, and enhanced logging
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                  <span>
                    Create and optimize variablized CI/CD pipelines for
                    deployment workflows
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                  <span>
                    Lead the team through humility, blameless actions, knowledge
                    sharing sessions, while contributing as a primary individual
                    contributor
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Career Highlights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Career Highlights
            </h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-base">
              <li className="flex items-start">
                <span
                  className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0"
                  style={{ width: '8px', height: '8px' }}
                ></span>
                <span className="text-base leading-relaxed">
                  Orchestrated consolidation of 150+ email domains and migration
                  of 2,000+ mailboxes, enhancing email and calendar
                  functionality for 700+ users across the enterprise using a
                  combination of O365, Mimecast, and dmarcian technologies.
                </span>
              </li>
              <li className="flex items-start">
                <span
                  className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0"
                  style={{ width: '8px', height: '8px' }}
                ></span>
                <span className="text-base leading-relaxed">
                  Collaborated with developers to reduce SQL connections from
                  300K/min to approximately 1K/min
                </span>
              </li>
              <li className="flex items-start">
                <span
                  className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0"
                  style={{ width: '8px', height: '8px' }}
                ></span>
                <span className="text-base leading-relaxed">
                  Increased system observability through distributed tracing and
                  proactive incident management, reducing critical incidents by
                  75%
                </span>
              </li>
              <li className="flex items-start">
                <span
                  className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0"
                  style={{ width: '8px', height: '8px' }}
                ></span>
                <span className="text-base leading-relaxed">
                  Security research, disclosures, and remediation collaboration
                </span>
              </li>
            </ul>
          </section>

          {/* Certifications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Certifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    <a
                      href="https://www.credly.com/earner/earned/badge/900c7be8-3f38-4014-adb5-cfeb9388446f"
                      target="_blank"
                      className="link-external"
                    >
                      AWS Certified Solutions Architect – Professional
                    </a>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    <a
                      href="https://www.credly.com/earner/earned/badge/9f21e53a-9e26-42b4-9524-8d7f4f83c3d9"
                      target="_blank"
                      className="link-external"
                    >
                      AWS Certified Solutions Architect – Associate
                    </a>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    <a
                      href="https://www.credly.com/earner/earned/badge/0f257ada-d309-4add-868e-9141a2288903"
                      target="_blank"
                      className="link-external"
                    >
                      AWS Certified Security – Specialty
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Fun Fact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Fun Fact
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-400 p-6">
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                &ldquo;Meme Master of Disaster&rdquo; - Because sometimes the
                best way to deal with IT disasters is with a good sense of humor
                and the right PowerShell script! 🚀
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                My favorite Icebreakers are:
              </p>
              <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300">
                <li>
                  One of my <CatLink>cats</CatLink> is &ldquo;famous&rdquo; on
                  Amazon
                </li>
                <li>
                  I&apos;m a{' '}
                  <a
                    href="https://www.amazon.com/PowerShell-Conference-Book-Books/dp/1720169977"
                    target="_blank"
                    className="link-external"
                  >
                    published Author
                  </a>
                </li>
                <li>
                  I bought this domain before I knew anything about ccTLDs and
                  domains. To this day I find websites with invalid regex
                  patterns refusing my email address.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
