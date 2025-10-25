import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, LogIn, Home } from 'lucide-react';
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
      gradient: 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700',
      borderGradient: 'from-blue-500 via-blue-600 to-blue-700',
      bgColor: 'bg-blue-500',
      hoverBgColor: 'hover:bg-blue-600'
    },
    {
      role: 'Human Resource Personnel',
      description: 'Can claim and process incoming requests',
      email: 'hr@metroexecucare.com',
      password: 'HR@12345',
      gradient: 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700',
      borderGradient: 'from-purple-500 via-purple-600 to-purple-700',
      bgColor: 'bg-purple-500',
      hoverBgColor: 'hover:bg-purple-600'
    },
    {
      role: 'Benefits Officer',
      description: 'Reviews and approves/rejects requests after HR processing',
      email: 'benefits@metroexecucare.com',
      password: 'Benefits@123',
      gradient: 'bg-gradient-to-r from-green-500 via-green-600 to-green-700',
      borderGradient: 'from-green-500 via-green-600 to-green-700',
      bgColor: 'bg-green-500',
      hoverBgColor: 'hover:bg-green-600'
    },
    {
      role: 'Division Head',
      description: 'Final approval authority for requests',
      email: 'divisionhead@metroexecucare.com',
      password: 'divhead@123',
      gradient: 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700',
      borderGradient: 'from-orange-500 via-orange-600 to-orange-700',
      bgColor: 'bg-orange-500',
      hoverBgColor: 'hover:bg-orange-600'
    },
    {
      role: 'Administrator',
      description: 'Manages users and system settings (view only for testing)',
      email: 'admintest@metroexecucare.com',
      password: 'Admin@123',
      gradient: 'bg-gradient-to-r from-red-500 via-red-600 to-red-700',
      borderGradient: 'from-red-500 via-red-600 to-red-700',
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Home className="w-4 h-4" />
                Go Back to Home
              </button>
              <button
                onClick={() => navigate('/loginpage')}
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-medium shadow-md hover:shadow-lg"
              >
                Go to Login
              </button>
            </div>
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
              className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              style={{
                background: `linear-gradient(white, white) padding-box, linear-gradient(to right, ${account.borderGradient.includes('blue') ? 'rgb(59, 130, 246), rgb(37, 99, 235), rgb(29, 78, 216)' : account.borderGradient.includes('purple') ? 'rgb(168, 85, 247), rgb(147, 51, 234), rgb(126, 34, 206)' : account.borderGradient.includes('green') ? 'rgb(34, 197, 94), rgb(22, 163, 74), rgb(21, 128, 61)' : account.borderGradient.includes('orange') ? 'rgb(249, 115, 22), rgb(234, 88, 12), rgb(194, 65, 12)' : 'rgb(239, 68, 68), rgb(220, 38, 38), rgb(185, 28, 28)'}) border-box`,
                border: '3px solid transparent'
              }}
            >
              <div className={`${account.gradient} px-6 py-4 text-white`}>
                <h3 className="text-lg font-bold">{account.role}</h3>
                <p className="text-xs opacity-90 mt-1">{account.description}</p>
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
                      className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                      className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                  className={`cursor-pointer w-full py-3 ${account.bgColor} ${account.hoverBgColor} text-white rounded-lg transition-colors text-sm font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
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
