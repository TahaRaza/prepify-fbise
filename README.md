# Prepify FBISE: Assessment Hub 🎓⚡

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Prepify** is a premium, AI-integrated assessment ecosystem tailored for the **Federal Board of Intermediate and Secondary Education (FBISE)** in Pakistan. Designed to bridge the gap between curriculum standards and digital accessibility, Prepify empowers educators with instant exam generation and provides students with a high-fidelity practice environment.

---

## 📸 The Experience

| **Premium Design System** | **Advanced Math Rendering** | **One-Click PDF Export** |
| :--- | :--- | :--- |
| Custom *Electric Amber* & *Sage Teal* palette with native Light/Dark mode support. | Flawless LaTeX and chemical formula parsing via `react-native-mathjax`. | Print-ready, formatted PDFs including headers and SLO-aligned instructions. |

---

## 🚀 Key Engineering Features

### 🔐 Multi-Tenant Architecture
*   **Role-Based Access Control (RBAC):** Distinct workflows for `Admin/Teachers` (Management) and `Students` (Practice).
*   **Secure Authentication:** Powered by Supabase Auth with Row Level Security (RLS) to ensure data sovereignty.
*   **Persistent Sessions:** Background session initialization for a frictionless "Open and Go" user experience.

### 🧪 Pedagogical Intelligence
*   **SLO-Driven Filtering:** Dynamically fetch questions based on specific book chapters or full-book Student Learning Outcomes (SLO).
*   **Dynamic Exam Engine:** Generates standard-compliant papers from a PostgreSQL-backed question bank in seconds.

### 🎨 Design & Performance
*   **Bespoke UI Engine:** Built without external UI libraries to ensure maximum performance and a unique brand identity.
*   **Cross-Platform Consistency:** Unified rendering of complex mathematical equations across Android and iOS.

---

## 🛠️ Technical Stack

*   **Frontend:** React Native with **Expo Router** (File-based navigation)
*   **Backend:** **Supabase** (PostgreSQL, Real-time triggers, Storage)
*   **Typesetting:** LaTeX via MathJax
*   **Infrastructure:** Expo Application Services (EAS) for cloud builds

---

## 📂 System Architecture

```bash
prepify-fbise/
├── app/                  # Expo Router file-based navigation
│   ├── _layout.jsx       # Global providers & session logic
│   └── screens/          # Modularized functional views
├── assets/               # Branding & Design assets
├── constants/            # Theme Engine (Amber/Teal system)
├── supabaseClient.js     # Infrastructure configuration
├── app.json              # Expo/EAS manifest
└── package.json          # Dependency management
```

---

## ⚙️ Installation & Setup

### 1. Global Requirements
```bash
npm install -g expo-cli eas-cli
```

### 2. Deployment
```bash
# Clone the repository
git clone https://github.com/TahaRaza/prepify-fbise.git
cd prepify-fbise

# Install dependencies
npm install

# Configure Environment
echo "EXPO_PUBLIC_SUPABASE_URL=your_url" >> .env
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key" >> .env

# Launch Development Server
npx expo start
```

### 3. Build for Android (APK)
This project is pre-configured for **EAS Preview** builds:
```bash
eas build -p android --profile preview
```

---

## 👨‍💻 Developed By

**Taha Hasnain Raza**  
*Computer Engineer | AI & MLOps Specialist*  
📍 Lahore, Pakistan

> **Note:** This project is part of a mission to modernize the Pakistani educational landscape through scalable, AI-driven infrastructure.

---

<p align="center">
  Built with ❤️ for the Pakistani Education Community.
</p>
