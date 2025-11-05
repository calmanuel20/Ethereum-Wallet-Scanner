'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import axios from 'axios'

interface FavoriteWallet {
  id: string
  address: string
  label: string | null
}

interface FavoriteWalletsProps {
  onWalletSelect: (address: string) => void
  refreshTrigger?: number
}

export default function FavoriteWallets({ onWalletSelect, refreshTrigger }: FavoriteWalletsProps) {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<FavoriteWallet[]>([])

  useEffect(() => {
    if (session) {
      loadFavorites()
    }
  }, [session, refreshTrigger])

  const loadFavorites = async () => {
    try {
      const response = await axios.get('/api/favorites')
      setFavorites(response.data.favorites || [])
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const handleRemove = async (address: string) => {
    if (!confirm('Remove this wallet from favorites?')) return

    try {
      await axios.delete(`/api/favorites?address=${address}`)
      setFavorites(favorites.filter((f) => f.address !== address))
    } catch (error) {
      console.error('Error removing favorite:', error)
      alert('Failed to remove favorite')
    }
  }

  if (!session) {
    return null
  }

  if (favorites.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Favorite Wallets</h3>
        <p className="text-gray-400 text-sm">No favorite wallets yet. Add one after searching for a wallet!</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">Favorite Wallets</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:bg-gray-800/80 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {favorite.label && (
                  <div className="text-white font-medium mb-1 truncate">
                    {favorite.label}
                  </div>
                )}
                <div className="text-gray-400 text-sm font-mono truncate">
                  {favorite.address.slice(0, 6)}...{favorite.address.slice(-4)}
                </div>
              </div>
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => onWalletSelect(favorite.address)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded transition-colors border border-gray-600"
                >
                  View
                </button>
                <button
                  onClick={() => handleRemove(favorite.address)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded transition-colors border border-gray-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

