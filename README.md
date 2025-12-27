# Astro Academy

## Project Overview

Astro Academy is a comprehensive Learning Management System (LMS) built with modern web technologies. This platform provides an intuitive interface for both students and instructors to manage courses, track progress, and facilitate online education.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Available Scripts](#available-scripts)
- [API Services](#api-services)
- [Contributing](#contributing)
- [License](#license)

## Features

### Student Features
- **Course Catalog**: Browse and explore available courses with detailed information
- **Student Dashboard**: Personalized dashboard displaying enrolled courses and progress
- **Progress Tracking**: Monitor learning progress with visual indicators and analytics
- **Course Management**: Enroll in courses and access course materials

### Instructor Features
- **Instructor Dashboard**: Comprehensive overview of managed courses and student analytics
- **Course Upload**: Create and upload new course content
- **Analytics**: Track student engagement and performance metrics
- **Badge Management**: Award badges and achievements to students

### General Features
- **Authentication System**: Secure login and user management
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive UI**: Smooth animations and transitions using Framer Motion and GSAP
- **Modern Design**: Clean and professional interface built with Tailwind CSS

## Technology Stack

### Frontend
- **React** (v18.2.0) - Core UI library
- **React Router DOM** (v6.11.2) - Client-side routing
- **Vite** (v5.1.0) - Build tool and development server

### Styling & Animation
- **Tailwind CSS** (v3.4.7) - Utility-first CSS framework
- **Framer Motion** (v12.23.26) - Animation library
- **GSAP** (v3.14.2) - Advanced animation toolkit
- **Lucide React** (v0.562.0) - Icon library

### Build Tools
- **PostCSS** (v8.4.24) - CSS transformation
- **Autoprefixer** (v10.4.14) - CSS vendor prefixing

## Project Structure

```
astro/
├── public/                    # Static assets
│   ├── icons/                # Icon files
│   └── images/               # Image assets
├── src/
│   ├── assets/
│   │   └── styles/           # Global styles
│   │       └── index.css
│   ├── components/
│   │   ├── common/           # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── SkeletonLoader.jsx
│   │   ├── courses/          # Course-related components
│   │   │   └── CourseCard.jsx
│   │   ├── dashboard/        # Dashboard widgets
│   │   │   ├── AnalyticsCard.jsx
│   │   │   ├── BadgesWidget.jsx
│   │   │   ├── CourseManagementCard.jsx
│   │   │   ├── NextUpWidget.jsx
│   │   │   ├── ProgressCard.jsx
│   │   │   ├── ProgressWidget.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── UploadWidget.jsx
│   │   ├── effects/          # Animation effects
│   │   └── layout/           # Layout components
│   │       ├── Footer.jsx
│   │       ├── Layout.jsx
│   │       └── Navbar.jsx
│   ├── context/              # React Context providers
│   │   └── AuthContext.jsx
│   ├── data/                 # Mock data
│   │   ├── courses.json
│   │   ├── instructors.json
│   │   ├── stats.json
│   │   └── users.json
│   ├── hooks/                # Custom React hooks
│   │   └── useFetchData.js
│   ├── pages/                # Page components
│   │   ├── CourseCatalog.jsx
│   │   ├── CourseDetails.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Home.jsx
│   │   ├── InstructorDashboard.jsx
│   │   ├── Login.jsx
│   │   └── StudentDashboard.jsx
│   ├── services/             # API services
│   │   └── api.js
│   ├── utils/                # Utility functions
│   │   ├── helpers.js
│   │   └── stateManager.js
│   ├── App.jsx               # Main application component
│   └── main.jsx              # Application entry point
├── index.html                # HTML template
├── package.json              # Project dependencies
├── postcss.config.cjs        # PostCSS configuration
├── tailwind.config.cjs       # Tailwind CSS configuration
└── vite.config.js            # Vite configuration
```

## Installation

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher) or yarn

### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd astro
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## Usage

### Development Mode
Run the application in development mode with hot-reloading:
```bash
npm run dev
```

### Production Build
Create an optimized production build:
```bash
npm run build
```

### Preview Production Build
Preview the production build locally:
```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Starts the Vite development server
- `npm run build` - Creates a production build
- `npm run preview` - Previews the production build locally

## API Services

The application uses a service layer located in `src/services/api.js` for handling API calls. Currently, the application uses mock data from JSON files located in the `src/data/` directory.

### Data Sources
- **Courses**: `src/data/courses.json`
- **Instructors**: `src/data/instructors.json`
- **Statistics**: `src/data/stats.json`
- **Users**: `src/data/users.json`

## Component Architecture

### Common Components
Reusable UI components that maintain consistency across the application:
- **Button**: Customizable button component with various styles
- **Card**: Container component for content organization
- **ProgressBar**: Visual progress indicator
- **SkeletonLoader**: Loading state placeholder

### Dashboard Widgets
Modular dashboard components for displaying different types of information:
- **AnalyticsCard**: Displays analytics and metrics
- **BadgesWidget**: Shows earned badges and achievements
- **CourseManagementCard**: Course management interface
- **NextUpWidget**: Upcoming course activities
- **ProgressCard/ProgressWidget**: Learning progress visualization
- **StatCard**: Statistical information display
- **UploadWidget**: Content upload interface

## State Management

The application uses:
- **React Context API**: For global state management (Authentication)
- **Custom Hooks**: For data fetching and reusable logic
- **State Manager Utility**: Centralized state management helpers

## Styling Conventions

- Tailwind CSS utility classes for styling
- Responsive design using Tailwind's breakpoint system
- Custom styles in `src/assets/styles/index.css`
- Component-specific styles co-located with components

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

### Code Style Guidelines
- Follow React best practices and hooks guidelines
- Use functional components with hooks
- Maintain consistent file naming conventions
- Write descriptive commit messages
- Ensure all components are properly documented

## License

This project is private and proprietary. All rights reserved.

## Contact

For questions or support, please contact the development team.

---

**Version**: 0.1.0  
**Last Updated**: December 2025  
**Status**: In Development
