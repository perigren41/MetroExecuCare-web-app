import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, LogIn } from 'lucide-react';
import MetroBankLogo from '@/assets/mainLogo-foreground.svg';

export default function TestAccountsPage() {
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = React.useState(null);

  const testAccounts = [
    {
      role: 'Executive Employee',
      description: 'Can submit LOA/Authorization requests and track status',
      email: 'executive@metroexecucare.com',
      password: 'Executive@123',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-500',
      hoverBgColor: 'hover:bg-blue-600'
    },
    {
      role: 'HR Personnel',
      description: 'Can claim and process incoming requests',
      email: 'hr@metroexecucare.com',
      password: 'HR@12345',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-500',
      hoverBgColor: 'hover:bg-purple-600'
    },
    {
      role: 'Benefits Officer',
      description: 'Reviews and approves/rejects requests after HR processing',
      email: 'benefits@metroexecucare.com',
      password: 'Benefits@123',
      borderColor: 'border-green-500',
      bgColor: 'bg-green-500',
      hoverBgColor: 'hover:bg-green-600'
    },
    {
      role: 'Welfare Head',
      description: 'Final approval authority for requests',
      email: 'welfare@metroexecucare.com',
      password: 'Welfare@123',
      borderColor: 'border-orange-500',
      bgColor: 'bg-orange-500',
      hoverBgColor: 'hover:bg-orange-600'
    },
    {
      role: 'Administrator',
      description: 'Manages users and system settings (view only for testing)',
      email: 'admintest@metroexecucare.com',
      password: 'Admin@123',
      borderColor: 'border-red-500',
      bgColor: 'bg-red-500',
      hoverBgColor: 'hover:bg-red-600'
    }
  ];

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleQuickLogin = (email, password) => {
    navigate(`/loginpage?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={MetroBankLogo} alt="MetroBank Logo" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MetroExecuCare</h1>
                <p className="text-xs text-gray-500">Test Accounts Demo</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/loginpage')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to MetroExecuCare Demo
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              MetroExecuCare is a comprehensive health checkup management system for Metrobank executives.
              Test the complete workflow by logging in with different role accounts below.
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">📱 Mobile-Friendly Quick Login</h3>
              <p className="text-sm text-blue-800 mb-3">
                Click any <strong>"Quick Login"</strong> button below to auto-fill credentials - just tap Login on the next page!
              </p>
              <h3 className="text-lg font-semibold text-blue-900 mb-2 mt-4">How to Test the Full Workflow:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li><strong>Executive:</strong> Quick login and submit a Letter of Approval or Authorization request</li>
                <li><strong>HR Personnel:</strong> Quick login, claim the request, and forward it to Benefits Officer</li>
                <li><strong>Benefits Officer:</strong> Quick login, review the request, and approve it</li>
                <li><strong>Welfare Head:</strong> Quick login and give final approval</li>
                <li><strong>Executive:</strong> Quick login again to see the approved status and download the letter</li>
              </ol>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> These are test accounts for demonstration purposes only.
                Do not use real personal information. All data will be reset periodically.
              </p>
            </div>
          </div>
        </div>

        {/* Test Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testAccounts.map((account, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-t-4 ${account.borderColor}`}
            >
              <div className={`${account.bgColor} px-6 py-4`}>
                <h3 className="text-lg font-bold text-white">{account.role}</h3>
                <p className="text-xs text-white/90 mt-1">{account.description}</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={account.email}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(account.email, `email-${index}`)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy email"
                    >
                      {copiedIndex === `email-${index}` ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={account.password}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(account.password, `password-${index}`)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy password"
                    >
                      {copiedIndex === `password-${index}` ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Login Button */}
                <button
                  onClick={() => handleQuickLogin(account.email, account.password)}
                  className={`w-full py-3 ${account.bgColor} ${account.hoverBgColor} text-white rounded-lg transition-colors text-sm font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
                >
                  <LogIn className="w-4 h-4" />
                  Quick Login as {account.role}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Important Notes</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Each role has specific permissions and can only access their designated features</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>The workflow requires sequential approvals: Executive → HR → Benefits → Welfare</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>You can logout and switch between accounts to test the full process</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>File uploads are supported for request documents</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Please do not change passwords or delete these test accounts</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            MetroExecuCare v1.3 - Executive Health Checkup Management System
          </p>
        </div>
      </div>
    </div>
  );
}
