# Google OAuth Setup Guide

This guide will help you set up Google Sign-In for your AIcelerate application.

## Prerequisites

- A Google account
- Your application running locally or deployed

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **"New Project"**
4. Enter project details:
   - **Project name**: AIcelerate (or your app name)
   - **Location**: Leave as default or choose your organization
5. Click **"Create"**
6. Wait for the project to be created, then select it from the dropdown

## Step 2: Enable Google+ API (if needed)

1. In the left sidebar, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"** (or just use OAuth without it)
3. Note: Modern apps typically don't need Google+ API, just OAuth2

## Step 3: Configure OAuth Consent Screen

1. In the left sidebar, go to **"APIs & Services"** > **"OAuth consent screen"**
2. Choose user type:
   - **Internal**: Only for Google Workspace users (if applicable)
   - **External**: For anyone with a Google account (recommended)
3. Click **"Create"**
4. Fill in the App information:
   - **App name**: AIcelerate
   - **User support email**: Your email
   - **App logo**: Optional
   - **Application home page**: `http://localhost:3000` (for dev)
   - **Application privacy policy link**: `http://localhost:3000/privacy`
   - **Application terms of service link**: `http://localhost:3000/terms`
   - **Authorized domains**: Add `localhost` for development
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. Scopes: Click **"Add or Remove Scopes"**
   - Select: `.../auth/userinfo.email`
   - Select: `.../auth/userinfo.profile`
   - Select: `openid`
7. Click **"Update"** then **"Save and Continue"**
8. Test users (for External + Testing mode):
   - Add your email address as a test user
   - Click **"Save and Continue"**
9. Review and click **"Back to Dashboard"**

## Step 4: Create OAuth 2.0 Credentials

1. In the left sidebar, go to **"APIs & Services"** > **"Credentials"**
2. Click **"+ Create Credentials"** > **"OAuth client ID"**
3. If prompted to configure the consent screen, follow Step 3 first
4. Choose application type: **"Web application"**
5. Enter name: **"AIcelerate Web Client"**
6. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   ```
7. Add **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
8. For production, also add:
   ```
   https://yourdomain.com
   https://yourdomain.com/api/auth/callback/google
   ```
9. Click **"Create"**
10. A dialog will show your credentials:
    - **Client ID** (This is your `GOOGLE_CLIENT_ID`)
    - **Client Secret** (This is your `GOOGLE_CLIENT_SECRET`)
11. Copy both values

## Step 5: Configure Environment Variables

### For Local Development (.env.local)

Create or update `.env.local`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
```

**Example:**
```bash
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWx
```

### For Docker Deployment

Update `docker-compose.yml`:

```yaml
app:
  environment:
    GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
    GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
```

Then create a `.env` file (not `.env.local`) in the same directory as `docker-compose.yml`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
```

## Step 6: Restart Your Application

### Local Development
```bash
npm run dev
```

### Docker
```bash
docker-compose down
docker-compose up -d
```

## Step 7: Test Google Login

1. Visit your app at `http://localhost:3000`
2. Click **"Get Started"** or **"Log In"**
3. Click the **Google** login button
4. You should be redirected to Google's sign-in page
5. Sign in with a Google account
6. Grant permissions when prompted
7. You should be redirected back to `/dashboard`

## Troubleshooting

### Error: "Access blocked: Authorization Error"
- **Error 401: invalid_client**
  - Your `GOOGLE_CLIENT_ID` is incorrect or missing
  - Double-check the credentials in Google Cloud Console
  - Make sure you copied the entire Client ID
  - Verify the environment variables are set correctly

### Error: "redirect_uri_mismatch"
- The redirect URI in your request doesn't match what's configured in Google Cloud
- Must be exactly: `http://localhost:3000/api/auth/callback/google`
- No trailing slash
- Check for typos
- Make sure you clicked "Save" in Google Cloud Console

### Error: "access_denied"
- User cancelled the sign-in flow
- User's Google account doesn't have access
- If app is in Testing mode, add the user's email as a test user

### Error: "invalid_request"
- Missing required parameters
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are both set
- Verify `NEXTAUTH_SECRET` is set (minimum 32 characters)
- Restart the application after setting environment variables

### Can't Sign In - App in Testing Mode
- In Google Cloud Console, your app is in "Testing" mode
- Only test users can sign in
- Add test users in: **"OAuth consent screen"** > **"Test users"** > **"+ Add Users"**
- Or publish the app (requires verification for sensitive scopes)

### Still Not Working?
1. Check the browser console for errors
2. Check Next.js server logs
3. Verify all environment variables are set:
   ```bash
   docker exec archcelerate-app env | grep GOOGLE
   ```
4. Make sure the OAuth consent screen is configured
5. Try using an incognito/private window to avoid cached auth state

## Publishing Your App (Production)

By default, Google apps are in "Testing" mode and limited to 100 test users.

### To publish your app:

1. Go to **"OAuth consent screen"**
2. Click **"Publish App"**
3. If you're only requesting basic scopes (email, profile, openid), publishing is instant
4. If requesting sensitive scopes, you'll need to go through verification:
   - Provide privacy policy URL
   - Provide terms of service URL
   - Submit for verification (can take several weeks)
   - Answer questions about how you use the requested scopes

### Required for Production:
- [ ] Valid privacy policy URL (publicly accessible via HTTPS)
- [ ] Valid terms of service URL (optional but recommended)
- [ ] App logo (recommended, 120x120px)
- [ ] Update authorized domains to your production domain
- [ ] Update redirect URIs to HTTPS production URLs
- [ ] Publish the app

## Security Best Practices

1. **Never commit secrets to git**
   - Use `.env.local` (already in `.gitignore`)
   - Use environment variables in production
   - Use secret management services (AWS Secrets Manager, etc.)

2. **Rotate credentials regularly**
   - Generate new OAuth client credentials every 90 days
   - Delete old credentials after rotation

3. **Use HTTPS in production**
   - Google requires HTTPS for production OAuth redirect URIs
   - Get an SSL certificate (Let's Encrypt is free)

4. **Restrict authorized domains**
   - Only add domains you control
   - Don't use wildcards

5. **Monitor OAuth usage**
   - Check Google Cloud Console for unusual activity
   - Set up alerts for high usage

6. **Limit scopes**
   - Only request scopes you actually need
   - Currently using: email, profile, openid

## Production Deployment Checklist

- [ ] Create production Google Cloud project (separate from dev)
- [ ] Configure OAuth consent screen with production URLs
- [ ] Add production domain to authorized domains
- [ ] Add HTTPS redirect URI for production
- [ ] Set production environment variables
- [ ] Test login flow in production
- [ ] Publish app (exit Testing mode)
- [ ] Monitor for errors in Google Cloud Console
- [ ] Set up logging and monitoring

## Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [OAuth Consent Screen Guidelines](https://support.google.com/cloud/answer/10311615)

## Support

If you encounter issues:
1. Check the [NextAuth.js Documentation](https://next-auth.js.org/)
2. Review [Google OAuth Common Issues](https://developers.google.com/identity/protocols/oauth2/web-server#errors)
3. Check the browser console for error messages
4. Review Next.js server logs for detailed errors
5. Check Google Cloud Console audit logs
