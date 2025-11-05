'use client'

import { useState, useMemo } from 'react'
import AllHoldingsModal from './AllHoldingsModal'

interface PortfolioSummaryProps {
  balances: any[]
  portfolioData: any
}

export default function PortfolioSummary({
  balances,
  portfolioData,
}: PortfolioSummaryProps) {
  const [showAllModal, setShowAllModal] = useState(false)

  // Calculate all holdings with prices and values
  const allHoldings = useMemo(() => {
    const holdings = (portfolioData?.portfolioData || balances).map((balance: any) => {
      // Try to get price by contract address first, then by symbol
      let price = 0
      if (portfolioData?.prices) {
        if (
          balance.contractAddress &&
          balance.contractAddress !== 'ETH' &&
          balance.contractAddress.startsWith('0x')
        ) {
          price =
            portfolioData.prices[balance.contractAddress.toLowerCase()] || 0
        }
        if (price === 0 && balance.symbol) {
          price =
            portfolioData.prices[balance.symbol] ||
            portfolioData.prices[balance.symbol.toUpperCase()] ||
            0
        }
      }
      const value = balance.balance * price
      return {
        ...balance,
        price,
        value,
      }
    })

    // Sort by USD value (descending)
    return holdings.sort((a: any, b: any) => b.value - a.value)
  }, [portfolioData, balances])

  // Get top 10 holdings
  const topHoldings = useMemo(() => {
    return allHoldings.slice(0, 10)
  }, [allHoldings])

  if (!balances || balances.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Portfolio Summary</h2>
        <p className="text-gray-400">Enter a wallet address to view portfolio</p>
      </div>
    )
  }

  const totalValue = portfolioData?.totalValue || 0
  const hasMoreHoldings = allHoldings.length > 10

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Portfolio Summary</h2>
          {hasMoreHoldings && (
            <button
              onClick={() => setShowAllModal(true)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded transition-colors border border-gray-700"
            >
              View All ({allHoldings.length})
            </button>
          )}
        </div>
        <div className="mb-6">
          <div className="text-2xl font-semibold text-white mb-2">
            ${totalValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-gray-400 text-sm">Total Portfolio Value</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="pb-3 text-gray-400 font-medium text-sm">#</th>
                <th className="pb-3 text-gray-400 font-medium text-sm">Token</th>
                <th className="pb-3 text-gray-400 font-medium text-sm">Balance</th>
                <th className="pb-3 text-gray-400 font-medium text-sm">Price (USD)</th>
                <th className="pb-3 text-gray-400 font-medium text-sm">Value (USD)</th>
              </tr>
            </thead>
            <tbody>
              {topHoldings.map((balance: any, index: number) => (
                <tr
                  key={balance.contractAddress || index}
                  className="border-b border-gray-800"
                >
                  <td className="py-3 text-gray-400 text-sm">{index + 1}</td>
                  <td className="py-3 text-white">
                    <div className="font-medium">{balance.symbol}</div>
                    <div className="text-sm text-gray-400">{balance.name}</div>
                  </td>
                  <td className="py-3 text-white text-sm">
                    {balance.balance.toLocaleString('en-US', {
                      maximumFractionDigits: 6,
                    })}
                  </td>
                  <td className="py-3 text-white text-sm">
                    {balance.price > 0
                      ? `$${balance.price.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : 'N/A'}
                  </td>
                  <td className="py-3 text-white font-medium text-sm">
                    {balance.value > 0
                      ? `$${balance.value.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMoreHoldings && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAllModal(true)}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              View all {allHoldings.length} holdings →
            </button>
          </div>
        )}
      </div>

      <AllHoldingsModal
        holdings={allHoldings}
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
      />
    </>
  )
}

