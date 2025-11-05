'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function AuthHeader() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex justify-end mb-4">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex justify-end mb-4">
        <Link
          href="/auth/signin"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded transition-colors border border-gray-700"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="text-gray-400">
        Welcome, <span className="font-medium text-white">{session.user.email}</span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded transition-colors border border-gray-700"
      >
        Sign Out
      </button>
    </div>
  )
}

