# studentManagerFrontend - TutorFlow 🎓

A modern, soft-pastel themed web application frontend built with **React**, **TypeScript**, and **Vite** for students and home tutors to track learning tasks across a defined status lifecycle:
**`start`** ➔ **`ongoing`** ➔ **`update raised`** ➔ **`done`**.

---

## 🎨 Soft Pastel Design System
Crafted with clean aesthetics inspired by modern mobile ergonomics:
- **Canvas**: Soft Lavender Background (`#F4F5F9`) with pure white elevated card surfaces (`#FFFFFF`).
- **Pastel Status Lifecycle Accents**:
  - `start`: Soft Periwinkle Lilac (`#EEF0FD` / `#6F65F1`)
  - `ongoing`: Warm Apricot Amber (`#FEF4E3` / `#D97706`)
  - `update raised`: Soft Rose / Peach (`#FDEBF1` / `#E53B6E`)
  - `done`: Fresh Mint Sage (`#E5F6EE` / `#198754`)
- **Floating Dark Bottom Nav**: Touch-friendly floating bottom bar (`#1F2332`) with active periwinkle indicator and glowing pill animations.
- **Card Surfaces**: Delicate rounded cards (`border-radius: 24px`) with subtle hover elevation and ambient radial gradients.

---

## ✨ Key Features

### 1. Dual Role Dashboards
- **Student Dashboard (Mohona)**: Task tracking, deadline countdowns, subject badges, and priority filtering.
- **Tutor Hub (Axis)**: Lesson scheduling, overview metrics, and comprehensive student task monitoring.

### 2. Problem & Homework Attachment System
- **Drag-and-Drop Upload**: Fast image/screenshot submission with question categorization (`Stuck on step`, `Formula derivation`, `Homework check`, `Concept clarification`).
- **Windows Clipboard Paste (`Ctrl+V`)**: Instant screenshot pasting directly into attachments from Windows Snipping Tool.
- **Auto Status Trigger**: Automatically escalates tasks to `update raised` upon problem submission to notify the tutor.

### 3. Tutor Review & Triage Queue
- **High-Priority Triage Queue**: Dedicated queue highlighting tasks requiring immediate tutor guidance.
- **Instant Action Controls**: One-click actions to "Answer & Guide", "Verify & Complete", or "Re-open Task".
- **Problem Screenshot Lightbox**: Fullscreen modal for inspecting homework proofs and math derivations in high definition.
- **Dialogue & Commenting Thread**: Real-time back-and-forth communication on specific tasks.

### 4. User Authentication & Email Verification
- **Tabbed Auth Modal**: Soft pastel modal for Sign In and Account Registration.
- **Role Assignment**: Select between Student or Tutor roles upon registration.
- **Nodemailer 6-Digit Email OTP**: Automated verification code dispatch with resend timer and instant dev-preview helper.
- **1-Click Quick Demo Login**: Fast-fill demo credentials for instant testing.
- **Session Management**: Persistent user profiles in `localStorage` with reactive Navbar dropdown.

---

## 🛠️ Tech Stack & Architecture

- **Core**: React 18+ (Vite)
- **Language**: 100% TypeScript
- **Styling**: Vanilla CSS Design Tokens & CSS Custom Properties
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Client**: Native Fetch with typed domain DTOs and resilient fallback

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Muhiuddin2005/studentManagerFrontend.git
cd studentManagerFrontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 📄 License
MIT License. Built for seamless home tutor learning and task management.
