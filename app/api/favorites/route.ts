import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - List all favorites for the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const favorites = await prisma.favoriteWallet.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ favorites })
  } catch (error: any) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

// POST - Add a favorite wallet
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { address, label } = body

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const existing = await prisma.favoriteWallet.findUnique({
      where: {
        userId_address: {
          userId: session.user.id,
          address: address.toLowerCase(),
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Wallet already in favorites' },
        { status: 400 }
      )
    }

    const favorite = await prisma.favoriteWallet.create({
      data: {
        address: address.toLowerCase(),
        label: label || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ favorite }, { status: 201 })
  } catch (error: any) {
    console.error('Error adding favorite:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Wallet already in favorites' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a favorite wallet
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    await prisma.favoriteWallet.deleteMany({
      where: {
        userId: session.user.id,
        address: address.toLowerCase(),
      },
    })

    return NextResponse.json({ message: 'Favorite removed' })
  } catch (error: any) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}

