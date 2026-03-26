# Prepify FBISE: Assessment Hub 🎓⚡

Prepify is a premium, AI-powered React Native application designed specifically for the Federal Board of Intermediate and Secondary Education (FBISE) curriculum in Pakistan. It empowers teachers to seamlessly generate standard-compliant exam papers and allows students to practice live question banks.

## 🌟 Key Features

- **Role-Based Architecture:** Secure routing for both `Admin/Teacher` and `Student` roles using Supabase Authentication.
- **Premium Dynamic UI:** A custom-built design system featuring _Electric Amber_, _Sage Teal_, and _Text Charcoal_ that automatically adapts to system **Light and Dark modes**.
- **Advanced Math Rendering:** Integrated `react-native-mathjax` to flawlessly parse and render complex LaTeX equations and chemical formulas across both Light and Dark themes.
- **One-Click PDF Export:** Teachers can instantly generate beautifully formatted, print-ready PDF exam papers (complete with instructions, headers, and perfectly rendered math) using `expo-print`.
- **Persistent Sessions:** Seamless login experience that securely remembers users using background session initialization.
- **Smart Chapter Filtering:** Dynamically fetch and filter questions based on specific book chapters or full-book SLO (Student Learning Outcomes) mode.

## 🛠️ Tech Stack

- **Frontend:** React Native, Expo (Expo Router for file-based navigation)
- **Backend & Auth:** Supabase (PostgreSQL, Row Level Security, Triggers)
- **Styling:** Custom dynamic theming engine (No external UI libraries)
- **Utilities:** `react-native-mathjax`, `expo-print`, `expo-sharing`

## 📂 Project Structure

```
prepify-fbise/
├── app/
│ ├── \_layout.jsx # Global routing and session checks
│ ├── index.js # Splash Screen & Auth routing
│ └── screens/
│ ├── login.js # Authentication
│ ├── signup.js # Account creation
│ ├── home.js # Admin Dashboard
│ ├── studentDashboard.js # Student Dashboard
│ ├── subjects.js # Subject selection with Premium locks
│ ├── configuration.js # Exam setup and chapter selection
│ ├── results.js # Exam generation and PDF export
│ └── profile.js # User settings and logout
├── assets/
│ └── images/ # App icons, splash screens, and branding
├── constants/
│ └── theme.js # Core Light/Dark mode design system
├── supabaseClient.js # Supabase connection initialization
├── app.json # Expo configuration and EAS build settings
└── package.json
```

## 🚀 Installation & Setup

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed, along with the Expo CLI and EAS CLI:

```
npm install -g expo-cli eas-cli
```

### 2. Clone the Repository

```
git clone https://github.com/TahaRaza/prepify-fbise.git
cd prepify-fbise
```

### 3. Install Dependencies

```
npm install
```

### 4. Environment Variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the App Locally

Start the Expo development server:

```
npx expo start -c
```

_Scan the QR code with the Expo Go app on your physical device, or press `a` to open in an Android Emulator._

## 📦 Building the APK (Android)

This project is fully configured for Expo Application Services (EAS). To generate a standalone `.apk` file that can be installed on any Android device:

1. Log in to your Expo account:
   ```
   eas login
   ```
2. Trigger the cloud build:
   ```
   eas build -p android --profile preview
   ```
3. Once the build finishes, download the APK from the provided Expo dashboard link!

## 👤 Author

**Taha Hasnain Raza** | Computer Engineering Graduate | AI & MLOps Enthusiast

- Lahore, Pakistan
