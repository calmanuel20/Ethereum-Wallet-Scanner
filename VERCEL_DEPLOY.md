# Vercel Deployment Guide

## Prerequisites

1. Your repository is already on GitHub
2. You have a Vercel account (sign up at https://vercel.com)

## Step 1: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `calmanuel20/Ethereum-Wallet-Scanner`
4. Vercel will auto-detect it's a Next.js project

## Step 2: Configure Environment Variables

**IMPORTANT:** Add these environment variables in Vercel:

1. In the project settings, go to "Environment Variables"
2. Add the following variables:

### Required Variables:
```
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key_here
NEXT_PUBLIC_MORALIS_API_KEY=your_moralis_key_here
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=generate_a_random_secret_here
DATABASE_URL=file:./dev.db
```

### Generate NEXTAUTH_SECRET:
You can generate a random secret by running:
```bash
openssl rand -base64 32
```
Or use an online generator: https://generate-secret.vercel.app/32

### Important Notes:
- **NEXTAUTH_URL**: Will be your Vercel deployment URL (e.g., `https://ethereum-wallet-scanner.vercel.app`)
- **DATABASE_URL**: For SQLite, this works on Vercel, but the database file is ephemeral (resets on each deployment)
- For production, consider using **Vercel Postgres** (free tier available) for persistent data

## Step 3: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. If successful, you'll get a deployment URL

## Step 4: Database Setup (If using SQLite)

**Note:** SQLite on Vercel has limitations:
- Database file resets on each deployment
- Not suitable for production with persistent data

**For production, use Vercel Postgres instead:**

1. In Vercel dashboard, go to "Storage"
2. Click "Create Database" → "Postgres"
3. Update your `DATABASE_URL` to use the Postgres connection string
4. Update `prisma/schema.prisma` to use `provider = "postgresql"` instead of `sqlite`
5. Run migrations: `npx prisma migrate deploy`

## Troubleshooting

### Build Fails with Prisma Error
- Make sure `postinstall` script is in package.json (already added)
- Check that DATABASE_URL is set correctly

### NextAuth Errors
- Verify NEXTAUTH_URL matches your Vercel deployment URL
- Ensure NEXTAUTH_SECRET is set and is a random string
- Check that all environment variables are added to Vercel

### Database Connection Issues
- For SQLite: The file path must be relative (`file:./dev.db`)
- For Postgres: Use the connection string provided by Vercel

## Quick Deploy Checklist

- [ ] Repository pushed to GitHub
- [ ] Project imported to Vercel
- [ ] All environment variables added
- [ ] NEXTAUTH_SECRET generated and added
- [ ] NEXTAUTH_URL set to Vercel URL
- [ ] Build completes successfully
- [ ] Test the deployment

