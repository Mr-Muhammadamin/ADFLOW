import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { formatCurrency, formatNumber, formatDate } from '../../lib/utils'
import { Plus, Edit, Trash2, Search, Globe, MessageCircle, Instagram } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

const AdSpaces = () => {
  const [adSpaces, setAdSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAdSpace, setSelectedAdSpace] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    platform_type: 'website',
    description: '',
    url: '',
    price_per_view: '',
    price_per_click: '',
  })

  useEffect(() => {
    fetchAdSpaces()
  }, [])

  const fetchAdSpaces = async () => {
    try {
      const res = await api.get('/ad-spaces/')
      setAdSpaces(res.data)
    } catch (error) {
      console.error('Error fetching ad spaces:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        price_per_view: parseFloat(formData.price_per_view),
        price_per_click: parseFloat(formData.price_per_click),
      }
      if (selectedAdSpace) {
        await api.put(`/ad-spaces/${selectedAdSpace.id}`, data)
      } else {
        await api.post('/ad-spaces/', data)
      }
      setShowCreateModal(false)
      setShowEditModal(false)
      setSelectedAdSpace(null)
      resetForm()
      fetchAdSpaces()
    } catch (error) {
      console.error('Error saving ad space:', error)
    }
  }

  const handleEdit = (adSpace) => {
    setSelectedAdSpace(adSpace)
    setFormData({
      name: adSpace.name,
      platform_type: adSpace.platform_type,
      description: adSpace.description || '',
      url: adSpace.url || '',
      price_per_view: adSpace.price_per_view,
      price_per_click: adSpace.price_per_click,
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      platform_type: 'website',
      description: '',
      url: '',
      price_per_view: '',
      price_per_click: '',
    })
  }

  const getPlatformIcon = (type) => {
    switch (type) {
      case 'website': return Globe
      case 'telegram': return MessageCircle
      case 'instagram': return Instagram
      default: return Globe
    }
  }

  const filteredAdSpaces = adSpaces.filter(s =>
    s.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.platform_type.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ad Spaces</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your advertising spaces</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          New Ad Space
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search ad spaces..."
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
      ) : filteredAdSpaces.length > 0 ? (
        <div className="grid gap-6">
          {filteredAdSpaces.map((space) => (
            <Card key={space.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      {React.createElement(getPlatformIcon(space.platform_type), { className: 'w-6 h-6 text-primary-600' })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {space.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          space.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {space.status}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 capitalize">
                          {space.platform_type}
                        </span>
                      </div>
                      {space.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {space.description}
                        </p>
                      )}
                      {space.url && (
                        <a
                          href={space.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          {space.url}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-4 border-l border-r border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Price/View</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ${space.price_per_view}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Price/Click</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ${space.price_per_click}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Views</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(space.total_views)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Earnings</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(space.total_earnings)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(space)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                  <span>Created: {formatDate(space.created_at)}</span>
                  <span className="ml-4">Total Clicks: {formatNumber(space.total_clicks)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No ad spaces found</p>
            <Button onClick={() => setShowCreateModal(true)}>Add Your First Ad Space</Button>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        title={selectedAdSpace ? 'Edit Ad Space' : 'Create New Ad Space'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., My Tech Blog"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform Type *
            </label>
            <select
              name="platform_type"
              value={formData.platform_type}
              onChange={(e) => setFormData({ ...formData, platform_type: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="website">Website</option>
              <option value="telegram">Telegram Channel</option>
              <option value="instagram">Instagram Page</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe your ad space..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price per View ($)
              </label>
              <input
                type="number"
                name="price_per_view"
                value={formData.price_per_view}
                onChange={(e) => setFormData({ ...formData, price_per_view: e.target.value })}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price per Click ($)
              </label>
              <input
                type="number"
                name="price_per_click"
                value={formData.price_per_click}
                onChange={(e) => setFormData({ ...formData, price_per_click: e.target.value })}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.10"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => { setShowCreateModal(false); resetForm(); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <Button type="submit">
              {selectedAdSpace ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedAdSpace(null); resetForm(); }}
        title="Edit Ad Space"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price per View ($)
              </label>
              <input
                type="number"
                name="price_per_view"
                value={formData.price_per_view}
                onChange={(e) => setFormData({ ...formData, price_per_view: e.target.value })}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price per Click ($)
              </label>
              <input
                type="number"
                name="price_per_click"
                value={formData.price_per_click}
                onChange={(e) => setFormData({ ...formData, price_per_click: e.target.value })}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => { setShowEditModal(false); setSelectedAdSpace(null); resetForm(); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdSpaces
