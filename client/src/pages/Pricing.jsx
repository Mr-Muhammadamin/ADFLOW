import React from 'react'
import { Link } from 'react-router-dom'
import { Check, Star, Zap, Crown } from 'lucide-react'

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      icon: Zap,
      features: [
        'Up to 3 active campaigns',
        'Up to 5 ad spaces',
        'Basic analytics',
        'Email support',
        'Community access',
      ],
      popular: false,
      cta: 'Get Started',
      link: '/register',
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      icon: Star,
      features: [
        'Up to 20 active campaigns',
        'Up to 50 ad spaces',
        'Advanced analytics',
        'Priority support',
        'API access',
        'Custom reports',
        'Fraud protection',
        'A/B testing',
      ],
      popular: true,
      cta: 'Start Free Trial',
      link: '/register',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      icon: Crown,
      features: [
        'Unlimited campaigns',
        'Unlimited ad spaces',
        'White-label solution',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom integrations',
        'Advanced fraud detection',
        'SLA guarantee',
        'On-site training',
      ],
      popular: false,
      cta: 'Contact Sales',
      link: '#contact',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your advertising needs. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-primary-600 text-white shadow-2xl scale-105'
                  : 'bg-white dark:bg-gray-800 shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center mb-4">
                <plan.icon className={`w-12 h-12 ${plan.popular ? 'text-white' : 'text-primary-600'}`} />
              </div>

              <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
              <div className="text-center mb-6">
                <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {plan.price}
                </span>
                <span className={plan.popular ? 'text-primary-200' : 'text-gray-500'}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.popular ? 'text-primary-200' : 'text-green-500'}`} />
                    <span className={plan.popular ? 'text-white' : 'text-gray-600 dark:text-gray-400'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link to={plan.link}>
                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-white text-primary-600 hover:bg-gray-100'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and prorated billing is applied.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, the Professional plan comes with a 14-day free trial. No credit card required to start.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, we offer a 30-day money-back guarantee for all paid plans. Contact support if you're not satisfied.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Our team is here to help you find the perfect solution.
          </p>
          <Link to="/faq">
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Visit FAQ
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Pricing
