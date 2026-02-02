# Facebook OAuth Setup Guide

This guide will help you set up Facebook Login for your AIcelerate application.

## Prerequisites

- A Facebook account
- Your application running locally or deployed

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** in the top right
3. Click **"Create App"**
4. Select **"Consumer"** as the app type
5. Fill in the app details:
   - **App Name**: AIcelerate (or your app name)
   - **App Contact Email**: Your email
   - **Business Account**: Optional
6. Click **"Create App"**

## Step 2: Add Facebook Login Product

1. In your app dashboard, find **"Add Products"** section
2. Find **"Facebook Login"** and click **"Set Up"**
3. Choose **"Web"** as the platform
4. Skip the quickstart (we'll configure manually)

## Step 3: Configure OAuth Settings

1. In the left sidebar, go to **"Facebook Login"** > **"Settings"**
2. Under **"Valid OAuth Redirect URIs"**, add:
   ```
   http://localhost:3000/api/auth/callback/facebook
   ```
3. If you have a production URL, also add:
   ```
   https://yourdomain.com/api/auth/callback/facebook
   ```
4. Click **"Save Changes"**

## Step 4: Get Your App Credentials

1. In the left sidebar, go to **"Settings"** > **"Basic"**
2. You'll see:
   - **App ID** (This is your `FACEBOOK_CLIENT_ID`)
   - **App Secret** (Click "Show" - This is your `FACEBOOK_CLIENT_SECRET`)
3. Copy these values

## Step 5: Configure Environment Variables

Add to your `.env.local` file:

```bash
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

**Example:**
```bash
FACEBOOK_CLIENT_ID=123456789012345
FACEBOOK_CLIENT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## Step 6: Configure App Domain (Important!)

1. In **"Settings"** > **"Basic"**
2. Scroll down to **"App Domains"**
3. Add your domain (without protocol):
   ```
   localhost
   ```
4. For production, add:
   ```
   yourdomain.com
   ```
5. Click **"Save Changes"**

## Step 7: Make Your App Public (For Production)

By default, Facebook apps are in "Development Mode" and only accessible to app admins, developers, and testers.

### For Development/Testing:
1. Go to **"Roles"** in the left sidebar
2. Add testers/developers who need access
3. They must accept the invitation via their Facebook account

### For Production:
1. Complete all required setup in **"App Review"**
2. Add a Privacy Policy URL
3. Add Terms of Service URL (optional but recommended)
4. Request required permissions if needed
5. Switch app to **"Live Mode"** toggle at the top

## Step 8: Request Email Permission

1. Go to **"App Review"** > **"Permissions and Features"**
2. Find **"email"** permission
3. Click **"Request"** (for production use)
4. For development, email permission is automatically granted to app team members

## Step 9: Test Facebook Login

1. Restart your development server
2. Visit your app at `http://localhost:3000`
3. Click **"Get Started"**
4. Click the **Facebook** login button
5. Log in with a Facebook account that has access to the app

## Troubleshooting

### Error: "Invalid OAuth Redirect URI"
- Double-check the redirect URI in Facebook settings
- Must be exactly: `http://localhost:3000/api/auth/callback/facebook`
- No trailing slash
- Check for typos

### Error: "App Not Setup"
- Make sure Facebook Login product is added
- Save all settings changes

### Error: "This app is not available"
- App is in Development Mode
- Add your Facebook account as a developer/tester in Roles

### Can't Get Email from Facebook
- Request the `email` permission in App Review
- Some users may not have an email associated with their Facebook account
- Always have a fallback plan

### Error: "Access Denied"
- App might be restricted to certain users
- Check "App Restrictions" in Settings > Advanced

## Security Best Practices

1. **Never commit secrets to git**
   - Use `.env.local` (already in `.gitignore`)
   - Use environment variables in production

2. **Rotate secrets regularly**
   - Generate a new App Secret in Facebook Settings
   - Update your environment variables

3. **Use HTTPS in production**
   - Facebook requires HTTPS for production apps
   - Update your redirect URIs accordingly

4. **Limit app permissions**
   - Only request the permissions you actually need
   - Currently we only need: `public_profile` and `email`

## Production Deployment Checklist

- [ ] Add production domain to "App Domains"
- [ ] Add production OAuth redirect URI
- [ ] Complete App Review if needed
- [ ] Switch app to Live Mode
- [ ] Add Privacy Policy URL
- [ ] Test login flow in production
- [ ] Monitor for errors in Facebook App Dashboard

## Useful Links

- [Facebook Developers Console](https://developers.facebook.com/apps/)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [NextAuth.js Facebook Provider](https://next-auth.js.org/providers/facebook)
- [Facebook App Review Process](https://developers.facebook.com/docs/app-review)

## Support

If you encounter issues:
1. Check the [NextAuth.js Documentation](https://next-auth.js.org/)
2. Review [Facebook Login Common Issues](https://developers.facebook.com/docs/facebook-login/web#troubleshooting)
3. Check the browser console for error messages
4. Review Next.js server logs for detailed errors
