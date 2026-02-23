# Clerk + Supabase Integration Setup Guide

## Overview
This guide walks you through setting up **Clerk for Authentication** with **Supabase for Backend Database**.

### Architecture
- **Frontend Auth**: Clerk (handles login, signup, OAuth, email verification)
- **Backend Database**: Supabase (stores user profiles, roles, and application data)
- **User Sync**: Automatic sync from Clerk to Supabase via ClerkAuthContext

---

## Prerequisites
- ✅ Clerk account with publishable key: `pk_test_YmV0dGVyLWZseS04MS5jbGVyay5hY2NvdW50cy5kZXYk`
- ✅ Supabase project URL and API key (already configured)
- ✅ Node.js and npm installed
- ✅ @clerk/clerk-react already installed

---

## Step 1: Supabase Database Setup

### Create the user_profiles table

Run the SQL migration in your Supabase dashboard:

```sql
-- Location: Supabase Dashboard → SQL Editor → New Query
-- Copy and paste the migration from: backend/supabase_migrations/001_create_user_profiles.sql
```

**This creates:**
- `user_profiles` table to store Clerk users
- Role support (user, admin, authority)
- RLS (Row Level Security) policies
- Indexes for performance

### Run the Migration

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Copy the SQL from `backend/supabase_migrations/001_create_user_profiles.sql`
5. Click **Run**

---

## Step 2: Environment Configuration

Your `.env` file is already configured:

```dotenv
# Frontend Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YmV0dGVyLWZseS04MS5jbGVyay5hY2NvdW50cy5kZXYk

# Supabase Configuration
VITE_SUPABASE_PROJECT_URL=https://otqzbxhtnqephwgigylp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Frontend Setup

### Files Modified/Created

1. **[src/context/ClerkAuthContext.jsx](src/context/ClerkAuthContext.jsx)** (NEW)
   - Wraps Clerk authentication with Supabase database sync
   - Provides useAuth hook for components
   - Automatically syncs Clerk users to Supabase on login

2. **[src/App.jsx](src/App.jsx)** (UPDATED)
   - Wrapped with `<ClerkProvider>` for Clerk authentication
   - Wrapped with `<ClerkAuthProvider>` for role management and Supabase sync

3. **[src/pages/login/components/ClerkLoginForm.jsx](src/pages/login/components/ClerkLoginForm.jsx)** (NEW)
   - Two-step login flow:
     - Step 1: Role selection (user/admin/authority)
     - Step 2: Clerk SignIn component
   - Uses native Clerk components for email/password and OAuth

4. **[src/pages/register/components/ClerkSignUpForm.jsx](src/pages/register/components/ClerkSignUpForm.jsx)** (NEW)
   - Two-step signup flow:
     - Step 1: Role selection
     - Step 2: Clerk SignUp component

5. **[src/pages/login/index.jsx](src/pages/login/index.jsx)** (UPDATED)
   - Now uses ClerkLoginForm instead of SupabaseLoginForm

6. **[src/pages/register/index.jsx](src/pages/register/index.jsx)** (UPDATED)
   - Now uses ClerkSignUpForm instead of SupabaseRegisterForm

---

## Step 4: Clerk Configuration (In Clerk Dashboard)

### 1. Enable OAuth Providers
Go to your [Clerk Dashboard](https://dashboard.clerk.com)

1. Select your application
2. Go to **Integrations** → **Social Providers**
3. Enable **Google OAuth**:
   - Click "Google"
   - Add your credentials from Google Cloud Console
4. Enable **Facebook OAuth**:
   - Click "Facebook"
   - Add your credentials from Facebook Developer Platform

### 2. Configure Email/SMS
1. Go to **Integrations** → **Email**
   - Configure SMTP or use Clerk's built-in email service

2. Go to **Integrations** → **SMS** (for phone OTP)
   - Configure Twilio or another SMS provider

### 3. Setup Webhook (Optional but Recommended)
For automatic user creation in Supabase when Clerk users sign up:

1. Go to **Webhooks** in Clerk Dashboard
2. Create a new webhook with endpoint: `https://your-backend.com/webhooks/clerk`
3. Select events: `user.created`, `user.updated`
4. Backend will sync the user to Supabase

---

## Step 5: Test the Integration

### Test Login/Signup
1. Go to http://localhost:5173 (your frontend dev server)
2. Click **Sign In**
3. Select a role (user/admin/authority)
4. Sign in with email or OAuth
5. Check Supabase: `user_profiles` table should have the new user

### Test Supabase Sync
1. Open Supabase Dashboard
2. Go to **Table Editor** → **user_profiles**
3. Verify user data is synced with correct role

---

## Step 6: How It Works

### Login Flow
```
User clicks "Sign In"
    ↓
Selects Role (user/admin/authority)
    ↓
Clerk SignIn Component (email, password, or OAuth)
    ↓
Clerk authenticates user
    ↓
ClerkAuthContext automatically syncs to Supabase
    ↓
User profile created/updated in user_profiles table
    ↓
Role stored in Supabase
    ↓
Redirect to home
```

### Data Sync
```
ClerkAuthContext (in useEffect)
    ↓
Detects successful Clerk sign-in
    ↓
Fetches/creates user_profiles row in Supabase
    ↓
Stores: clerk_id, email, full_name, role, profile_image
    ↓
useAuth hook provides role to app components
```

---

## Step 7: Using useAuth in Components

### Get Current User and Role
```jsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, profile, selectedRole, isSignedIn } = useAuth();

  if (!isSignedIn) return <p>Not signed in</p>;

  return (
    <div>
      <p>Name: {user?.fullName}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {selectedRole}</p>
    </div>
  );
}
```

### Update User Role
```jsx
const { updateUserRole } = useAuth();

async function changeRole() {
  try {
    await updateUserRole('admin');
  } catch (err) {
    console.error('Failed to update role:', err);
  }
}
```

---

## Features Included

✅ **Authentication**
- Email/password login
- Google OAuth
- Facebook OAuth
- Email verification

✅ **Role Management**
- Three roles: user, admin, authority
- Role selection during signup
- Role stored in Supabase

✅ **Database Integration**
- User profiles stored in Supabase
- Automatic sync from Clerk
- Row Level Security (RLS) policies

✅ **Security**
- Clerk handles secure auth
- Supabase RLS protects data
- No passwords stored in Supabase

---

## Troubleshooting

### "Missing VITE_CLERK_PUBLISHABLE_KEY"
- Check your `.env` file has `VITE_CLERK_PUBLISHABLE_KEY` set
- Restart your dev server after changing .env

### Users not syncing to Supabase
- Check Supabase connection in ClerkAuthContext
- Verify `user_profiles` table exists
- Check browser console for errors

### OAuth not working
- Verify OAuth providers enabled in Clerk Dashboard
- Check redirect URIs match your frontend URL
- Clear browser cache and cookies

### Role not saving
- Verify `user_profiles` table has `role` column
- Check Supabase RLS policies allow updates
- Check for console errors in browser

---

## Next Steps

1. ✅ Run Supabase migration to create user_profiles table
2. ✅ Test login/signup flow
3. ✅ Configure Clerk OAuth providers
4. ✅ Update protected routes to check user roles
5. ✅ Create admin/authority-specific pages

---

## File Locations
- Frontend Auth: `frontend/src/context/ClerkAuthContext.jsx`
- Login Form: `frontend/src/pages/login/components/ClerkLoginForm.jsx`
- Signup Form: `frontend/src/pages/register/components/ClerkSignUpForm.jsx`
- Database Migration: `backend/supabase_migrations/001_create_user_profiles.sql`
- Env Config: `frontend/.env`

---

## Support
- Clerk Docs: https://clerk.com/docs
- Supabase Docs: https://supabase.com/docs
- Contact: Your support team
