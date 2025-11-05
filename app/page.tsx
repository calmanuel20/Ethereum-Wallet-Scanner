'use client'

import { useState } from 'react'
import axios from 'axios'
import WalletLookup from '@/components/WalletLookup'
import TransactionHistory from '@/components/TransactionHistory'
import PortfolioSummary from '@/components/PortfolioSummary'
import VisualDashboard from '@/components/VisualDashboard'
import AuthHeader from '@/components/AuthHeader'
import FavoriteWallets from '@/components/FavoriteWallets'

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [balances, setBalances] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [refreshFavorites, setRefreshFavorites] = useState(0)

  const handleWalletSelect = async (address: string) => {
    // Set the address and trigger lookup
    setWalletAddress(address)
    
    try {
      // Fetch balances
      const balancesResponse = await axios.get(
        `/api/wallet/balances?address=${address}`
      )
      const balances = balancesResponse.data.balances || []
      setBalances(balances)

      // Fetch transactions
      const transactionsResponse = await axios.get(
        `/api/wallet/transactions?address=${address}&limit=20`
      )
      const transactions = transactionsResponse.data.transactions || []
      setTransactions(transactions)

      // Fetch prices and calculate portfolio
      if (balances.length > 0) {
        const symbols = balances
          .map((b: any) => b.symbol)
          .filter((s: string) => s !== 'UNKNOWN')
          .join(',')
        
        // Get contract addresses for ERC-20 tokens (excluding ETH)
        const addresses = balances
          .filter((b: any) => b.contractAddress && b.contractAddress !== 'ETH' && b.contractAddress.startsWith('0x'))
          .map((b: any) => b.contractAddress.toLowerCase())
          .join(',')
        
        if (symbols || addresses) {
          try {
            // Build query params
            const params = new URLSearchParams()
            if (symbols) params.append('symbols', symbols)
            if (addresses) params.append('addresses', addresses)
            
            const pricesResponse = await axios.get(
              `/api/prices?${params.toString()}`
            )
            const prices = pricesResponse.data.prices || {}

            // Calculate portfolio value
            let totalValue = 0
            const portfolioData = balances.map((balance: any) => {
              // Try to get price by contract address first, then by symbol
              let price = 0
              if (balance.contractAddress && balance.contractAddress !== 'ETH' && balance.contractAddress.startsWith('0x')) {
                price = prices[balance.contractAddress.toLowerCase()] || 0
              }
              if (price === 0 && balance.symbol) {
                price = prices[balance.symbol] || prices[balance.symbol.toUpperCase()] || 0
              }
              
              const value = balance.balance * price
              totalValue += value
              return {
                ...balance,
                price,
                value,
              }
            })

            setPortfolioData({
              portfolioData,
              totalValue,
              prices,
            })
          } catch (priceError) {
            console.error('Error fetching prices:', priceError)
            setPortfolioData(null)
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching wallet data:', err)
    }
  }

  return (
    <main className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <AuthHeader />
        <h1 className="text-3xl font-semibold text-white mb-8 text-center">
          Crypto Dashboard
        </h1>

        <FavoriteWallets 
          onWalletSelect={handleWalletSelect}
          refreshTrigger={refreshFavorites}
        />

        <div className="mb-8">
          <WalletLookup
            onWalletChange={setWalletAddress}
            onBalancesLoaded={setBalances}
            onTransactionsLoaded={setTransactions}
            onPortfolioDataLoaded={setPortfolioData}
            currentWalletAddress={walletAddress}
            onFavoriteAdded={() => setRefreshFavorites((prev) => prev + 1)}
          />
        </div>

        {walletAddress && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <PortfolioSummary
                balances={balances}
                portfolioData={portfolioData}
              />
              <div className="space-y-6">
                <TransactionHistory
                  transactions={transactions}
                  walletAddress={walletAddress}
                />
                <VisualDashboard
                  balances={balances}
                  portfolioData={portfolioData}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

