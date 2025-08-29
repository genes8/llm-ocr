# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript frontend for an OCR receipt processing system. The application scans and parses receipts, travel expenses, and similar documents for company accounting purposes.

## Current Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── upload/
│   │   │   ├── FileUpload.tsx    # Drag-and-drop file upload component
│   │   │   ├── FileUpload.css    # Upload component styles
│   │   │   └── index.ts          # Component export
│   │   ├── preview/
│   │   │   ├── DocumentPreview.tsx # Document preview with processing
│   │   │   ├── DocumentPreview.css # Preview component styles
│   │   │   └── index.ts          # Component export
│   │   └── results/
│   │       ├── ResultsDisplay.tsx # OCR results display and editing
│   │       ├── ResultsDisplay.css # Results component styles
│   │       └── index.ts          # Component export
│   ├── services/                 # PLANNED: Backend API integration
│   │   ├── api.ts               # PLANNED: API client for Python backend
│   │   └── ocr.ts               # PLANNED: OCR processing utilities
│   ├── types/                   # PLANNED: TypeScript type definitions
│   │   └── index.ts             # PLANNED: Type definitions for API responses
│   ├── utils/                   # PLANNED: Utility functions
│   │   └── fileHandling.ts      # PLANNED: File processing utilities
│   ├── App.tsx                  # Main application component
│   ├── App.css                  # Application styles
│   ├── index.tsx                # React entry point
│   └── index.css                # Global styles
├── public/
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── tsconfig.node.json           # Node-specific TS config
└── vite.config.ts               # Vite build configuration
```

## Common Commands

Available development commands:
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run preview` - Preview production build

## Backend Integration

The Python backend provides OCR processing endpoints. Expected API endpoints:
- POST `/api/upload` - File upload and OCR processing
- GET `/api/results/{id}` - Retrieve OCR results
- POST `/api/export` - Export parsed data to database

## Key Features Implemented

✅ **File upload with drag-and-drop support** - React Dropzone integration
✅ **Document preview before processing** - Image/PDF preview with processing simulation
✅ **OCR results display and editing** - Editable expense items with real-time calculations
✅ **Expense categorization** - Category dropdown for each expense item

## Features to Implement Next

4. Database export functionality
5. Receipt validation
6. API integration with Python backend
7. Error handling and loading states
8. Responsive mobile design