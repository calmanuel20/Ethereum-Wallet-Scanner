'use client'

import { useState } from 'react'

interface TransactionHistoryProps {
  transactions: any[]
  walletAddress: string
}

interface AllTransactionsModalProps {
  transactions: any[]
  filter: 'all' | 'incoming' | 'outgoing'
  isOpen: boolean
  onClose: () => void
}

function AllTransactionsModal({
  transactions,
  filter,
  isOpen,
  onClose,
}: AllTransactionsModalProps) {
  if (!isOpen) return null

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true
    return tx.direction === filter
  })

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return timestamp
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">All Transactions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="border-b border-gray-800">
                  <th className="pb-3 text-gray-400 font-medium text-sm">Timestamp</th>
                  <th className="pb-3 text-gray-400 font-medium text-sm">Direction</th>
                  <th className="pb-3 text-gray-400 font-medium text-sm">Token</th>
                  <th className="pb-3 text-gray-400 font-medium text-sm">Value</th>
                  <th className="pb-3 text-gray-400 font-medium text-sm">Category</th>
                  <th className="pb-3 text-gray-400 font-medium text-sm">Hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, index) => (
                  <tr
                    key={tx.hash || index}
                    className="border-b border-gray-800 hover:bg-gray-800/50"
                  >
                    <td className="py-3 text-gray-300 text-sm">
                      {formatDate(tx.timestamp)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700`}
                      >
                        {tx.direction === 'incoming' ? '↓ In' : '↑ Out'}
                      </span>
                    </td>
                    <td className="py-3 text-white font-medium text-sm">{tx.token}</td>
                    <td className="py-3 text-white text-sm">
                      {tx.value.toLocaleString('en-US', {
                        maximumFractionDigits: 6,
                      })}
                    </td>
                    <td className="py-3 text-gray-400 text-sm uppercase">
                      {tx.category || 'N/A'}
                    </td>
                    <td className="py-3">
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white text-sm font-mono truncate block max-w-xs"
                      >
                        {tx.hash?.slice(0, 10)}...
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TransactionHistory({
  transactions,
  walletAddress,
}: TransactionHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing'>('all')
  const [showAllModal, setShowAllModal] = useState(false)

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Transaction History</h2>
        <p className="text-gray-400">No transactions found</p>
      </div>
    )
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true
    return tx.direction === filter
  })

  const recentTransactions = filteredTransactions.slice(0, 5)
  const hasMoreTransactions = filteredTransactions.length > 5

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return timestamp
    }
  }

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Transaction History</h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded transition-colors text-sm ${
                  filter === 'all'
                    ? 'bg-gray-800 text-white border border-gray-700'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('incoming')}
                className={`px-4 py-2 rounded transition-colors text-sm ${
                  filter === 'incoming'
                    ? 'bg-gray-800 text-white border border-gray-700'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                Incoming
              </button>
              <button
                onClick={() => setFilter('outgoing')}
                className={`px-4 py-2 rounded transition-colors text-sm ${
                  filter === 'outgoing'
                    ? 'bg-gray-800 text-white border border-gray-700'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                Outgoing
              </button>
            </div>
            {hasMoreTransactions && (
              <button
                onClick={() => setShowAllModal(true)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded transition-colors border border-gray-700"
              >
                View All ({filteredTransactions.length})
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="pb-3 text-gray-400 font-medium text-sm">Timestamp</th>
                <th className="pb-3 text-gray-400 font-medium text-sm">Direction</th>
                <th className="pb-3 text-gray-400 font-medium text-sm">Token</th>
                <th className="pb-3 text-gray-400 font-medium text-sm">Value</th>
                <th className="pb-3 text-gray-400 font-medium text-sm">Category</th>
                <th className="pb-3 text-gray-400 font-medium text-sm">Hash</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx, index) => (
                <tr
                  key={tx.hash || index}
                  className="border-b border-gray-800 hover:bg-gray-800/50"
                >
                  <td className="py-3 text-gray-300 text-sm">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                      {tx.direction === 'incoming' ? '↓ In' : '↑ Out'}
                    </span>
                  </td>
                  <td className="py-3 text-white font-medium text-sm">{tx.token}</td>
                  <td className="py-3 text-white text-sm">
                    {tx.value.toLocaleString('en-US', {
                      maximumFractionDigits: 6,
                    })}
                  </td>
                  <td className="py-3 text-gray-400 text-sm uppercase">
                    {tx.category || 'N/A'}
                  </td>
                  <td className="py-3">
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white text-sm font-mono truncate block max-w-xs"
                    >
                      {tx.hash?.slice(0, 10)}...
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMoreTransactions && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAllModal(true)}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              View all {filteredTransactions.length} transactions →
            </button>
          </div>
        )}
      </div>

      <AllTransactionsModal
        transactions={transactions}
        filter={filter}
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
      />
    </>
  )
}