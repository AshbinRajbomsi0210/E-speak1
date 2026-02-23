# OAuth & Email Verification Setup Guide

## Overview
Your login and register pages now support:
- ✅ Email/Password authentication
- ✅ Phone OTP authentication  
- ✅ **Google OAuth (needs setup)**
- ✅ **Facebook OAuth (needs setup)**
- ✅ **Email verification (needs setup)**
- ✅ **Compulsory phone number** (enforced)

---

## 🔧 Setting Up OAuth Providers in Supabase

### Prerequisites
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **e-Speak**
3. Navigate to: **Authentication → Providers**

### Google OAuth Setup

#### Step 1: Create Google OAuth Application
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google+ API**:
   - Search for "Google+ API"
   - Click Enable
4. Create OAuth 2.0 credentials:
   - Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
   - Choose **Web application**
   - Set **Authorized redirect URIs**:
     ```
     https://otqzbxhtnqephwgigylp.supabase.co/auth/v1/callback
     http://localhost:5174/auth/callback
     ```
   - Click Create
5. Copy **Client ID** and **Client Secret**

#### Step 2: Add to Supabase
1. In Supabase Dashboard: **Authentication → Providers → Google**
2. Toggle **Enable Google**
3. Paste:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Click **Save**

---

### Facebook OAuth Setup

#### Step 1: Create Facebook App
1. Go to [Meta Developers](https://developers.facebook.com)
2. Create a new app:
   - Choose **Consumer** as app type
   - Fill in app details
3. Add **Facebook Login** product
4. In **Facebook Login Settings**:
   - Set **Valid OAuth Redirect URIs**:
     ```
     https://otqzbxhtnqephwgigylp.supabase.co/auth/v1/callback
     http://localhost:5174/auth/callback
     ```
5. Get credentials from **App Settings**:
   - **App ID**
   - **App Secret** (keep secret, never commit)

#### Step 2: Add to Supabase
1. In Supabase Dashboard: **Authentication → Providers → Facebook**
2. Toggle **Enable Facebook**
3. Paste:
   - **Client ID**: Your App ID from Meta
   - **Client Secret**: Your App Secret from Meta
4. Click **Save**

---

## 📧 Email Verification Setup

### Current Status
- Email verification is **built into Supabase Auth**
- When users sign up with email/password, they receive a **verification email automatically**
- The redirect URL is set to: `http://localhost:5174/auth/callback`

### Configuration (Already in place)
The code includes:
```javascript
options: {
  emailRedirectTo: `${window.location.origin}/auth/callback`,
}
```

### Testing Email Verification Locally
For development, Supabase provides email testing:
1. Check **Authentication → Emails** in Supabase Dashboard
2. In development, email links are printed to browser console
3. For testing, use a real email address or Supabase test emails

---

## 📞 Compulsory Phone Number

### Status: ✅ Implemented
Phone number is now **required** in both forms:

**Registration Form:**
- Email/Password flow: `<span className="text-red-500">*</span>` next to "Phone Number"
- Phone OTP flow: Phone number required
- Validation: `if (!phone.trim()) { setError('Phone number is required'); }`

**Login Form:**
- Phone number stored in user profile during signup
- Users can login via phone OTP

---

## 🧪 Testing Locally

### Test Google/Facebook OAuth
1. Start development server:
   ```bash
   npm run dev
   ```
2. Go to http://localhost:5174/register
3. Click "Sign up with Google" or "Sign up with Facebook"
4. You'll be redirected to `/auth/callback` after OAuth
5. The callback page processes the session and redirects to home

### Test Email Verification
1. Register with email/password
2. Check browser console for verification link
3. Click the link or visit it manually

### Test Phone OTP
1. Use any test phone number with country code
2. In development, OTP codes appear in Supabase dashboard
3. Verify with the 6-digit code

---

## 🔐 Production Checklist

Before going to production:

- [ ] Set up real email provider (SendGrid, Mailgun, etc.)
- [ ] Configure production OAuth redirect URLs in Google & Facebook
- [ ] Set up Twilio for SMS/OTP (currently using Supabase OTP)
- [ ] Test all OAuth flows in production
- [ ] Enable email verification in Supabase settings
- [ ] Set password requirements and session duration
- [ ] Configure CORS properly for production domain
- [ ] Add rate limiting to prevent abuse
- [ ] Set up email templates for verification/password reset

---

## 📝 Environment Variables

Current setup uses:
```env
VITE_SUPABASE_PROJECT_URL=https://otqzbxhtnqephwgigylp.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

**Note**: Never commit secrets. Anon key is safe (public), but keep actual secret keys in Supabase dashboard only.

---

## 🐛 Troubleshooting

### OAuth redirects to blank page
- Check `/auth/callback` route is added to Routes.jsx ✅
- Verify redirect URL matches in Supabase AND Google/Facebook settings
- Check browser console for errors

### Email verification not working
- Verify email provider is configured in Supabase
- Check spam folder
- For local testing, look in browser console

### Phone OTP not sending
- Verify phone number format includes country code
- Check Supabase OTP provider is enabled
- In development, codes appear in Supabase dashboard

---

## 📞 Support

For issues:
1. Check Supabase logs: **Dashboard → Logs**
2. Browser console for frontend errors
3. Supabase documentation: https://supabase.com/docs
