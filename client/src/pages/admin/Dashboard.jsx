import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { formatCurrency, formatNumber } from '../../lib/utils'
import { Users, BarChart3, DollarSign, Activity, Shield, CheckCircle, XCircle, Clock, UserCheck, UserX } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [pendingCampaigns, setPendingCampaigns] = useState([])
  const [pendingWithdrawals, setPendingWithdrawals] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsRes, campaignsRes, withdrawalsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/campaigns/pending'),
        api.get('/admin/withdrawals/pending'),
        api.get('/admin/users'),
      ])
      setStats(statsRes.data)
      setPendingCampaigns(campaignsRes.data)
      setPendingWithdrawals(withdrawalsRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUser = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/block`)
      fetchAdminData()
    } catch (error) {
      console.error('Error blocking user:', error)
    }
  }

  const handleUnblockUser = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/unblock`)
      fetchAdminData()
    } catch (error) {
      console.error('Error unblocking user:', error)
    }
  }

  const handleApproveCampaign = async (campaignId) => {
    try {
      await api.post(`/admin/campaigns/${campaignId}/approve`)
      fetchAdminData()
    } catch (error) {
      console.error('Error approving campaign:', error)
    }
  }

  const handleRejectCampaign = async (campaignId) => {
    const reason = prompt('Enter rejection reason:')
    if (reason) {
      try {
        await api.post(`/admin/campaigns/${campaignId}/reject`, null, {
          params: { reason }
        })
        fetchAdminData()
      } catch (error) {
        console.error('Error rejecting campaign:', error)
      }
    }
  }

  const handleApproveWithdrawal = async (withdrawalId) => {
    try {
      await api.post(`/admin/withdrawals/${withdrawalId}/approve`)
      fetchAdminData()
    } catch (error) {
      console.error('Error approving withdrawal:', error)
    }
  }

  const handleRejectWithdrawal = async (withdrawalId) => {
    const reason = prompt('Enter rejection reason:')
    if (reason) {
      try {
        await api.post(`/admin/withdrawals/${withdrawalId}/reject`, null, {
          params: { reason }
        })
        fetchAdminData()
      } catch (error) {
        console.error('Error rejecting withdrawal:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.total_users || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.active_campaigns || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spend</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(stats?.total_spend || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Advertisers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.total_advertisers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Publishers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.total_publishers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(stats?.total_earnings || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Campaigns ({pendingCampaigns.length})
              </h2>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            {pendingCampaigns.length > 0 ? (
              <div className="space-y-4">
                {pendingCampaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{campaign.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Budget: {formatCurrency(campaign.total_budget)} | {campaign.platform_type}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveCampaign(campaign.id)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRejectCampaign(campaign.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No pending campaigns
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Withdrawals ({pendingWithdrawals.length})
              </h2>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            {pendingWithdrawals.length > 0 ? (
              <div className="space-y-4">
                {pendingWithdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(withdrawal.amount)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {withdrawal.payout_method}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveWithdrawal(withdrawal.id)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRejectWithdrawal(withdrawal.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No pending withdrawals
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Management
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Joined
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 10).map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 capitalize">
                      {user.role}
                    </td>
                    <td className="py-3 px-4">
                      {user.is_blocked ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          Blocked
                        </span>
                      ) : user.is_active ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {user.is_blocked ? (
                          <button
                            onClick={() => handleUnblockUser(user.id)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Unblock"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlockUser(user.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Block"
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard
