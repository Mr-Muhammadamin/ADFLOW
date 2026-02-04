import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { Upload, X, Calendar, DollarSign, Globe } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const CreateCampaign = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform_type: 'website',
    banner_url: '',
    daily_budget: '',
    total_budget: '',
    start_date: '',
    end_date: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await api.post('/campaigns/upload-banner', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setBannerPreview(response.data.banner_url)
      setFormData({ ...formData, banner_url: response.data.banner_url })
    } catch (err) {
      setError('Failed to upload banner. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/campaigns/', {
        ...formData,
        daily_budget: parseFloat(formData.daily_budget),
        total_budget: parseFloat(formData.total_budget),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      })
      navigate('/advertiser/campaigns')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create campaign. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const removeBanner = () => {
    setBannerPreview(null)
    setFormData({ ...formData, banner_url: '' })
  }

  const minStartDate = new Date().toISOString().split('T')[0]
  const minEndDate = formData.start_date || minStartDate

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Campaign</h1>
        <p className="text-gray-600 dark:text-gray-400">Set up your advertising campaign</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campaign Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Summer Sale Promotion"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe your campaign..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform Type *
                </label>
                <select
                  name="platform_type"
                  value={formData.platform_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="website">Website</option>
                  <option value="telegram">Telegram</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Banner Image</h2>

            {bannerPreview ? (
              <div className="relative">
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={removeBanner}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  id="banner-upload"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                <label
                  htmlFor="banner-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {uploading ? 'Uploading...' : 'Click to upload banner image'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Recommended: 1200x628px, Max 5MB
                  </p>
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Daily Budget *
                </label>
                <input
                  type="number"
                  name="daily_budget"
                  value={formData.daily_budget}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="100.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Total Budget *
                </label>
                <input
                  type="number"
                  name="total_budget"
                  value={formData.total_budget}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="1000.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campaign Duration</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  min={minStartDate}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  End Date *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  min={minEndDate}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/advertiser/campaigns')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <Button type="submit" disabled={loading || uploading}>
            {loading ? 'Creating Campaign...' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateCampaign
