# Supabase Authentication - Complete Setup & Testing Guide

## ✅ What's Been Set Up

### Backend:
- ✅ Supabase JWT authentication middleware
- ✅ Database connected to Supabase PostgreSQL
- ✅ API endpoints working with Supabase
- ✅ All migrations applied

### Frontend:
- ✅ Supabase Auth Context
- ✅ Protected Route component
- ✅ Login form (Email + Phone OTP)
- ✅ Register form (Email + Phone OTP)
- ✅ Same UI design as original

---

## 🚀 Step 1: Install Frontend Dependencies

```bash
cd frontend
npm install @supabase/supabase-js
```

---

## 🧪 Step 2: Test Backend

### Test 1: Check Database Connection
```bash
cd backend
python manage.py runserver
```

Visit: `http://127.0.0.1:8000/api/issues/`

Should see: List of issues from Supabase database

### Test 2: Create a Test Issue
```bash
curl -X POST http://127.0.0.1:8000/api/issues/create/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Issue",
    "description": "Testing Supabase integration",
    "category": "potholes",
    "priority": "high",
    "latitude": 27.7172,
    "longitude": 85.3240
  }'
```

### Test 3: Get Stats
```bash
curl http://127.0.0.1:8000/api/issues/stats/
```

---

## 🧪 Step 3: Test Frontend Authentication

### Test 1: Start Frontend
```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

### Test 2: Sign Up with Email
1. Click "Create Account"
2. Switch to "Email" tab
3. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPass123!
   - Confirm Password: TestPass123!
4. Check "I agree to Terms"
5. Click "Create Account"
6. Check email for verification link

### Test 3: Sign Up with Phone OTP
1. Click "Create Account"
2. Switch to "Phone" tab
3. Fill in:
   - Full Name: Test User
   - Phone: +977XXXXXXXXXX (your phone)
4. Check "I agree to Terms"
5. Click "Send Verification Code"
6. Enter 6-digit code received via SMS
7. Click "Verify & Create Account"

### Test 4: Sign In with Email
1. Click "Sign In"
2. Select "Email" tab
3. Enter email and password
4. Click "Sign In with Email"

### Test 5: Sign In with Phone
1. Click "Sign In"
2. Select "Phone" tab
3. Enter phone number
4. Click "Send OTP"
5. Enter 6-digit code
6. Click "Verify OTP"

---

## 🧪 Step 4: Test Protected Routes

After signing in:
1. Try accessing `/report-issue` - should work
2. Try accessing `/dashboard` - should work
3. Try signing out - should redirect to login
4. Try accessing protected page while logged out - should redirect

---

## 🧪 Step 5: Test API with JWT Token

### Get Access Token from Browser
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Find Supabase session data and copy `access_token`

### Test API with Token
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://127.0.0.1:8000/api/issues/
```

Should return: Authenticated response with data

---

## 📋 Complete Testing Checklist

### Authentication
- [ ] Email sign-up works
- [ ] Phone OTP sign-up works
- [ ] Email sign-in works
- [ ] Phone OTP sign-in works
- [ ] Sign-out works
- [ ] Redirect after login works
- [ ] Protected routes redirect to login when not authenticated

### Backend
- [ ] Database connection works
- [ ] Can create issues
- [ ] Can view issues list
- [ ] Can get issue stats
- [ ] API returns data
- [ ] JWT authentication works

### Frontend UI
- [ ] Login page looks correct
- [ ] Register page looks correct
- [ ] Tab switching works (Email/Phone)
- [ ] Error messages display
- [ ] Success messages display
- [ ] Form validation works
- [ ] Loading states work

### Security
- [ ] Password fields masked
- [ ] JWT token stored securely
- [ ] No sensitive data in localStorage
- [ ] CORS working correctly
- [ ] API requires authentication (optional)

---

## 🆘 Troubleshooting

### Issue: "Cannot find Supabase environment variables"
**Solution**: Check `.env` file has:
```
VITE_SUPABASE_PROJECT_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Issue: "OTP not received"
**Solution**: 
- Check phone number format with country code
- Wait a few seconds (SMS can be slow)
- Try requesting OTP again

### Issue: "Login fails with JWT error"
**Solution**:
- Restart backend server
- Check SUPABASE_JWT_SECRET_KEY in backend .env

### Issue: "Cannot access protected route"
**Solution**:
- Sign in first
- Check token is being stored
- Check AuthProvider wraps App

---

## 📊 Testing Summary

After completing all tests, you should have:

✅ Full Supabase authentication working  
✅ Email sign-up and sign-in  
✅ Phone OTP sign-up and sign-in  
✅ Protected routes functional  
✅ Backend API responding  
✅ Database operations working  
✅ JWT tokens working  

---

## 🎉 Next Steps

1. **Test all features**: Follow testing checklist
2. **Test edge cases**: Wrong password, invalid phone, etc.
3. **Check error handling**: Make sure error messages are helpful
4. **Test on mobile**: Use Chrome DevTools mobile view
5. **Deploy**: When ready, deploy to production

---

## 📞 Need Help?

Check these files:
- Backend: `backend/server/supabase_auth.py`
- Frontend Context: `frontend/src/context/SupabaseAuthContext.jsx`
- Login Form: `frontend/src/pages/login/components/SupabaseLoginForm.jsx`
- Register Form: `frontend/src/pages/register/components/SupabaseRegisterForm.jsx`
