# Quick Start: Enhanced Authentication

## 🚀 What's New

Your authentication system now supports:
- ✅ **Google OAuth** (Sign in/Sign up)
- ✅ **Facebook OAuth** (Sign in/Sign up)  
- ✅ **Email Verification** (Automatic)
- ✅ **Compulsory Phone Number** (Required field)
- ✅ **Professional UI** (Pre-built components)

---

## ⚡ Quick Setup (5 minutes)

### 1. Test Locally (No Setup Required)
```bash
cd frontend
npm run dev
```

Visit:
- **Register**: http://localhost:5174/register
- **Login**: http://localhost:5174/login

Try:
- ✅ Email/Password signup (with phone required)
- ✅ Phone OTP signup
- ✅ Email/Password login

### 2. OAuth Setup (Google - 10 minutes)

**Step 1: Get Google Credentials**
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable "Google+ API"
4. Go to "Credentials"
5. Create "OAuth 2.0 Client ID"
6. Type: "Web application"
7. Authorized redirect URIs:
   ```
   https://otqzbxhtnqephwgigylp.supabase.co/auth/v1/callback
   http://localhost:5174/auth/callback
   ```
8. Copy: **Client ID** and **Client Secret**

**Step 2: Add to Supabase**
1. Go to https://app.supabase.com
2. Select your project: **e-Speak**
3. Go to: **Authentication → Providers → Google**
4. Toggle: **Enable Google**
5. Paste: Client ID and Client Secret
6. Click: **Save**

✅ Done! Google OAuth now works.

### 3. OAuth Setup (Facebook - 10 minutes)

**Step 1: Get Facebook Credentials**
1. Go to https://developers.facebook.com
2. Create new app
3. Type: "Consumer"
4. Add product: "Facebook Login"
5. Settings: Valid OAuth Redirect URIs:
   ```
   https://otqzbxhtnqephwgigylp.supabase.co/auth/v1/callback
   http://localhost:5174/auth/callback
   ```
6. Copy: **App ID** and **App Secret**

**Step 2: Add to Supabase**
1. Go to https://app.supabase.com
2. Select your project: **e-Speak**
3. Go to: **Authentication → Providers → Facebook**
4. Toggle: **Enable Facebook**
5. Paste: App ID and App Secret
6. Click: **Save**

✅ Done! Facebook OAuth now works.

---

## 🧪 Test Each Feature

### Test 1: Register with Email + Phone (Required)
1. Go to http://localhost:5174/register
2. Click **Email** tab
3. Fill in:
   - Full Name: `John Doe`
   - Email: `test@example.com`
   - **Phone**: `+977XXXXXXXXXX` (Required!)
   - Password: `Password123`
   - Confirm: `Password123`
4. Check "I agree to..."
5. Click **Create Account**
6. ✅ Check browser console for verification email link

### Test 2: Login with Email
1. Go to http://localhost:5174/login
2. Click **Email** tab
3. Enter your registered email
4. Enter password
5. Click **Sign In with Email**
6. ✅ Should redirect to home

### Test 3: Register with Phone OTP
1. Go to http://localhost:5174/register
2. Click **Phone** tab
3. Fill in:
   - Full Name: `Jane Doe`
   - **Phone**: `+977XXXXXXXXXX` (Required!)
4. Check "I agree to..."
5. Click **Send Verification Code**
6. Get OTP from Supabase Dashboard → Authentication
7. Enter 6-digit code
8. Click **Complete Sign Up**
9. ✅ Should redirect to home

### Test 4: Google OAuth (After Setup)
1. Go to http://localhost:5174/login
2. Click **Sign in with Google**
3. Login with your Google account
4. ✅ Should redirect to /auth/callback, then home

### Test 5: Facebook OAuth (After Setup)
1. Go to http://localhost:5174/register
2. Click **Sign up with Facebook**
3. Login with your Facebook account
4. ✅ Should redirect to /auth/callback, then home

---

## 📱 Phone Number Format Examples

Use these formats with country codes:
```
Nepal:     +977XXXXXXXXXX
USA:       +1XXXXXXXXXX
India:     +91XXXXXXXXXX
UK:        +441632960000
Canada:    +14165551234
Australia: +61212345678
```

---

## 🔍 Where to Find Things

| Feature | File |
|---------|------|
| Login Form | `frontend/src/pages/login/components/SupabaseLoginForm.jsx` |
| Register Form | `frontend/src/pages/register/components/SupabaseRegisterForm.jsx` |
| Auth Callback | `frontend/src/pages/auth/callback.jsx` |
| Routes | `frontend/src/Routes.jsx` |
| Setup Guide | `frontend/OAUTH_SETUP_GUIDE.md` |
| Full Docs | `frontend/AUTHENTICATION_ENHANCEMENT.md` |

---

## ✨ Key Features by Form

### Login Form
- Google OAuth button
- Facebook OAuth button
- Email/Password tab
- Phone OTP tab
- Show/hide password
- Error & success messages

### Register Form
- Google OAuth button
- Facebook OAuth button
- Email tab with:
  - Full Name (required)
  - Email
  - **Phone (required)** ⭐
  - Password (8+ chars)
  - Confirm Password
  - Terms checkbox
- Phone tab with:
  - Full Name (required)
  - **Phone (required)** ⭐
  - OTP verification
  - Terms checkbox

---

## 🐛 Troubleshooting

### "Sign in with Google" doesn't work
**Solution**: 
1. Check Google OAuth is added to Supabase
2. Check redirect URLs match exactly
3. Check browser console for errors

### "Phone number is required" error
**Solution**: 
1. Phone is now compulsory - enter a valid number with country code
2. Format: `+XXXXXXXXXXX`

### Email verification email not received
**Solution**:
1. In development, check browser console for link
2. For production, setup email provider in Supabase
3. Check spam folder

### OTP not sent
**Solution**:
1. Use proper format: `+XXXXXXXXXXX`
2. Check Supabase OTP provider is enabled
3. In dev, check Supabase Dashboard → Authentication

---

## 📋 Checklist Before Production

- [ ] Google OAuth configured in Supabase ✅
- [ ] Facebook OAuth configured in Supabase ✅
- [ ] Email provider setup (SendGrid, etc.) ⚠️
- [ ] SMS/Twilio setup for production OTP ⚠️
- [ ] Production domain URLs updated in OAuth providers
- [ ] CORS configured for production domain
- [ ] Email verification working
- [ ] Phone number storage verified
- [ ] Rate limiting enabled
- [ ] Error logging setup

---

## 📞 Need Help?

See: `frontend/OAUTH_SETUP_GUIDE.md`

Covers:
- Google OAuth setup (detailed)
- Facebook OAuth setup (detailed)
- Email verification config
- Troubleshooting guide
- Production checklist

---

## 🎉 You're All Set!

Everything is ready to use. Just:

1. ✅ **Locally**: npm run dev and test!
2. ⚠️ **OAuth**: Setup Google/Facebook (5-10 min each)
3. 🚀 **Deploy**: Your forms are production-ready

**Next**: Read `OAUTH_SETUP_GUIDE.md` for OAuth provider setup.
