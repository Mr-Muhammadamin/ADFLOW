import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.role === 'advertiser') {
      navigate('/advertiser/campaigns')
    } else if (user?.role === 'publisher') {
      navigate('/publisher/ad-spaces')
    } else if (user?.role === 'admin') {
      navigate('/admin/dashboard')
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
}

export default Dashboard
