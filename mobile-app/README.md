# Rendr Bodycam Mobile App

Official mobile app for recording verified videos with embedded watermarks.

## Features

- 📹 **Video Recording** with live watermark preview
- ✅ **Automatic Verification** upon upload
- 🎨 **Showcase** your verified videos
- 🔐 **Secure Authentication** with your Rendr account
- ⛓️ **Blockchain Verification** integration

## Tech Stack

- React Native (Expo)
- Expo Camera for video recording
- AsyncStorage for local data
- Axios for API calls

## Getting Started

### Prerequisites

- Node.js installed
- Expo Go app on your iPhone (from App Store)

### Installation

1. Navigate to the mobile app directory:
```bash
cd /app/mobile-app
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Scan the QR code with your iPhone camera
5. The app will open in Expo Go

## App Screens

### 1. Login Screen
- Login with your Rendr credentials
- Uses same account as web platform

### 2. Home Screen
- View your stats (total videos, blockchain verified)
- Quick access to Record and Showcase
- Logout option

### 3. Record Screen
- Camera view with live watermark overlay
- Watermark shows: Checkstar logo + @username + "Rendr"
- Tap to start/stop recording
- Automatic upload and verification
- Get verification code instantly

### 4. Showcase Screen
- Grid view of all your verified videos
- Shows thumbnails and verification codes
- Pull to refresh
- Tap video to view verification code
- Blockchain badge for verified videos

## Watermark Details

The watermark appears on the left side of the video with:
- ⭐ Checkstar logo (top)
- @username (middle, rotated 90°)
- "Rendr" branding (bottom)

Position: Left side (default), Right side for premium users (coming soon)

## API Configuration

The app connects to:
- **Development**: `https://rendr-revamp.preview.emergentagent.com/api`
- **Production**: (to be configured in config.js)

## Testing

Use your existing Rendr account:
- **Username**: BrianJames
- **Password**: Brian123!

## Permissions Required

- Camera: For video recording
- Microphone: For audio recording
- Photo Library: For saving videos (optional)

## Troubleshooting

**Camera not working?**
- Make sure you granted camera permissions
- Check Settings > Expo Go > Camera

**Login fails?**
- Verify your credentials
- Check internet connection
- Ensure backend API is running

**Upload fails?**
- Check file size (videos might be large)
- Verify internet connection
- Try recording a shorter video

## Future Features

- Custom watermark positioning (premium)
- Custom branding logo
- Private video folders
- Video editing before upload
- Offline recording queue
- Share verification codes directly
