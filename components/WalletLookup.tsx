'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

interface WalletLookupProps {
  onWalletChange: (address: string) => void
  onBalancesLoaded: (balances: any[]) => void
  onTransactionsLoaded: (transactions: any[]) => void
  onPortfolioDataLoaded: (data: any) => void
  currentWalletAddress?: string
  onFavoriteAdded?: () => void
}

export default function WalletLookup({
  onWalletChange,
  onBalancesLoaded,
  onTransactionsLoaded,
  onPortfolioDataLoaded,
  currentWalletAddress,
  onFavoriteAdded,
}: WalletLookupProps) {
  const { data: session } = useSession()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [addingFavorite, setAddingFavorite] = useState(false)
  const [showNicknameInput, setShowNicknameInput] = useState(false)
  const [favoriteLabel, setFavoriteLabel] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    if (!currentWalletAddress) return
    
    try {
      await navigator.clipboard.writeText(currentWalletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleLookup = async () => {
    if (!address.trim()) {
      setError('Please enter a wallet address')
      return
    }

    // Basic Ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      setError('Invalid Ethereum address format')
      return
    }

    setLoading(true)
    setError('')

    try {
      const walletAddress = address.trim().toLowerCase()
      onWalletChange(walletAddress)

      // Check if wallet is already a favorite
      if (session) {
        try {
          const favoritesResponse = await axios.get('/api/favorites')
          const favorites = favoritesResponse.data.favorites || []
          const isFav = favorites.some((f: any) => f.address.toLowerCase() === walletAddress)
          setIsFavorite(isFav)
        } catch (err) {
          // Ignore error, just don't show favorite status
        }
      }

      // Fetch balances
      const balancesResponse = await axios.get(
        `/api/wallet/balances?address=${walletAddress}`
      )
      const balances = balancesResponse.data.balances || []
      onBalancesLoaded(balances)

      // Fetch transactions
      const transactionsResponse = await axios.get(
        `/api/wallet/transactions?address=${walletAddress}&limit=20`
      )
      const transactions = transactionsResponse.data.transactions || []
      onTransactionsLoaded(transactions)

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

            onPortfolioDataLoaded({
              portfolioData,
              totalValue,
              prices,
            })
          } catch (priceError) {
            console.error('Error fetching prices:', priceError)
            onPortfolioDataLoaded(null)
          }
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch wallet data')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFavorite = async () => {
    if (!showNicknameInput) {
      setShowNicknameInput(true)
      return
    }

    setAddingFavorite(true)
    try {
      await axios.post('/api/favorites', {
        address: currentWalletAddress,
        label: favoriteLabel.trim() || null,
      })
      setIsFavorite(true)
      setFavoriteLabel('')
      setShowNicknameInput(false)
      onFavoriteAdded?.()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add favorite')
    } finally {
      setAddingFavorite(false)
    }
  }

  const handleRemoveFavorite = async () => {
    if (confirm('Remove from favorites?')) {
      try {
        await axios.delete(`/api/favorites?address=${currentWalletAddress}`)
        setIsFavorite(false)
        setShowNicknameInput(false)
        setFavoriteLabel('')
      } catch (err) {
        alert('Failed to remove favorite')
      }
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Wallet Lookup</h2>
        {session && currentWalletAddress && (
          <div className="flex items-center gap-2">
            {isFavorite ? (
              <>
                <span className="text-yellow-400 text-sm">★</span>
                <button
                  onClick={handleRemoveFavorite}
                  className="text-gray-400 hover:text-red-400 text-xs transition-colors"
                  title="Remove from favorites"
                >
                  Remove
                </button>
              </>
            ) : (
              <button
                onClick={handleAddFavorite}
                disabled={addingFavorite}
                className="text-gray-400 hover:text-yellow-400 transition-colors text-sm"
                title="Add to favorites"
              >
                {showNicknameInput ? (
                  addingFavorite ? 'Adding...' : '✓'
                ) : (
                  '★'
                )}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
          placeholder="Enter Ethereum wallet address (0x...)"
          className="flex-1 px-4 py-3 rounded bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-gray-600"
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-white font-medium rounded transition-colors border border-gray-700"
        >
          {loading ? 'Loading...' : 'Lookup'}
        </button>
      </div>
      {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}

      {currentWalletAddress && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-gray-400 text-sm whitespace-nowrap">Wallet:</span>
              <span className="text-white font-mono text-sm break-all">
                {currentWalletAddress}
              </span>
            </div>
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded transition-colors border border-gray-700"
              title="Copy address"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {session && currentWalletAddress && showNicknameInput && !isFavorite && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={favoriteLabel}
              onChange={(e) => setFavoriteLabel(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFavorite()}
              placeholder="Nickname (optional)"
              className="flex-1 px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-gray-600 text-sm"
              autoFocus
            />
            <button
              onClick={handleAddFavorite}
              disabled={addingFavorite}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-white font-medium rounded transition-colors text-sm border border-gray-700"
            >
              {addingFavorite ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowNicknameInput(false)
                setFavoriteLabel('')
              }}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded transition-colors text-sm border border-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

