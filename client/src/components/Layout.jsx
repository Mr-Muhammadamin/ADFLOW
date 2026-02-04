import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Moon, Sun, Bell, Mail, Wallet, LogOut, LayoutDashboard } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

const Layout = ({ children, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'FAQ', path: '/faq' },
  ]

  const dashboardLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ...(user?.role === 'advertiser' ? [{ name: 'Campaigns', path: '/advertiser/campaigns' }] : []),
    ...(user?.role === 'publisher' ? [{ name: 'Ad Spaces', path: '/publisher/ad-spaces' }] : []),
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Messages', path: '/messages', icon: Mail },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  AdFlow
                </span>
              </Link>

              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400 hidden dark:block" />
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 block dark:hidden" />
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/notifications"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                  >
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user?.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user?.username}
                      </span>
                    </button>

                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {user?.role}
                          </p>
                        </div>

                        {dashboardLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowDropdown(false)}
                          >
                            {link.icon && <link.icon className="w-4 h-4 mr-2" />}
                            {link.name}
                          </Link>
                        ))}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isOpen ? (
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  {dashboardLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Logout
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 bg-primary-50 dark:bg-primary-900"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  AdFlow
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect advertisers with publishers for effective ad campaigns.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 AdFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
