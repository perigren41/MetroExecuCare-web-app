import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-700 mb-4">
            MetroExecuCare
          </h1>
          <p className="text-lg text-gray-600">
            Web-Based Annual Executive Check Up Benefit System
          </p>
        </header>
        
        <main className="card max-w-md mx-auto p-6">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                System Ready
              </h2>
              <p className="text-gray-600 text-sm">
                Frontend and Backend are properly configured
              </p>
            </div>
            
            <div className="space-y-3">
              <button className="btn-primary w-full">
                Get Started
              </button>
              <button className="btn-secondary w-full">
                Learn More
              </button>
            </div>
          </div>
        </main>
        
        <footer className="text-center mt-12 text-sm text-gray-500">
          <p>Built with React + Vite + Tailwind CSS</p>
        </footer>
      </div>
    </div>
  )
}

export default App