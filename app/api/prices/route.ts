import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbols = searchParams.get('symbols')
  const addresses = searchParams.get('addresses') // Contract addresses for ERC-20 tokens

  if (!symbols && !addresses) {
    return NextResponse.json(
      { error: 'Symbols or addresses are required' },
      { status: 400 }
    )
  }

  const moralisApiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY

  if (!moralisApiKey) {
    return NextResponse.json(
      { error: 'Moralis API key not configured' },
      { status: 500 }
    )
  }

  try {
    const prices: { [key: string]: number } = {}

    // Fetch ETH price (native token) - use WETH address for Moralis
    if (symbols && symbols.toLowerCase().includes('eth')) {
      try {
        // Moralis uses WETH contract address for ETH price
        const ethResponse = await fetch(
          `https://deep-index.moralis.io/api/v2/erc20/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/price?chain=eth`,
          {
            headers: {
              'X-API-Key': moralisApiKey,
              Accept: 'application/json',
            },
          }
        )

        if (ethResponse.ok) {
          const ethData = await ethResponse.json()
          const ethPrice = parseFloat(ethData.usdPrice) || 0
          if (ethPrice > 0) {
            prices['ETH'] = ethPrice
          }
        }
      } catch (error) {
        console.error('Error fetching ETH price from Moralis:', error)
      }
      
      // Fallback to CoinGecko if Moralis didn't work
      if (!prices['ETH'] || prices['ETH'] === 0) {
        try {
          const cgResponse = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
          )
          if (cgResponse.ok) {
            const cgData = await cgResponse.json()
            prices['ETH'] = cgData.ethereum?.usd || 0
          }
        } catch (fallbackError) {
          console.error('Fallback ETH price fetch failed:', fallbackError)
        }
      }
    }

    // Fetch prices for ERC-20 tokens by contract address
    if (addresses) {
      const addressArray = addresses.split(',').map((a) => a.trim().toLowerCase()).filter(a => a && a !== 'eth' && a.startsWith('0x'))
      
      if (addressArray.length > 0) {
        // Fetch prices for each token (Moralis v2 API requires individual calls or batch)
        const pricePromises = addressArray.map(async (address) => {
          try {
            const tokenPriceResponse = await fetch(
              `https://deep-index.moralis.io/api/v2/erc20/${address}/price?chain=eth`,
              {
                headers: {
                  'X-API-Key': moralisApiKey,
                  Accept: 'application/json',
                },
              }
            )

            if (tokenPriceResponse.ok) {
              const tokenData = await tokenPriceResponse.json()
              if (tokenData.usdPrice) {
                return { address, price: parseFloat(tokenData.usdPrice) }
              }
            }
          } catch (error) {
            console.error(`Error fetching price for ${address}:`, error)
          }
          return null
        })

        const priceResults = await Promise.all(pricePromises)
        priceResults.forEach((result) => {
          if (result) {
            prices[result.address] = result.price
          }
        })
      }
    }

    // Also try to fetch by symbol for common tokens (fallback)
    if (symbols) {
      const symbolArray = symbols.split(',').map((s) => s.trim().toUpperCase()).filter(s => s !== 'ETH')
      
      // For tokens not found by address, try CoinGecko as fallback
      const commonTokens: { [key: string]: string } = {
        USDT: 'tether',
        USDC: 'usd-coin',
        DAI: 'dai',
        WBTC: 'wrapped-bitcoin',
        LINK: 'chainlink',
        UNI: 'uniswap',
        AAVE: 'aave',
      }

      const missingSymbols = symbolArray.filter(s => !prices[s])
      
      if (missingSymbols.length > 0) {
        try {
          const cgIds = missingSymbols
            .map(s => commonTokens[s])
            .filter(Boolean)
            .join(',')

          if (cgIds) {
            const cgResponse = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${cgIds}&vs_currencies=usd`
            )
            
            if (cgResponse.ok) {
              const cgData = await cgResponse.json()
              Object.keys(commonTokens).forEach(symbol => {
                const id = commonTokens[symbol]
                if (cgData[id] && !prices[symbol]) {
                  prices[symbol] = cgData[id].usd || 0
                }
              })
            }
          }
        } catch (error) {
          console.error('Error fetching prices from CoinGecko fallback:', error)
        }
      }
    }

    return NextResponse.json({ prices })
  } catch (error: any) {
    console.error('Error fetching prices:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}

