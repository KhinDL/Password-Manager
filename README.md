# VaultGuard - Password Manager

A modern, secure password manager built with React, TypeScript, and Firebase. VaultGuard helps you store, organize, and manage your passwords with enterprise-grade security and a beautiful user interface.

## 🚀 Live Demo

Visit the live application: [https://lighthearted-meerkat-534bee.netlify.app](https://lighthearted-meerkat-534bee.netlify.app)

**Demo Credentials:**
- Master Password: `password`

## ✨ Features

### 🔐 Security
- **Master Password Protection** - Single password to access all your data
- **Firebase Authentication** - Secure user authentication
- **Cloud Storage** - Your passwords are safely stored in Firebase Firestore
- **Password Strength Analysis** - Real-time password strength indicators

### 📱 User Experience
- **Modern UI/UX** - Beautiful, responsive design with dark theme
- **Password Generator** - Generate strong, secure passwords instantly
- **Smart Search** - Find passwords quickly with intelligent search
- **Category Organization** - Organize passwords by categories (Social Media, Work, Banking, etc.)
- **Favorites System** - Mark frequently used passwords as favorites
- **Copy to Clipboard** - One-click copying of usernames and passwords

### 📊 Dashboard Features
- **Password Statistics** - Overview of total, weak, and strong passwords
- **Export Functionality** - Export your passwords as JSON
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Real-time Sync** - Changes sync instantly across devices

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend:** Firebase (Firestore, Authentication)
- **Build Tool:** Vite
- **Deployment:** Netlify

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard interface
│   ├── LoginForm.tsx    # Authentication form
│   ├── PasswordCard.tsx # Individual password display
│   ├── PasswordModal.tsx # Add/edit password modal
│   └── PasswordStrengthIndicator.tsx # Password strength component
├── hooks/               # Custom React hooks
│   └── usePasswordManager.ts # Main password management logic
├── services/            # API and service layers
│   ├── authService.ts   # Authentication service
│   └── passwordService.ts # Password CRUD operations
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared interfaces
├── config/              # Configuration files
│   └── firebase.ts      # Firebase configuration
└── App.tsx              # Main application component
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project (for production use)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd password-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup (Optional for Demo)**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication
   - Copy your Firebase config to `src/config/firebase.ts`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Features Overview

### Password Categories
- **Social Media** - Facebook, Twitter, Instagram, etc.
- **Work** - Professional accounts and tools
- **Banking** - Financial institutions and services
- **Entertainment** - Streaming services, gaming platforms
- **Shopping** - E-commerce and retail accounts
- **Other** - Miscellaneous accounts

### Password Strength Indicators
- **Weak** - Passwords under 8 characters or missing complexity
- **Medium** - Passwords with basic requirements met
- **Strong** - Passwords with 12+ characters and full complexity

### Security Features
- Row Level Security (RLS) in Firestore
- User-specific data isolation
- Secure password storage
- Authentication state management

## 🔒 Security Considerations

### For Production Use:
1. **Enable Firebase Authentication** with proper providers
2. **Configure Firestore Security Rules** appropriately
3. **Use HTTPS** for all communications
4. **Implement proper backup strategies**
5. **Regular security audits**

### Current Demo Setup:
- Uses a fixed demo password for easy testing
- Firebase rules allow public access for demonstration
- Not recommended for storing real passwords

## 🌐 Deployment

The application is automatically deployed to Netlify on every push to the main branch.

### Manual Deployment:
```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Lucide React](https://lucide.dev/) - Icon library
- [Vite](https://vitejs.dev/) - Build tool

## 📞 Support

If you have any questions or need help, please open an issue in the repository.

---

**⚠️ Important Security Notice:** This is a demonstration application. For production use with real passwords, ensure proper security measures are implemented including secure authentication, encrypted storage, and regular security audits.