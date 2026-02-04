import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { formatDate } from '../lib/utils'
import { Mail, Send, Inbox, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

const Messages = () => {
  const [activeTab, setActiveTab] = useState('inbox')
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [composeData, setComposeData] = useState({
    receiver_id: '',
    subject: '',
    content: '',
  })
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchMessages()
    fetchUsers()
  }, [activeTab])

  const fetchMessages = async () => {
    try {
      const endpoint = activeTab === 'inbox' ? '/messages/inbox' : '/messages/sent'
      const res = await api.get(endpoint)
      setMessages(res.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users')
      setUsers(res.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleSendMessage = async () => {
    try {
      await api.post('/messages/', {
        ...composeData,
        receiver_id: parseInt(composeData.receiver_id),
      })
      setShowComposeModal(false)
      setComposeData({ receiver_id: '', subject: '', content: '' })
      if (activeTab === 'sent') {
        fetchMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.post(`/messages/${messageId}/mark-read`)
      fetchMessages()
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">Communicate with other users</p>
        </div>
        <Button onClick={() => setShowComposeModal(true)}>
          <Send className="w-5 h-5 mr-2" />
          Compose
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-0">
              <button
                onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
                className={`flex items-center px-6 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'inbox'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Inbox className="w-5 h-5 mr-2" />
                Inbox
              </button>
              <button
                onClick={() => { setActiveTab('sent'); setSelectedMessage(null); }}
                className={`flex items-center px-6 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'sent'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Send className="w-5 h-5 mr-2" />
                Sent
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : messages.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message)
                    if (!message.is_read && activeTab === 'inbox') {
                      handleMarkAsRead(message.id)
                    }
                  }}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                    !message.is_read && activeTab === 'inbox' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      !message.is_read && activeTab === 'inbox'
                        ? 'bg-primary-100 dark:bg-primary-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-medium ${
                          !message.is_read && activeTab === 'inbox'
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {message.subject || '(No Subject)'}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {message.content}
                      </p>
                      {!message.is_read && activeTab === 'inbox' && (
                        <span className="inline-flex items-center mt-2 text-xs text-primary-600">
                          <span className="w-2 h-2 bg-primary-600 rounded-full mr-1"></span>
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No messages found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title={selectedMessage?.subject || '(No Subject)'}
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-700">
              <span>
                {activeTab === 'inbox' ? `From: User #${selectedMessage.sender_id}` : `To: User #${selectedMessage.receiver_id}`}
              </span>
              <span>{formatDate(selectedMessage.created_at)}</span>
            </div>
            <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {selectedMessage.content}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        title="Compose Message"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recipient *
            </label>
            <select
              value={composeData.receiver_id}
              onChange={(e) => setComposeData({ ...composeData, receiver_id: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select recipient</option>
              {users.filter(u => u.id !== composeData.receiver_id).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={composeData.subject}
              onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Message subject..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              value={composeData.content}
              onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
              rows={5}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Type your message..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => { setShowComposeModal(false); setComposeData({ receiver_id: '', subject: '', content: '' }); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <Button onClick={handleSendMessage} disabled={!composeData.content || !composeData.receiver_id}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Messages
