# Next.js + Supabase Application

A modern web application built with Next.js 14, Supabase for authentication and database, and TypeScript.

## Features

- ⚡ Next.js 14 with App Router
- 🔐 Supabase Authentication with OAuth providers
- 🎨 Tailwind CSS for styling
- 📱 Responsive design with dark mode support
- 🔧 TypeScript for type safety
- 🚀 Modern development experience

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase project

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project settings
3. Copy your project URL and anon key

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Then update the values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 4. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Add your site URL to the Site URL field (e.g., `http://localhost:3000`)
3. Add `http://localhost:3000/auth/callback` to the Redirect URLs
4. Enable GitHub OAuth provider if you want to use GitHub sign-in

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility functions
│   └── supabase.ts        # Supabase client
├── middleware.ts          # Next.js middleware
├── tailwind.config.js     # Tailwind configuration
└── package.json           # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Authentication

The app includes:

- OAuth authentication with GitHub
- Session management
- Protected routes (can be extended)
- User profile display

## Database

Supabase provides:

- PostgreSQL database
- Real-time subscriptions
- Row Level Security (RLS)
- Database backups

## Deployment

### Vercel (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables in Vercel:**
   - In your Vercel project dashboard, go to Settings → Environment Variables
   - Add the same variables from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (optional)

4. **Update Supabase authentication settings:**
   - In your Supabase dashboard, go to Authentication → Settings
   - Add your Vercel domain to Site URL (e.g., `https://your-app.vercel.app`)
   - Add redirect URL: `https://your-app.vercel.app/auth/callback`

5. **Deploy!** Vercel will automatically build and deploy your app.

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- **Netlify** - Similar process to Vercel
- **Railway** - Great for full-stack apps
- **DigitalOcean App Platform** - Good for production
- **AWS Amplify** - Enterprise-grade deployment

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details