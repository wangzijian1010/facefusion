# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Install dependencies**: `npm install`

## Project Architecture

This is a React-based AI face swap studio application built with Vite and TypeScript.

### Core Architecture
- **State Management**: Uses React state with a centralized app state enum (`AppState`) that controls navigation between three main views: LANDING, WORKSPACE, and RESULTS
- **Main Application Flow**: App.tsx manages global state and renders different components based on current AppState
- **Component Structure**: Organized in `/components` directory with dedicated UI components and icon components in `/components/icons`

### Key Components
- **App.tsx**: Main application container managing state transitions and routing
- **LandingPage**: Initial welcome screen
- **Workspace**: Core face swap interface where users upload images and perform face detection/swapping
- **ResultsPage**: Displays comparison between original and processed images
- **ImageUploader**: Handles file uploads with drag-and-drop functionality

### Face Detection & Processing
- **services/geminiService.ts**: Core service for face detection and face swapping using Google's Gemini API
- **Face Detection Flow**: Images are processed to detect faces, return bounding boxes, and generate thumbnails for selection
- **Face Swapping**: Selected faces from two images are swapped using the Gemini API

### Environment Configuration
- **API Key Setup**: Requires `GEMINI_API_KEY` in `.env.local` for Google Gemini API access
- **Vite Configuration**: Custom config loads environment variables and exposes them as `process.env.GEMINI_API_KEY`

### Type System
- **types.ts**: Defines core interfaces including `AppState` enum, `BoundingBox`, and `DetectedFace`
- **Path Aliases**: Uses `@/*` alias pointing to project root for cleaner imports

### Styling
- Uses Tailwind CSS classes throughout components
- Dark theme with slate/cyan color palette
- Responsive design with flexbox layouts

## Deployment

### Environment Variables
- **FACEFUSION_API_URL**: URL of your FaceFusion API server (required for production)
- Copy `.env.example` to `.env.local` and configure your API URL

### Vercel Deployment
1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Configure environment variables:
   - Add `FACEFUSION_API_URL` with your API server URL
4. Deploy

### Security
- API URL is configured via environment variables to prevent exposure
- Never commit actual API URLs to version control
- Use `.env.local` for local development