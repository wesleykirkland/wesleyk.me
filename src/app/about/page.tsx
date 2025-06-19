export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get-AboutMe</h1>
          <p className="text-xl text-gray-600">
            Sr. Systems Engineer | PowerShell Enthusiast | Security Researcher
          </p>
        </div>

        {/* Profile Image Placeholder */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-4xl">WK</span>
          </div>
        </div>

        {/* History Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">History</h2>
          <p className="text-gray-700 leading-relaxed">
            Wesley Kirkland started his career back in 2013 working as a lonely intern racking and stacking servers. 
            Throughout the years he quickly advanced through his company and eventually found an all-star team to work with. 
            Currently he is a Sr. Systems Engineer working with PowerShell, O365, Exchange, Azure, and various SaaS applications. 
            All while binding everything together with PowerShell.
          </p>
        </section>

        {/* Skills Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Technical Skills</h3>
              <ul className="space-y-2 text-gray-700">
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
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Specializations</h3>
              <ul className="space-y-2 text-gray-700">
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
                  W2K8 R2+ Server Administration
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  Virtualization Technologies
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  Documentation & Process Improvement
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Current Focus */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Focus</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              Currently working as a Sr. Systems Engineer, focusing on:
            </p>
            <ul className="space-y-2 text-gray-700">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Fun Fact</h2>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6">
            <p className="text-gray-700 italic">
              &ldquo;Meme Master of Disaster&rdquo; - Because sometimes the best way to deal with IT disasters
              is with a good sense of humor and the right PowerShell script! 🚀
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
