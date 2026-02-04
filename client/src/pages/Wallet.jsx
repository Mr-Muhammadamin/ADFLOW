import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { formatCurrency, formatDate } from '../lib/utils'
import { Plus, Download, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe('pk_test_placeholder')

const Wallet = () => {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    payout_method: '',
    payout_details: '',
  })

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      const [walletRes, transactionsRes, withdrawalsRes] = await Promise.all([
        api.get('/wallet/'),
        api.get('/wallet/transactions'),
        api.get('/wallet/withdrawals'),
      ])
      setWallet(walletRes.data)
      setTransactions(transactionsRes.data)
      setWithdrawals(withdrawalsRes.data)
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    try {
      const response = await api.post('/wallet/deposit', null, {
        params: { amount: parseFloat(depositAmount) }
      })
      
      const stripe = await stripePromise
      const { error } = await stripe.confirmCardPayment(response.data.client_secret, {
        payment_method: {
          card: {
            token: 'tok_visa',
          },
        },
      })

      if (error) {
        console.error('Payment failed:', error)
      } else {
        setShowDepositModal(false)
        setDepositAmount('')
        fetchWalletData()
      }
    } catch (error) {
      console.error('Error processing deposit:', error)
    }
  }

  const handleWithdrawal = async () => {
    try {
      await api.post('/wallet/withdrawal', {
        ...withdrawalData,
        amount: parseFloat(withdrawalData.amount),
      })
      setShowWithdrawalModal(false)
      setWithdrawalData({ amount: '', payout_method: '', payout_details: '' })
      fetchWalletData()
    } catch (error) {
      console.error('Error processing withdrawal:', error)
    }
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return ArrowDownLeft
      case 'withdrawal': return ArrowUpRight
      case 'campaign_spend': return ArrowUpRight
      case 'earning': return ArrowDownLeft
      default: return WalletIcon
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit': return 'text-green-600'
      case 'withdrawal': return 'text-red-600'
      case 'campaign_spend': return 'text-red-600'
      case 'earning': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your funds</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <WalletIcon className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Available Balance</p>
                  <p className="text-4xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => setShowDepositModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => setShowWithdrawalModal(true)}
              >
                <Download className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Deposits</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(
                    transactions
                      .filter(t => t.transaction_type === 'deposit' && t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Withdrawals</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(
                    withdrawals
                      .filter(w => w.status === 'completed')
                      .reduce((sum, w) => sum + w.amount, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</span>
                <span className="text-sm font-medium text-primary-600">
                  {formatCurrency(
                    transactions
                      .filter(t => t.transaction_type === 'earning' && t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Transactions
            </h3>
            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                        <React.createElement(getTransactionIcon(transaction.transaction_type), {
                          className: `w-5 h-5 ${getTransactionColor(transaction.transaction_type)}`
                        })}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {transaction.transaction_type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                        {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'earning' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No transactions yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Withdrawals
            </h3>
            <div className="space-y-4">
              {withdrawals.length > 0 ? (
                withdrawals.slice(0, 10).map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {withdrawal.payout_method}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(withdrawal.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        -{formatCurrency(withdrawal.amount)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No withdrawals yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={showDepositModal}
        onClose={() => { setShowDepositModal(false); setDepositAmount(''); }}
        title="Add Funds"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (USD)
            </label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="1"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="100.00"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Minimum deposit: $10.00
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setShowDepositModal(false); setDepositAmount(''); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <Button onClick={handleDeposit} disabled={!depositAmount || parseFloat(depositAmount) < 10}>
              Proceed to Payment
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showWithdrawalModal}
        onClose={() => { setShowWithdrawalModal(false); setWithdrawalData({ amount: '', payout_method: '', payout_details: '' }); }}
        title="Request Withdrawal"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Balance: {formatCurrency(wallet?.balance || 0)}
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (USD)
            </label>
            <input
              type="number"
              name="amount"
              value={withdrawalData.amount}
              onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
              min="10"
              max={wallet?.balance || 0}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="100.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payout Method
            </label>
            <select
              name="payout_method"
              value={withdrawalData.payout_method}
              onChange={(e) => setWithdrawalData({ ...withdrawalData, payout_method: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="crypto">Cryptocurrency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payout Details
            </label>
            <textarea
              name="payout_details"
              value={withdrawalData.payout_details}
              onChange={(e) => setWithdrawalData({ ...withdrawalData, payout_details: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your account details..."
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Minimum withdrawal: $10.00
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setShowWithdrawalModal(false); setWithdrawalData({ amount: '', payout_method: '', payout_details: '' }); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <Button onClick={handleWithdrawal} disabled={!withdrawalData.amount || parseFloat(withdrawalData.amount) < 10}>
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Wallet
