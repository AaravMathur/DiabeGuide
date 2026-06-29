# DiabeGuide - AI-Powered Diabetes Management Platform

A modern, full-featured diabetes management application with AI assistance, glucose tracking, and comprehensive health analytics.

## Features

- **Smart Glucose Tracking**: Monitor blood sugar levels with visual trends and analytics
- **AI Health Assistant**: Chat with an AI-powered diabetes advisor for personalized guidance
- **Health Dashboard**: Real-time overview of glucose levels, trends, and health metrics
- **Comprehensive Reports**: Detailed analytics with downloadable PDF reports
- **Emergency Assistance**: Quick access to emergency resources and first aid information
- **Profile Management**: Track personal health information and preferences
- **Mobile-Responsive**: Fully optimized for both desktop and mobile devices

## Technology Stack

- **React 18.3.1** - UI framework
- **React Router 7** - Client-side routing
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Recharts** - Data visualization
- **Radix UI** - Accessible UI components
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Vite** - Build tool

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (v8 or higher) - [Install pnpm](https://pnpm.io/installation)

To check if you have these installed:

```bash
node --version
pnpm --version
```

## Installation

1. **Navigate to the project directory**:
   ```bash
   cd /path/to/project
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

   This will install all required packages including React, React Router, Tailwind CSS, and UI components.

## Running the Application

### Development Mode

Start the development server:

```bash
pnpm run dev
```

The application will be available at the preview URL provided by the Figma Make environment.

**Note**: In the Figma Make environment, the dev server is already running. Simply make changes to the code and they will hot-reload automatically.

### Build for Production

To create a production build:

```bash
pnpm run build
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ui/              # Reusable UI components (buttons, cards, etc.)
│   │   ├── figma/           # Figma-specific components
│   │   └── MobileNav.tsx    # Mobile bottom navigation
│   ├── pages/
│   │   ├── LandingPage.tsx       # Home/landing page
│   │   ├── LoginPage.tsx         # User login
│   │   ├── SignupPage.tsx        # User registration with OTP
│   │   ├── DashboardLayout.tsx   # Dashboard shell with sidebar
│   │   ├── DashboardHome.tsx     # Main dashboard view
│   │   ├── TrackerPage.tsx       # Glucose tracking
│   │   ├── ChatbotPage.tsx       # AI assistant
│   │   ├── ProfilePage.tsx       # User profile
│   │   ├── EmergencyPage.tsx     # Emergency resources
│   │   ├── ReportsPage.tsx       # Health analytics
│   │   └── NotFoundPage.tsx      # 404 page
│   ├── routes.tsx           # Route configuration
│   └── App.tsx              # Root component
├── styles/
│   ├── theme.css            # Theme variables and colors
│   └── fonts.css            # Font imports
└── imports/                 # Figma imports and assets
```

## Available Routes

### Public Routes
- `/` - Landing page with features showcase
- `/login` - User login
- `/signup` - User registration with OTP verification

### Protected Routes (Dashboard)
- `/dashboard` - Main dashboard with glucose overview
- `/dashboard/tracker` - Glucose tracking and monitoring
- `/dashboard/chatbot` - AI health assistant
- `/dashboard/profile` - User profile management
- `/dashboard/reports` - Health analytics and reports
- `/dashboard/emergency` - Emergency assistance

## Mobile Design

The application is fully responsive with dedicated mobile features:

- **Bottom Navigation**: Easy thumb-reach navigation on mobile
- **Responsive Layouts**: Adapts to all screen sizes
- **Touch-Optimized**: Large touch targets for mobile interaction
- **Mobile-First Charts**: Optimized data visualizations

### Mobile Navigation
On screens smaller than 768px, the sidebar is hidden and replaced with a bottom navigation bar featuring:
- Home (Dashboard)
- Tracker
- Chatbot
- Profile

## Design System

### Color Palette

**Primary Colors**:
- Blue: `#2563EB`
- Cyan: `#06B6D4`
- Emerald: `#10B981`

**Background**:
- Light Gray: `#F8FAFC`
- White: `#FFFFFF`

**Status Colors**:
- Error/Emergency: `#EF4444`
- Warning: `#F59E0B`
- Success: `#22C55E`

### Typography

- **Headings**: Poppins (Bold)
- **Body**: Inter / Nunito Sans

### Component Library

The app uses a comprehensive UI component library including:
- Buttons, Cards, Badges
- Forms (Input, Select, Textarea)
- Data Display (Tables, Charts)
- Overlays (Dialogs, Tooltips, Popovers)
- Navigation (Tabs, Menus)

## Key Features Explained

### 1. Dashboard
- Real-time glucose level display
- Weekly trend charts
- AI-generated health suggestions
- Recent readings history

### 2. Tracker
- Manual glucose entry
- Time and meal status tracking
- Visual trend graphs
- Reading history with status indicators

### 3. AI Chatbot
- Intelligent responses to health questions
- Chat history management
- Quick question shortcuts
- Context-aware diabetes guidance

### 4. Reports
- Monthly glucose averages
- Reading distribution analytics
- Health score calculation
- Downloadable PDF reports

### 5. Emergency
- Quick access to emergency services
- Symptom recognition guide
- First aid instructions
- Emergency contact management

## Mock Data

The application currently uses mock data for demonstration purposes:

- **Authentication**: Any credentials will work for login/signup
- **Glucose Readings**: Pre-populated sample data
- **AI Responses**: Rule-based responses to common questions
- **Charts**: Sample data for visualization

## Future Enhancements

- Real backend integration with authentication
- Database connection for data persistence
- CGM (Continuous Glucose Monitor) device integration
- NFC scanning support
- Geolocation for nearby hospitals
- Voice assistant integration
- Export to healthcare providers
- Medication reminders
- Meal logging with nutrition info

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port Already in Use
If you get a port conflict error, the dev server may already be running. Check for existing processes.

### Dependencies Not Installing
Try clearing the pnpm cache:
```bash
pnpm store prune
pnpm install
```

### Build Errors
Make sure you're using the correct Node.js version:
```bash
node --version  # Should be v18 or higher
```

## Development Notes

- This is a Figma Make project with a special build configuration
- Do NOT run `vite build` directly - use `pnpm run build`
- The entrypoint is auto-generated at runtime
- Use the preview surface instead of localhost URLs

## License

This project is for demonstration purposes.

## Support

For issues or questions:
- Check the [Figma Make documentation](https://help.figma.com)
- Review the design blueprint in `src/imports/pasted_text/diabeguide-design-blueprint.md`

---

Built with ❤️ using Figma Make
