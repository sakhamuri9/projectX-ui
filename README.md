# SoulNest - Mobile Dating App

SoulNest is a modern mobile dating app with a sleek black and white theme, featuring a comprehensive multi-step signup process and phone number authentication.

## Features

- Phone number login with OTP verification
- Multi-step signup form:
  - Step 1: Personal Information (Name, DOB, Gender, Location, ID)
  - Step 2: Match Preferences (Looking For, Age Range, Relationship Intent)
  - Step 3: Profile Setup (Profile Picture, Bio, Prompts)
- Conditional form fields based on relationship intent
- Form validation and progress saving
- Elegant black and white UI theme

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sakhamuri9/projectX-ui.git
cd projectX-ui
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Install additional dependencies that might be required:
```bash
npm install --legacy-peer-deps @react-native-async-storage/async-storage
npm install --legacy-peer-deps @react-native-community/slider
npm install --legacy-peer-deps @react-native-community/datetimepicker
npm install --legacy-peer-deps expo-image-picker
npm install --legacy-peer-deps react-native-toast-message
npm install --legacy-peer-deps @react-native-clipboard/clipboard
```

## Running the App

### Web
```bash
npx expo start --web
```

### iOS
```bash
npx expo start --ios
```

### Android
```bash
npx expo start --android
```

## Project Structure

```
projectX-ui/
├── App.js                  # Main application component
├── app.json                # Expo configuration
├── assets/                 # Images, fonts, and other static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   └── signup/         # Signup-specific components
│   ├── context/            # React Context providers
│   ├── screens/            # Application screens
│   │   └── signup/         # Multi-step signup screens
│   └── styles/             # Global styles and theme
└── package.json            # Project dependencies
```

## Dependencies

- React Native with Expo
- React Navigation
- React Native Phone Number Input
- React Native OTP Inputs
- AsyncStorage for local data persistence
- Expo Image Picker for camera and gallery access
- React Native Slider for age range selection
- DateTimePicker for date selection
- Toast Message for notifications

## Troubleshooting

If you encounter dependency issues, try using the `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

For issues with specific modules:

1. **react-native-async-hook error**:
   ```bash
   npm install --legacy-peer-deps react-async-hook
   ```

2. **@react-native-clipboard/clipboard error**:
   ```bash
   npm install --legacy-peer-deps @react-native-clipboard/clipboard
   ```

## License

This project is licensed under the MIT License.
