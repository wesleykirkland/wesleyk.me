import Image from 'next/image';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Get-AboutMe</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {process.env.NEXT_PUBLIC_FULL_TITLE}
          </p>
        </div>

        {/* Profile Image */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-600 shadow-lg">
            <Image
              src="/circle_headshot.png"
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">History</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Wesley Kirkland started his career back in 2013 working as a lonely intern racking and stacking servers.
            Throughout the years he quickly advanced through his company and eventually found an all-star team to work with.
            Currently he is a {process.env.NEXT_PUBLIC_PROFESSIONAL_TITLE} working with PowerShell, O365, Exchange, Azure, and various SaaS applications.
            All while binding everything together with PowerShell.
          </p>
        </section>

        {/* Skills Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Technical Skills</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
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
                  AWS Cloud Services
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Azure Cloud Services
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Active Directory Management
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  System Center Products (SCCM, SCOM, SCVMM)
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Specializations</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  Security Research & Vulnerability Assessment
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  SAML (Security Assertion Markup Language)
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Current Focus</h2>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Currently working as a {process.env.NEXT_PUBLIC_PROFESSIONAL_TITLE}, focusing on:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                <span>Automating complex IT processes with PowerShell</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                <span>Managing enterprise O365 and Exchange environments</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                <span>Researching security vulnerabilities in SaaS applications</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></span>
                <span>Integrating various SaaS applications with Azure services</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Fun Fact */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fun Fact</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-400 p-6">
            <p className="text-gray-700 dark:text-gray-300 italic mb-4">
              &ldquo;Meme Master of Disaster&rdquo; - Because sometimes the best way to deal with IT disasters
              is with a good sense of humor and the right PowerShell script! 🚀
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">My favorite Icebreakers are:</p>
            <ul className="list-disc list-inside ml-4 text-gray-700 dark:text-gray-300">
              <li>One of my cats is &ldquo;famous&rdquo; on Amazon</li>
              <li>I&apos;m a published Author</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
