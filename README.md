# 🧠 LeetCode Tracker

A modern web application for tracking your LeetCode journey with spaced repetition, personal notes, and email reminders to help you master algorithms systematically.

![LeetCode Tracker](https://img.shields.io/badge/LeetCode-Tracker-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.14.0-2D3748)

## ✨ Features

### 🎯 Core Functionality
- **Problem Tracking**: Log every LeetCode problem you solve with personal difficulty ratings and time spent
- **Personal Notes**: Add detailed notes and solution code to remember key patterns and insights
- **Spaced Repetition**: Intelligent review scheduling using the SM-2 algorithm to optimize retention
- **Progress Dashboard**: Comprehensive statistics and visual progress tracking

### 🔐 Authentication & User Management
- **Google OAuth**: Seamless login with Google authentication
- **Email/Password**: Traditional authentication option
- **User Profiles**: Customizable profiles with settings and preferences

### 📧 Smart Email System
- **Review Reminders**: Automated email notifications when problems are due for review
- **Weekly Summaries**: Progress reports showing your weekly achievements
- **Customizable Notifications**: Control when and how you receive email alerts

### 📊 Analytics & Insights
- **Personal Difficulty Tracking**: Rate problems based on your experience
- **Time Tracking**: Monitor how long you spend on each problem
- **Review Statistics**: Track your retention and review performance
- **Progress Visualization**: Charts and graphs showing your improvement over time

## 🚀 Tech Stack

### Frontend
- **Next.js 15.5.0** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Modern utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Serverless backend functions
- **NextAuth.js** - Complete authentication solution
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Robust relational database

### Email & Notifications
- **Resend** - Modern email delivery service
- **Cron Jobs** - Automated reminder scheduling

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **Prisma Studio** - Database management

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Resend account for email functionality
- Google OAuth credentials (optional)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd leetcode-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Service
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# Cron Job Security
CRON_SECRET="your-secure-cron-secret"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your application running!

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── cron/          # Scheduled job endpoints
│   │   │   ├── problems/      # Problem management
│   │   │   └── reviews/       # Review system
│   │   ├── dashboard/         # Dashboard page
│   │   ├── problems/          # Problem tracking page
│   │   ├── reviews/           # Review interface
│   │   └── schedule/          # Review scheduling
│   ├── components/            # Reusable UI components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── ui/               # Base UI components
│   │   └── forms/            # Form components
│   ├── lib/                  # Utility libraries
│   │   ├── auth/             # Authentication utilities
│   │   ├── email/            # Email service
│   │   └── utils.ts          # Helper functions
│   └── types/                # TypeScript type definitions
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
└── package.json             # Dependencies and scripts
```

## 🎮 Usage

### Adding Problems
1. Navigate to the "Problems" page
2. Search for a LeetCode problem or add it manually
3. Set your personal difficulty rating (1-5)
4. Add time spent and any notes
5. Save your solution code for future reference

### Review System
- Problems are automatically scheduled for review using spaced repetition
- Check the "Reviews" page for problems due today
- Rate how well you remembered each problem (1-5)
- The algorithm adjusts future review intervals based on your performance

### Dashboard Analytics
- View your solving streak and total problems solved
- See upcoming reviews and overdue problems
- Track your progress with visual charts
- Monitor time spent and difficulty distribution

### Email Notifications
- Receive daily reminders for problems due for review
- Get weekly summary reports of your progress
- Customize notification preferences in settings

## 🔧 Configuration

### Email Setup
1. Sign up for a [Resend](https://resend.com) account
2. Verify your sending domain
3. Add your API key to the environment variables
4. Configure the `EMAIL_FROM` address

### Authentication Setup
1. Create a Google OAuth application in the Google Console
2. Add your client ID and secret to the environment
3. Configure authorized redirect URIs

### Database Configuration
- Use PostgreSQL for production
- Configure connection pooling for better performance
- Set up regular backups

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in the Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
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

- [LeetCode](https://leetcode.com) for providing the platform that inspired this tracker
- [Spaced Repetition](https://en.wikipedia.org/wiki/Spaced_repetition) algorithm research
- The open-source community for the amazing tools and libraries

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information
3. Reach out to the maintainers

---

**Happy Coding! 🎉**

*Remember: Consistency beats intensity. Keep solving, keep reviewing, and master those algorithms!*
