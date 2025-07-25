# Deployment Guide

## Quick Deployment to Netlify

### Prerequisites
- Node.js 18+ installed
- Netlify account
- Supabase project configured

### Step 1: Prepare Environment
Make sure your `.env` file contains the correct Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 2: Quick Deploy
Run the deployment script:
```bash
./deploy.sh
```

This script will:
1. Install dependencies (if needed)
2. Build the application
3. Deploy to Netlify using the CLI

### Step 3: Configure Netlify Environment Variables
After deployment, add these environment variables in your Netlify site settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Step 4: Test Your Deployment
1. Navigate to your Netlify URL
2. Login with the admin account: `salle.kma@gmail.com`
3. Test the main features:
   - Strategy Map (both views)
   - Data Management
   - User Management
   - Dashboard

## Manual Deployment

### Option 1: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option 2: Git Integration
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

### Option 3: Manual Upload
1. Run `npm run build`
2. Upload the `dist` folder to your web hosting service

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run lint`

### Application Won't Load
- Verify environment variables are set correctly
- Check browser console for errors
- Ensure Supabase URLs are accessible

### Authentication Issues
- Verify Supabase configuration
- Check if the admin user exists in the database
- Ensure Supabase auth is properly configured

## Features to Test After Deployment

1. **Authentication**
   - Login with admin account
   - User registration (if enabled)
   - Role-based access control

2. **Strategy Map**
   - Interactive mindmap view
   - BSC matrix view
   - Objective clicking and modal display

3. **Data Management**
   - CSV template downloads
   - CSV file imports
   - Error handling and validation

4. **User Management**
   - User creation and editing
   - Role assignment
   - Division assignment

5. **Dashboard**
   - Data visualization
   - Statistics display
   - Performance metrics

## Performance Notes

- The application uses code splitting for better performance
- D3.js visualizations are optimized to prevent infinite loops
- Supabase queries are cached using React Query
- All components are responsive and mobile-friendly

## Security Considerations

- Environment variables are not exposed in the client
- Supabase Row Level Security (RLS) is enabled
- User authentication is required for all protected routes
- Role-based access control is implemented throughout