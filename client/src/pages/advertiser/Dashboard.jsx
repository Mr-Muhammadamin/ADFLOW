import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { formatCurrency, formatNumber } from '../../lib/utils'
import { BarChart3, TrendingUp, Eye, MousePointer, DollarSign, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'

const AdvertiserDashboard = () => {
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalViews: 0,
    totalClicks: 0,
    totalSpend: 0,
    averageCTR: 0,
  })
  const [recentCampaigns, setRecentCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const campaignsRes = await api.get('/campaigns/')
      const campaigns = campaignsRes.data

      let totalViews = 0
      let totalClicks = 0
      let totalSpend = 0

      campaigns.forEach(c => {
        totalViews += c.total_views || 0
        totalClicks += c.total_clicks || 0
        totalSpend += c.total_spend || 0
      })

      setStats({
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalViews,
        totalClicks,
        totalSpend,
        averageCTR: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0,
      })

      setRecentCampaigns(campaigns.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { name: 'Total Campaigns', value: stats.totalCampaigns, icon: BarChart3, color: 'bg-blue-500' },
    { name: 'Active Campaigns', value: stats.activeCampaigns, icon: TrendingUp, color: 'bg-green-500' },
    { name: 'Total Views', value: formatNumber(stats.totalViews), icon: Eye, color: 'bg-purple-500' },
    { name: 'Total Clicks', value: formatNumber(stats.totalClicks), icon: MousePointer, color: 'bg-orange-500' },
    { name: 'Total Spend', value: formatCurrency(stats.totalSpend), icon: DollarSign, color: 'bg-red-500' },
    { name: 'Average CTR', value: `${stats.averageCTR}%`, icon: TrendingUp, color: 'bg-cyan-500' },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advertiser Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of your advertising campaigns</p>
        </div>
        <Link to="/advertiser/campaigns/create">
          <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>New Campaign</span>
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.name}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Campaigns
              </h2>
              {recentCampaigns.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          Campaign
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          Platform
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          Views
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          Clicks
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          Spend
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4">
                            <Link
                              to={`/advertiser/campaigns/${campaign.id}`}
                              className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                              {campaign.title}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 capitalize">
                            {campaign.platform_type}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              campaign.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                              campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                              campaign.status === 'finished' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {formatNumber(campaign.total_views)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {formatNumber(campaign.total_clicks)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                            {formatCurrency(campaign.total_spend)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No campaigns yet</p>
                  <Link to="/advertiser/campaigns/create">
                    <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                      Create Your First Campaign
                    </button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default AdvertiserDashboard
