# GitHub Setup Instructions

Follow these steps to push your Crypto Dashboard to GitHub:

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., `crypto-dashboard`)
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 2: Initialize Git and Push (Terminal Commands)

Run these commands in your project directory:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Crypto Dashboard"

# Add your GitHub repository as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Update Environment Variables

**IMPORTANT:** After pushing to GitHub, you should:

1. Go to your repository on GitHub
2. Click "Settings" → "Secrets and variables" → "Actions" (for Actions)
3. Or use GitHub Secrets for deployment platforms

**For local development:**
- Keep your `.env.local` file (already in .gitignore)
- Never commit API keys to GitHub

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: Crypto Dashboard"

# Create repo and push (will prompt for repository name)
gh repo create --public --source=. --remote=origin --push
```

## Troubleshooting

- **"Repository not found"**: Check that you've created the repository on GitHub first
- **"Permission denied"**: You may need to set up SSH keys or use a Personal Access Token
- **"Large files"**: Make sure `node_modules` is in `.gitignore` (it already is)

## Next Steps

After pushing to GitHub, you can:
- Set up GitHub Actions for CI/CD
- Deploy to Vercel (seamless Next.js integration)
- Share your repository with others
- Add collaborators

