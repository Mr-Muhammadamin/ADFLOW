import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDarkMode } from './hooks/useDarkMode'
import useAuthStore from './store/useAuthStore'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdvertiserDashboard from './pages/advertiser/Dashboard'
import PublisherDashboard from './pages/publisher/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import Campaigns from './pages/advertiser/Campaigns'
import CreateCampaign from './pages/advertiser/CreateCampaign'
import AdSpaces from './pages/publisher/AdSpaces'
import Wallet from './pages/Wallet'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import Pricing from './pages/Pricing'
import FAQ from './pages/FAQ'
function App() {
  const { toggleDarkMode } = useDarkMode()
  const { isAuthenticated, user } = useAuthStore()

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />
    }

    return children
  }

  return (
    <Layout toggleDarkMode={toggleDarkMode}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faq" element={<FAQ />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/advertiser/campaigns"
          element={
            <ProtectedRoute allowedRoles={['advertiser']}>
              <Campaigns />
            </ProtectedRoute>
          }
        />

        <Route
          path="/advertiser/campaigns/create"
          element={
            <ProtectedRoute allowedRoles={['advertiser']}>
              <CreateCampaign />
            </ProtectedRoute>
          }
        />

        <Route
          path="/publisher/ad-spaces"
          element={
            <ProtectedRoute allowedRoles={['publisher']}>
              <AdSpaces />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}

export default App
