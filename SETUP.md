# Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
   ```

3. **Get an Alchemy API Key:**
   - Go to https://www.alchemy.com/
   - Sign up for a free account
   - Create a new app on Ethereum Mainnet
   - Copy your API key and paste it in `.env.local`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to http://localhost:3000

## Features

- Enter any Ethereum wallet address to view balances and transactions
- View ETH and ERC-20 token balances
- See transaction history with filters
- View portfolio value in USD
- Interactive charts for token allocation and portfolio value

## Notes

- The CoinGecko API is used for price data (free tier, no API key needed)
- The line chart shows mock historical data - in production you'd fetch real historical data
- Alchemy free tier has rate limits - consider upgrading for production use

