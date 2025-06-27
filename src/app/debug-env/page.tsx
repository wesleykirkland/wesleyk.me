// This page helps debug environment variables on Netlify
// Remove this file after debugging

export default function DebugEnv() {
  // Client-side environment variables (NEXT_PUBLIC_*)
  const clientEnvVars = {
    NEXT_PUBLIC_PROFESSIONAL_TITLE: process.env.NEXT_PUBLIC_PROFESSIONAL_TITLE,
    NEXT_PUBLIC_FULL_TITLE: process.env.NEXT_PUBLIC_FULL_TITLE,
    NEXT_PUBLIC_NAME: process.env.NEXT_PUBLIC_NAME,
    NEXT_PUBLIC_TAGLINE: process.env.NEXT_PUBLIC_TAGLINE,
    NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
    NEXT_PUBLIC_LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL,
    NEXT_PUBLIC_YOUTUBE_PLAYLIST: process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST,
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
    NEXT_PUBLIC_OVERTRACKING_SITE_ID: process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID,
    NODE_ENV: process.env.NODE_ENV,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Environment Variables Debug</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Client-side Environment Variables</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          These are available in the browser (NEXT_PUBLIC_* variables):
        </p>
        
        <div className="space-y-2 font-mono text-sm">
          {Object.entries(clientEnvVars).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="font-semibold w-80">{key}:</span>
              <span className={value ? "text-green-600" : "text-red-600"}>
                {value || "❌ MISSING"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Note:</h3>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
          Server-side environment variables (SMTP_*, HCAPTCHA_SECRET_KEY) are not shown here for security reasons.
          They should be available in API routes and server components.
        </p>
      </div>

      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        <p><strong>Build Time:</strong> {new Date().toISOString()}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
      </div>
    </div>
  );
}
