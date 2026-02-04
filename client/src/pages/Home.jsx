import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, BarChart3, Shield, Zap, Globe, MessageSquare, Users, TrendingUp } from 'lucide-react'

const Home = () => {
  const features = [
    { icon: BarChart3, title: 'Analytics Dashboard', description: 'Track your campaign performance with detailed analytics' },
    { icon: Shield, title: 'Secure Platform', description: 'Your data and payments are protected with bank-level security' },
    { icon: Zap, title: 'Fast Setup', description: 'Create and launch campaigns in minutes' },
    { icon: Globe, title: 'Multi-Platform Support', description: 'Reach audiences across websites, Telegram, and Instagram' },
    { icon: MessageSquare, title: 'Direct Messaging', description: 'Communicate directly with publishers and advertisers' },
    { icon: Users, title: 'Vetted Network', description: 'Access a network of verified publishers and advertisers' },
  ]

  const benefits = [
    { icon: TrendingUp, title: 'For Advertisers', items: ['Reach targeted audiences', 'Set your budget', 'Track performance', 'Multi-platform campaigns'] },
    { icon: Users, title: 'For Publishers', title: 'For Publishers', items: ['Monetize your traffic', 'Set your rates', 'Get paid on time', 'Choose your campaigns'] },
  ]

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Connect Advertisers with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                  Publishers
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
                The complete advertising traffic management platform. Launch campaigns, reach audiences, and maximize your ROI with AdFlow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">10K+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">50M+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ad Views</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">$5M+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Processed</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-sm text-gray-500">Campaign Dashboard</div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Views</span>
                      <span className="text-2xl font-bold text-primary-600">1.2M</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Clicks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">45.2K</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">CTR</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">3.8%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to help you manage advertising campaigns efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Built for Both Sides
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Whether you're an advertiser or publisher, AdFlow has you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-4">
                    <benefit.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {benefit.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {benefit.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            Join thousands of advertisers and publishers already using AdFlow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-primary-600 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white border-2 border-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
