import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const limit = parseInt(searchParams.get('limit') || '20')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  if (!alchemyApiKey) {
    return NextResponse.json(
      { error: 'Alchemy API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Fetch both incoming and outgoing transactions
    const [incomingResponse, outgoingResponse] = await Promise.all([
      // Incoming transactions
      fetch(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getAssetTransfers',
          params: [
            {
              fromBlock: '0x0',
              toBlock: 'latest',
              toAddress: address,
              excludeZeroValue: false,
              category: ['external', 'erc20', 'erc721', 'erc1155'],
              maxCount: `0x${limit.toString(16)}`,
              withMetadata: true,
            },
          ],
        }),
      }),
      // Outgoing transactions
      fetch(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'alchemy_getAssetTransfers',
          params: [
            {
              fromBlock: '0x0',
              toBlock: 'latest',
              fromAddress: address,
              excludeZeroValue: false,
              category: ['external', 'erc20', 'erc721', 'erc1155'],
              maxCount: `0x${limit.toString(16)}`,
              withMetadata: true,
            },
          ],
        }),
      }),
    ])

    const [incomingData, outgoingData] = await Promise.all([
      incomingResponse.json(),
      outgoingResponse.json(),
    ])

    // Combine all transfers
    const allTransfers = [
      ...(incomingData.result?.transfers || []),
      ...(outgoingData.result?.transfers || []),
    ]

    // Remove duplicates by hash
    const uniqueTransfers = Array.from(
      new Map(allTransfers.map((t: any) => [t.hash, t])).values()
    )

    // Format transactions
    const formattedTransactions = uniqueTransfers.map((transfer: any) => {
      const isIncoming = transfer.to?.toLowerCase() === address.toLowerCase()
      const direction = isIncoming ? 'incoming' : 'outgoing'
      const value = transfer.value || 0
      const token = transfer.asset || transfer.contractAddress || 'ETH'
      const timestamp = transfer.metadata?.blockTimestamp || new Date().toISOString()

      return {
        hash: transfer.hash,
        timestamp,
        token,
        direction,
        value: parseFloat(value),
        from: transfer.from,
        to: transfer.to,
        category: transfer.category,
      }
    })

    // Sort by timestamp (newest first)
    formattedTransactions.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({
      transactions: formattedTransactions.slice(0, limit),
    })
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

