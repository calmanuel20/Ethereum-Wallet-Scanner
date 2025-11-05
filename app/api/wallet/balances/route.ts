import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')

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
    // Fetch ETH balance
    const ethBalanceResponse = await fetch(
      `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBalance',
          params: [address, 'latest'],
        }),
      }
    )

    const ethBalanceData = await ethBalanceResponse.json()
    const ethBalanceWei = BigInt(ethBalanceData.result || '0')
    const ethBalance = Number(ethBalanceWei) / 1e18

    // Fetch ERC-20 token balances
    const tokenBalancesResponse = await fetch(
      `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getTokenBalances',
          params: [address],
        }),
      }
    )

    const tokenBalancesData = await tokenBalancesResponse.json()
    const tokenBalances = tokenBalancesData.result?.tokenBalances || []

    // Get token metadata for non-zero balances
    const nonZeroTokens = tokenBalances.filter(
      (token: any) => token.tokenBalance !== '0x0'
    )

    const tokensWithMetadata = await Promise.all(
      nonZeroTokens.map(async (token: any) => {
        try {
          const metadataResponse = await fetch(
            `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'alchemy_getTokenMetadata',
                params: [token.contractAddress],
              }),
            }
          )

          const metadataData = await metadataResponse.json()
          const metadata = metadataData.result

          const balanceWei = BigInt(token.tokenBalance)
          const decimals = metadata.decimals || 18
          const balance = Number(balanceWei) / Math.pow(10, decimals)

          return {
            contractAddress: token.contractAddress,
            symbol: metadata.symbol || 'UNKNOWN',
            name: metadata.name || 'Unknown Token',
            balance: balance,
            decimals: decimals,
          }
        } catch (error) {
          console.error('Error fetching token metadata:', error)
          return null
        }
      })
    )

    const validTokens = tokensWithMetadata.filter((token) => token !== null)

    // Add ETH to the balances array
    const allBalances = [
      {
        contractAddress: 'ETH',
        symbol: 'ETH',
        name: 'Ethereum',
        balance: ethBalance,
        decimals: 18,
      },
      ...validTokens,
    ]

    return NextResponse.json({ balances: allBalances })
  } catch (error: any) {
    console.error('Error fetching balances:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balances' },
      { status: 500 }
    )
  }
}

