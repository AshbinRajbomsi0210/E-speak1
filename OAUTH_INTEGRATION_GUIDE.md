# OAuth Integration Guide (Google & Facebook)

This guide explains how to integrate real Google and Facebook OAuth authentication into your E-speak application.

## Overview

Currently, the social login buttons in `LoginForm.jsx` use **mock authentication**. To enable real OAuth, you need to:

1. Register your app with Google and Facebook
2. Get API credentials (Client ID, Client Secret)
3. Choose an authentication method
4. Update your backend and frontend code

---

## Option 1: Using Firebase Authentication (Recommended - Easiest)

Firebase provides the easiest way to integrate multiple OAuth providers.

### Step 1: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to **Authentication** → **Sign-in method**
4. Enable **Google** and **Facebook** providers

### Step 2: Get Facebook App Credentials

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app (Type: Consumer)
3. Add **Facebook Login** product
4. In **Settings** → **Basic**, copy:
   - App ID
   - App Secret
5. Paste these into Firebase Console (Facebook provider settings)
6. Copy the OAuth redirect URI from Firebase and add it to Facebook app settings

### Step 3: Install Firebase

```bash
cd frontend
npm install firebase
```

### Step 4: Create Firebase Config

Create `frontend/src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
```

### Step 5: Update LoginForm.jsx

Replace the `handleSocialLogin` function:

```javascript
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../../../config/firebase';

const handleSocialLogin = async (provider) => {
  if (formData?.userType !== 'user') {
    setErrors({ general: 'Social login is only available for standard user accounts' });
    return;
  }
  
  setSocialLoading(provider);
  setErrors({});
  
  try {
    const authProvider = provider === 'google' ? googleProvider : facebookProvider;
    const result = await signInWithPopup(auth, authProvider);
    
    // Get user info
    const user = result.user;
    const socialUser = {
      email: user.email,
      name: user.displayName,
      avatar: user.photoURL,
      verified: user.emailVerified
    };
    
    // Sign in to your app context
    signIn('user', socialUser);
    setSuccessMessage(`${provider} login successful. Redirecting...`);
    setSocialLoading(null);
    setTimeout(() => navigate(redirectTo || '/profile'), 900);
    
  } catch (error) {
    console.error('Social login error:', error);
    setErrors({ general: `${provider} login failed: ${error.message}` });
    setSocialLoading(null);
  }
};
```

---

## Option 2: Using Django + Django-Allauth (Backend Integration)

This approach handles OAuth on the backend.

### Step 1: Install Dependencies

```bash
cd backend
pip install django-allauth
```

### Step 2: Update Django settings.py

```python
INSTALLED_APPS = [
    # ... existing apps
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.facebook',
]

SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'APP': {
            'client_id': 'YOUR_GOOGLE_CLIENT_ID',
            'secret': 'YOUR_GOOGLE_CLIENT_SECRET',
            'key': ''
        }
    },
    'facebook': {
        'METHOD': 'oauth2',
        'SCOPE': ['email', 'public_profile'],
        'APP': {
            'client_id': 'YOUR_FACEBOOK_APP_ID',
            'secret': 'YOUR_FACEBOOK_APP_SECRET',
            'key': ''
        }
    }
}

# Optional: Redirect after social login
ACCOUNT_LOGOUT_REDIRECT_URL = '/home'
LOGIN_REDIRECT_URL = '/profile'
```

### Step 3: Update urls.py

```python
urlpatterns = [
    # ... existing patterns
    path('accounts/', include('allauth.urls')),
]
```

### Step 4: Run Migrations

```bash
python manage.py migrate
```

### Step 5: Add Social Apps in Django Admin

1. Run: `python manage.py createsuperuser`
2. Go to: http://127.0.0.1:8000/admin
3. Navigate to: **Sites** → Add your domain
4. Navigate to: **Social applications** → Add new:
   - Provider: Google/Facebook
   - Name: Google/Facebook Login
   - Client id: YOUR_CLIENT_ID
   - Secret key: YOUR_SECRET_KEY
   - Sites: Select your site

### Step 6: Update Frontend

Change button URLs to point to backend:

```javascript
const handleSocialLogin = (provider) => {
  // Redirect to Django allauth OAuth endpoint
  window.location.href = `http://127.0.0.1:8000/accounts/${provider}/login/`;
};
```

---

## Option 3: Manual OAuth Flow (Most Control)

### For Google:

1. **Get Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create project → Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:5173/auth/google/callback`

2. **Frontend Flow:**

```javascript
// Install: npm install @react-oauth/google

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';

// Wrap your app with provider in main.jsx:
<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
  <App />
</GoogleOAuthProvider>

// In LoginForm:
<GoogleLogin
  onSuccess={(credentialResponse) => {
    const decoded = jwt_decode(credentialResponse.credential);
    console.log(decoded); // Has email, name, picture
    signIn('user', {
      email: decoded.email,
      name: decoded.name,
      avatar: decoded.picture
    });
  }}
  onError={() => {
    console.log('Login Failed');
  }}
/>
```

### For Facebook:

1. **Get Credentials:**
   - [Facebook Developers Console](https://developers.facebook.com/)
   - Create App → Add Facebook Login
   - Settings → Basic: Get App ID
   - Add Valid OAuth Redirect URI: `http://localhost:5173/auth/facebook/callback`

2. **Frontend Flow:**

```javascript
// Install: npm install react-facebook-login

import FacebookLogin from 'react-facebook-login';

<FacebookLogin
  appId="YOUR_FACEBOOK_APP_ID"
  autoLoad={false}
  fields="name,email,picture"
  callback={(response) => {
    if (response.accessToken) {
      signIn('user', {
        email: response.email,
        name: response.name,
        avatar: response.picture.data.url
      });
    }
  }}
  cssClass="your-custom-class"
  icon="fa-facebook"
/>
```

---

## Security Best Practices

1. **Never commit credentials** - Use environment variables:
   ```javascript
   // Create .env file
   VITE_GOOGLE_CLIENT_ID=your_client_id
   VITE_FACEBOOK_APP_ID=your_app_id
   
   // Access in code
   const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
   ```

2. **Use HTTPS in production** - OAuth providers require secure connections

3. **Validate tokens on backend** - Don't trust frontend-only authentication

4. **Set proper redirect URIs** - Match exactly what's in provider console

5. **Handle errors gracefully** - Show user-friendly messages

---

## Current Mock Implementation

The existing code in `Loginform.jsx` uses a **mock flow** that simulates OAuth:

```javascript
const handleSocialLogin = (provider) => {
  // This is MOCK authentication - replace with real OAuth
  setTimeout(() => {
    const mockSocialUser = {
      email: `demo.user@${provider}.com`,
      name: `${provider[0].toUpperCase() + provider.slice(1)} User`,
      avatar: null,
      verified: true
    };
    signIn('user', mockSocialUser);
    navigate('/profile');
  }, 1500);
};
```

Replace this with one of the real implementations above.

---

## Testing OAuth Locally

1. Use `localhost` (not `127.0.0.1`) in redirect URIs
2. Some providers require HTTPS - use tools like:
   - `ngrok` for tunneling
   - `mkcert` for local SSL certificates

---

## Recommended Approach

For E-speak, I recommend **Firebase Authentication** because:
- ✅ Free tier is generous
- ✅ Handles multiple providers easily
- ✅ Built-in security
- ✅ Works with both frontend and backend
- ✅ Easy to set up and maintain

---

## Next Steps

1. Choose your preferred method
2. Register apps with Google/Facebook
3. Get credentials
4. Install necessary packages
5. Update the code
6. Test thoroughly
7. Add error handling
8. Deploy with environment variables

Need help with any specific step? Let me know!
