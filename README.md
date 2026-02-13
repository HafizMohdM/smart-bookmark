# Smart Bookmark App

A secure, real-time bookmark manager built with **Next.js 14**, **Supabase**, and **Tailwind CSS**.

## Features

- **Authentication**: Secure Google OAuth login via Supabase Auth.
- **Real-time Updates**: Bookmarks sync instantly across tabs and devices using Supabase Realtime.
- **Modern UI**: Clean, responsive interface styled with Tailwind CSS (v4).
- **Security**: Row Level Security (RLS) ensures users only access their own data.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-bookmark
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Realtime Implementation

The app uses Supabase Realtime to listen for database changes:
- **channel**: `realtime-bookmarks`
- **events**: INSERT, UPDATE, DELETE on `public.bookmarks`
- **filtering**: Client-side filtering ensures UI consistency while respecting RLS.

