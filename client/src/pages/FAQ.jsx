import React, { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'Click the "Get Started" button on the homepage, fill in your details, select your role (Advertiser or Publisher), and submit the form. You\'ll receive a confirmation email and can start using the platform immediately.'
        },
        {
          question: 'What\'s the difference between Advertisers and Publishers?',
          answer: 'Advertisers are businesses or individuals who want to promote their products or services. Publishers own websites, social media channels, or other platforms where they can display ads and earn money from ad views and clicks.'
        },
        {
          question: 'Can I be both an Advertiser and a Publisher?',
          answer: 'Yes! You can create separate accounts for each role, or contact our support to upgrade your account to have both capabilities.'
        }
      ]
    },
    {
      category: 'For Advertisers',
      questions: [
        {
          question: 'How do I create a campaign?',
          answer: 'Navigate to your dashboard, click "New Campaign", fill in the campaign details (title, description, platform type, budget, duration), upload a banner image, and submit. Your campaign will be reviewed and activated upon approval.'
        },
        {
          question: 'What budget options are available?',
          answer: 'You can set both daily and total budget limits for each campaign. This gives you full control over your spending. The minimum budget per campaign is $10.'
        },
        {
          question: 'How are ads matched to publishers?',
          answer: 'Ads are automatically matched based on platform type (website, Telegram, Instagram), budget constraints, and publisher preferences. You can also manually select specific publishers for your campaigns.'
        },
        {
          question: 'Can I pause or edit a running campaign?',
          answer: 'Yes, you can pause any active campaign at any time. You can also edit campaign details when the campaign is in draft or paused status.'
        }
      ]
    },
    {
      category: 'For Publishers',
      questions: [
        {
          question: 'How do I add an ad space?',
          answer: 'Go to your dashboard, click "New Ad Space", provide details about your platform (website URL, Telegram channel, or Instagram page), set your pricing per view/click, and submit. Our team will review and approve it.'
        },
        {
          question: 'How do I set my pricing?',
          answer: 'You set both price per view (CPM-based) and price per click (CPC-based). We recommend researching market rates for similar ad spaces. Higher prices may mean fewer but potentially higher-quality campaigns.'
        },
        {
          question: 'How and when do I get paid?',
          answer: 'Earnings are credited to your wallet in real-time. You can request a withdrawal once your balance reaches $10. Withdrawals are typically processed within 3-5 business days.'
        },
        {
          question: 'What happens if I reject an ad campaign?',
          answer: 'You have full control over which ads appear on your platform. If you reject a campaign, the advertiser can choose another publisher. Your rejection doesn\'t affect your account status.'
        }
      ]
    },
    {
      category: 'Payments & Billing',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for larger amounts. All transactions are secured with SSL encryption.'
        },
        {
          question: 'Is there a minimum deposit amount?',
          answer: 'Yes, the minimum deposit to fund your wallet is $10. This ensures efficient processing of transactions.'
        },
        {
          question: 'How do I withdraw my earnings?',
          answer: 'Go to your Wallet page, click "Withdraw", select your preferred payout method (bank transfer, PayPal, or crypto), and provide your account details. Withdrawals are processed within 3-5 business days.'
        },
        {
          question: 'Are there any fees?',
          answer: 'We charge a 10% platform fee on all transactions. This is automatically deducted from your earnings or added to your ad spend. No hidden fees!'
        }
      ]
    },
    {
      category: 'Technical & Support',
      questions: [
        {
          question: 'What banner sizes do you support?',
          answer: 'We recommend banners in 16:9 aspect ratio, ideally 1200x628 pixels. Supported file formats include JPG, PNG, and GIF with a maximum file size of 5MB.'
        },
        {
          question: 'How do you prevent fraudulent clicks?',
          answer: 'We use advanced fraud detection algorithms that identify and filter suspicious activity, including repeated clicks from the same IP, bot traffic, and click farms. You\'re only charged for genuine user interactions.'
        },
        {
          question: 'What if I need help with my account?',
          answer: 'Our support team is available 24/7 via email and live chat. Professional and Enterprise plans also include phone support. We typically respond within 2 hours.'
        },
        {
          question: 'Can I export my campaign data?',
          answer: 'Yes, you can export all your campaign data, including analytics and reports, in CSV or PDF format. API access is available for Professional and Enterprise plans for custom integrations.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find answers to common questions about AdFlow
          </p>
        </div>

        {faqs.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {category.category}
            </h2>

            <div className="space-y-4">
              {category.questions.map((faq, questionIndex) => {
                const isOpen = openIndex === `${categoryIndex}-${questionIndex}`
                return (
                  <Card key={questionIndex}>
                    <CardContent className="p-0">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : `${categoryIndex}-${questionIndex}`)}
                        className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-lg font-medium text-gray-900 dark:text-white flex-1 pr-4">
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6">
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}

        <Card className="mt-16">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Can't find the answer you're looking for? Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Contact Support
              </button>
              <button className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors">
                Live Chat
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FAQ
