# AI Resume Builder

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

> Intelligent resume building platform powered by AI that generates professional resumes with ATS optimization and PDF export capabilities.

[Features](#features) • [Quick Start](#quick-start) • [Installation](#installation) • [Tech Stack](#tech-stack) • [Deployment](#deployment)

</div>

---

## Overview

**AI Resume Builder** is a cutting-edge web application that helps users create professional, ATS-optimized resumes with AI-powered enhancements. Built with modern technologies and designed with user experience in mind, it combines intuitive form handling, real-time preview, intelligent scoring, and seamless PDF export.

---

## Features

### Core Features
- **Interactive Resume Builder** - User-friendly form interface to input resume content
- **Real-time Preview** - See your resume as you build it
- **AI-Powered Enhancements** - Generate optimized content using Groq AI
- **ATS Score Analysis** - Get instant ATS compatibility scores (0-100)
- **Smart Improvement Tips** - AI-generated suggestions to boost ATS score
- **PDF Export** - Download professionally formatted PDF resumes
- **Template Selection** - Choose from multiple resume designs
- **Settings Panel** - Customize resume appearance and preferences

### Technical Features
- **Type-Safe Development** - Full TypeScript support
- **State Management** - Zustand for global state
- **Form Validation** - React Hook Form + Zod validation
- **Data Persistence** - Browser-based state management
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- **API Integration** - Groq API for AI features
- **Error Handling** - Graceful error management and recovery

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type-safe development |
| **Vite** | Lightning-fast build tool |
| **Tailwind CSS** | Utility-first styling |
| **React Router** | Client-side routing |
| **Zustand** | State management |
| **React Hook Form** | Form management |
| **Zod** | Schema validation |
| **React Query** | Server state management |
| **html2pdf.js** | PDF generation |
| **Groq API** | AI backend services |
| **Node.js** | Backend runtime |

---

## Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Git
- API key from Groq (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "AI resume builder"
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd resume-ai
   npm install
   
   # Install backend dependencies
   cd ../server
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # In server directory
   cd server
   echo "GROQ_API_KEY=your_api_key_here" > .env
   cd ..
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Frontend (from resume-ai directory)
   cd resume-ai
   npm run dev
   
   # Terminal 2: Backend (from server directory)
   cd server
   node src/index.js
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173` (frontend)
   - Backend API runs on `http://localhost:5000`

---

## Project Structure

```
AI resume builder/
├── resume-ai/                 # Frontend application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── BuilderPage.tsx
│   │   │   ├── PreviewPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── TemplatesPage.tsx
│   │   ├── pdf/              # PDF export functionality
│   │   ├── services/         # API & AI services
│   │   ├── state/            # Zustand store
│   │   └── ui/               # Reusable UI components
│   ├── public/               # Static assets
│   └── vite.config.ts
│
├── server/                    # Backend API
│   └── src/
│       ├── index.js          # Express server
│       └── groq.js           # Groq AI integration
│
├── package.json              # Root dependencies
└── README.md
```

---

## Key Pages

### Builder Page
Comprehensive form interface for inputting resume information:
- Personal details (name, email, phone, social links)
- Professional summary
- Education
- Skills (languages, tools, technologies)
- Work experience
- Projects
- Certifications & achievements
- Activities

### Preview Page
Real-time resume preview with:
- Professional resume layout
- ATS score calculation
- AI improvement suggestions
- One-click PDF download

### Settings Page
Customization options for resume appearance and functionality

### Templates Page
Browse and select different resume templates

---

## Usage

### Building a Resume

1. **Fill the Form** - Navigate to the Builder page and fill in your information
2. **Review Preview** - Check the Preview page to see formatted output
3. **Check ATS Score** - Get instant AI feedback on ATS compatibility
4. **Apply Suggestions** - Implement recommended improvements
5. **Export PDF** - Download your resume with one click

### AI Features

- **ATS Score Analysis** - Uses Groq API to analyze resume compatibility
- **Improvement Tips** - Receives AI-generated suggestions to improve scores
- **Content Generation** - AI-powered content recommendations (available through API)

---

## Scripts

```bash
# Frontend (from resume-ai directory)
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint

# Backend (from server directory)
node src/index.js  # Start backend server
```

---

## Environment Variables

### Backend (.env in server directory)
```
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
```

---

## API Endpoints

### POST /api/ats-score
Analyze resume ATS compatibility
```json
{
  "resumeText": "Your resume text here..."
}
```

### POST /api/generate-content
Generate AI-enhanced content
```json
{
  "prompt": "Your prompt here..."
}
```

---

## Deployment

### Render.io
The application is configured for Render deployment. See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed instructions.

**Key Steps:**
1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables in Render dashboard
4. Deploy both frontend and backend services

### Build Commands
- **Frontend:** `cd resume-ai && npm run build`
- **Backend:** `cd server && node src/index.js`

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Performance

- **Vite HMR** - Fast hot module replacement in development
- **Code Splitting** - Optimized bundle size
- **Lazy Loading** - Route-based code splitting
- **Tailwind CSS** - Minimal CSS output

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## Troubleshooting

### Port Already in Use
```bash
# Change Vite port
cd resume-ai && npm run dev -- --port 3000

# Change backend port
# Edit server/src/index.js to use different port
```

### API Connection Issues
- Verify backend is running on correct port
- Check GROQ_API_KEY is set correctly
- Review browser console for error messages

### PDF Export Not Working
- Ensure html2pdf.js is installed
- Check browser console for errors
- Verify resume content is not empty

---

## Future Roadmap

- [ ] Multiple resume templates
- [ ] Collaborative editing
- [ ] Resume history/versioning
- [ ] Job application tracking
- [ ] LinkedIn integration
- [ ] ATS database comparison
- [ ] Cover letter generation

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the manual.txt file for additional details

---
