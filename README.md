# Crypto Dashboard

A modern crypto dashboard for tracking Ethereum wallet balances and transactions.

## Features

- **Wallet Lookup**: Input any Ethereum wallet address to fetch balances and transactions
- **Balance Display**: View ETH and ERC-20 token balances in a clean table format
- **Transaction History**: See the last 5 transactions with filters for incoming/outgoing (view all in modal)
- **Portfolio Summary**: Display top 10 holdings by USD value with option to view all holdings
- **Token Allocation**: Pie chart showing token distribution
- **User Authentication**: Sign up, sign in, and save favorite wallets for easy access

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Alchemy API key: `NEXT_PUBLIC_ALCHEMY_API_KEY=your_key_here`
   - Add your Moralis API key: `NEXT_PUBLIC_MORALIS_API_KEY=your_key_here`
   - Add NextAuth configuration: `NEXTAUTH_URL=http://localhost:3000` and `NEXTAUTH_SECRET=your_secret_here`
   - Add database URL: `DATABASE_URL="file:./dev.db"`
   - Get an Alchemy API key at [Alchemy](https://www.alchemy.com/)
   - Get a Moralis API key at [Moralis](https://moralis.io/) (free tier available)

3. Initialize the database:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Recharts**: Data visualization
- **NextAuth.js**: Authentication
- **Prisma**: Database ORM with SQLite
- **Alchemy API**: Blockchain data
- **Moralis API**: Token price data (primary)
- **CoinGecko API**: Price data (fallback)

## API Routes

- `/api/wallet/balances` - Fetch wallet balances
- `/api/wallet/transactions` - Fetch transaction history
- `/api/prices` - Fetch token prices from Moralis API (by contract address)
- `/api/auth/register` - User registration
- `/api/auth/[...nextauth]` - NextAuth authentication endpoints
- `/api/favorites` - Manage favorite wallets (GET, POST, DELETE)

## Notes

- The dashboard uses Alchemy's free tier API. For production use, consider upgrading for higher rate limits.
- Moralis API is used for accurate token price lookups by contract address. Free tier available with rate limits.
- CoinGecko API is used as a fallback for common tokens and ETH price.
- User data and favorite wallets are stored in a local SQLite database.

