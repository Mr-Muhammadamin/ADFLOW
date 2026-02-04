import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { formatCurrency, formatNumber } from '../../lib/utils'
import { BarChart3, TrendingUp, Eye, MousePointer, DollarSign, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'

const PublisherDashboard = () => {
  const [stats, setStats] = useState({
    totalAdSpaces: 0,
    activeAdSpaces: 0,
    totalViews: 0,
    totalClicks: 0,
    totalEarnings: 0,
  })
  const [recentAdSpaces, setRecentAdSpaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const adSpacesRes = await api.get('/ad-spaces/')
      const adSpaces = adSpacesRes.data

      let totalViews = 0
      let totalClicks = 0
      let totalEarnings = 0

      adSpaces.forEach(space => {
        totalViews += space.total_views || 0
        totalClicks += space.total_clicks || 0
        totalEarnings += space.total_earnings || 0
      })

      setStats({
        totalAdSpaces: adSpaces.length,
        activeAdSpaces: adSpaces.filter(s => s.status === 'active').length,
        totalViews,
        totalClicks,
        totalEarnings,
      })

      setRecentAdSpaces(adSpaces.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { name: 'Total Ad Spaces', value: stats.totalAdSpaces, icon: BarChart3, color: 'bg-blue-500' },
    { name: 'Active Ad Spaces', value: stats.activeAdSpaces, icon: TrendingUp, color: 'bg-green-500' },
    { name: 'Total Views', value: formatNumber(stats.totalViews), icon: Eye, color: 'bg-purple-500' },
    { name: 'Total Clicks', value: formatNumber(stats.totalClicks), icon: MousePointer, color: 'bg-orange-500' },
    { name: 'Total Earnings', value: formatCurrency(stats.totalEarnings), icon: DollarSign, color: 'bg-red-500' },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Publisher Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of your ad spaces</p>
        </div>
        <Link to="/publisher/ad-spaces/create">
          <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>New Ad Space</span>
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
                Your Ad Spaces
              </h2>
              {recentAdSpaces.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                          Ad Space
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
                          Earnings
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAdSpaces.map((space) => (
                        <tr key={space.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                            {space.name}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 capitalize">
                            {space.platform_type}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              space.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {space.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {formatNumber(space.total_views)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {formatNumber(space.total_clicks)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                            {formatCurrency(space.total_earnings)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No ad spaces yet</p>
                  <Link to="/publisher/ad-spaces/create">
                    <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                      Add Your First Ad Space
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

export default PublisherDashboard
