import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { formatCurrency, formatNumber, formatDate } from '../../lib/utils'
import { Plus, Pause, Play, MoreVertical, Search, Filter } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { CampaignStatus } from '../../services/api'

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/campaigns/')
      setCampaigns(res.data)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePause = async (campaignId) => {
    try {
      await api.post(`/campaigns/${campaignId}/pause`)
      fetchCampaigns()
    } catch (error) {
      console.error('Error pausing campaign:', error)
    }
  }

  const handleResume = async (campaignId) => {
    try {
      await api.post(`/campaigns/${campaignId}/resume`)
      fetchCampaigns()
    } catch (error) {
      console.error('Error resuming campaign:', error)
    }
  }

  const handleActivate = async (campaignId) => {
    try {
      await api.post(`/campaigns/${campaignId}/activate`)
      fetchCampaigns()
    } catch (error) {
      console.error('Error activating campaign:', error)
    }
  }

  const filteredCampaigns = campaigns.filter(c =>
    c.title.toLowerCase().includes(filter.toLowerCase()) ||
    c.platform_type.toLowerCase().includes(filter.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'finished': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your advertising campaigns</p>
        </div>
        <Link to="/advertiser/campaigns/create">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="grid gap-6">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {campaign.banner_url && (
                        <img
                          src={campaign.banner_url}
                          alt={campaign.title}
                          className="w-32 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {campaign.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {campaign.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="capitalize">Platform: {campaign.platform_type}</span>
                          <span>Budget: {formatCurrency(campaign.total_budget)}</span>
                          <span>Spend: {formatCurrency(campaign.total_spend)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 px-4 border-l border-r border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(campaign.total_views)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(campaign.total_clicks)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Clicks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-600">
                        {campaign.total_views > 0 ? ((campaign.total_clicks / campaign.total_views) * 100).toFixed(2) : 0}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">CTR</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {campaign.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleActivate(campaign.id)}
                      >
                        Activate
                      </Button>
                    )}
                    {campaign.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePause(campaign.id)}
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResume(campaign.id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Resume
                      </Button>
                    )}
                    <Link to={`/advertiser/campaigns/${campaign.id}`}>
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                  <span>Created: {formatDate(campaign.created_at)}</span>
                  {campaign.start_date && (
                    <span className="ml-4">Start: {formatDate(campaign.start_date)}</span>
                  )}
                  {campaign.end_date && (
                    <span className="ml-4">End: {formatDate(campaign.end_date)}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No campaigns found</p>
            <Link to="/advertiser/campaigns/create">
              <Button>Create Your First Campaign</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Campaigns
