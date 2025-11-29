# Firebase Admin Setup Guide

## Problem
Your Firebase Admin SDK needs authentication credentials to perform server-side operations (create, update, delete). 

## Solution: Get Your Service Account Key

### Step 1: Download Service Account Key from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **studio-9903628032-db490**
3. Click the gear icon ⚙️ (Project Settings)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Click **Generate Key** - a JSON file will download

### Step 2: Place the Key File

Save the downloaded file as:
```
src/lib/serviceAccountKey.json
```

**IMPORTANT**: This file contains sensitive credentials. It's already added to `.gitignore` and will NOT be committed to git.

### Step 3: Restart Your Dev Server

```bash
npm run dev
```

You should see in the console:
```
✅ Firebase Admin: Using service account from file
✅ Firebase Admin initialized successfully
```

### Step 4: Test the Fix

Try creating, editing, or deleting a department. It should now work!

## Alternative: Use Environment Variable (Production)

Instead of a file, you can set an environment variable:

1. Create `.env.local`:
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
```

2. Paste the entire contents of your service account JSON as the value

The system will automatically use whichever method is available (file takes priority).

## Troubleshooting

If you still see errors:
- Check the file path is exactly: `src/lib/serviceAccountKey.json`
- Verify the JSON file is valid
- Check console for specific error messages
- Ensure you have permissions on the Firebase project
