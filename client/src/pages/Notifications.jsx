import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { formatDate } from '../lib/utils'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/')
      setNotifications(res.data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count')
      setUnreadCount(res.data.count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/mark-read`)
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read')
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'campaign_approved':
      case 'campaign_rejected':
        return '📢'
      case 'message':
        return '💬'
      case 'withdrawal':
        return '💰'
      case 'deposit':
        return '💵'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'campaign_approved':
        return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'campaign_rejected':
        return 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'message':
        return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'withdrawal':
        return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'deposit':
        return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {unreadCount > 0 && `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors ${
                    notification.is_read
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary-500'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`text-2xl`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm font-medium ${
                            notification.is_read
                              ? 'text-gray-700 dark:text-gray-300'
                              : 'text-gray-900 dark:text-white font-semibold'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Notifications
