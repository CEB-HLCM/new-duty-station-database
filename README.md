# UN Duty Station Codes React Application

A modern React TypeScript application for managing UN duty station codes with enhanced search, mapping, and request management functionality.

## 🎯 Project Overview

This is a complete rebuild of the existing UN Duty Station Codes application using modern React, TypeScript, and Vite. The application provides an intuitive interface for searching duty stations and submitting requests for new, updated, or removed duty station codes to the UN CEB team.

**Live Demo**: [Original App](https://un-duty-stations.netlify.app/) | **New Enhanced Version**: *Coming Soon*

## ✅ Current Implementation Status

### Completed Phases

- ✅ **Phase 1**: Foundation & Styling Setup
  - Visual parity with original app
  - Material-UI v7 theme with exact UN blue branding
  - Complete layout system (Header, Sidebar, BottomNavbar)
  - React Router DOM v7 navigation
  - Homepage with navigation cards

### 🚧 Current Phase: Phase 2 - Data Layer & Core Services (40% complete)

- ✅ Basic data service structure
- ✅ CSV parsing utilities
- ✅ TypeScript interfaces for duty stations and countries
- 🔄 Complete CSV fetching implementation
- 🔄 Data context provider for app-wide state
- ⏳ Loading states and error handling

## 🛠️ Technology Stack

- **Frontend**: React 19+ with TypeScript
- **Build Tool**: Vite (fast, modern build system)
- **UI Framework**: Material-UI (MUI) v7
- **Form Management**: React Hook Form with Zod validation (planned)
- **Search**: Fuse.js for fuzzy search + custom algorithms (planned)
- **Routing**: React Router DOM v7
- **Mapping**: Leaflet/React-Leaflet (planned)
- **Drag & Drop**: @dnd-kit for modern drag-and-drop functionality (planned)
- **Email Service**: EmailJS for submission workflow (planned)

## 🔍 Key Features (Planned)

### Enhanced Search Capabilities
- **Multiple Search Types**: Exact, partial, fuzzy, and Soundex "sounds like" matching
- **Professional UX**: Dual approach with browse and advanced search
- **Performance**: Sub-50ms search response with debouncing
- **Advanced Filtering**: By country, coordinates, and status

### Interactive Mapping System
- **Coordinate Picker**: Click-to-select coordinates on interactive map
- **Multiple Markers**: Display multiple duty stations with clustering
- **Geocoding Service**: Address to coordinates conversion
- **Multiple Tile Layers**: OpenStreetMap and satellite view options

### Complete Request Management
- **New Station Requests**: Full workflow with coordinate validation
- **Update Requests**: Modify existing station information
- **Remove Requests**: Proper removal workflow with justification
- **Form Persistence**: Manual save/load functionality for draft requests

### Enhanced Basket Management
- **Drag-and-Drop Reordering**: Modern @dnd-kit implementation for request prioritization
- **Advanced Validation Engine**: Comprehensive scoring system with detailed feedback
- **Multi-step Submission Flow**: Prepare → Validate → Submit workflow
- **Request History Tracking**: Submission history with restore capabilities

## 📊 Data Sources

The application fetches data directly from the UN CEB public repository:

- **Duty Stations**: https://raw.githubusercontent.com/CEB-HLCM/HR-Public-Codes/refs/heads/main/DSCITYCD.csv
- **Countries**: https://raw.githubusercontent.com/CEB-HLCM/HR-Public-Codes/refs/heads/main/DSCTRYCD.csv

**No CORS proxy required** - GitHub raw URLs work directly in all environments including local development and production deployments. Data is loaded fresh on each session to ensure up-to-date information.

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── basket/          # Request basket functionality (planned)
│   ├── form/            # Form-related components (planned)
│   ├── layout/          # Header, sidebar, layout components ✅
│   ├── mapping/         # Interactive mapping components (planned)
│   └── search/          # Search and filtering components (planned)
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── pages/               # Main page components ✅
├── schemas/             # Zod validation schemas (planned)
├── services/            # Business logic and API services 🔄
├── types/               # TypeScript type definitions ✅
├── utils/               # Utility functions and helpers
└── theme/               # Material-UI theme configuration ✅
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd new-duty-station-database
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration (Planned)

### EmailJS Integration
The application will use EmailJS for submitting requests to the UN CEB team. Configuration will use secure environment variables in `.env.local`:

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_PRIVATE_KEY=your_private_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
```

## 📋 Development Roadmap

### Upcoming Phases:
- **Phase 2**: Data Layer & Core Services (40% complete)
- **Phase 3**: Search & Filtering System
- **Phase 4**: Duty Stations Management
- **Phase 5**: Interactive Mapping System
- **Phase 6**: Request Management System
- **Phase 7**: Email Integration & Notifications
- **Phase 8**: Enhanced UI/UX & Accessibility
- **Phase 9**: Performance & Optimization
- **Phase 10**: Production Deployment & Documentation

See `DEVELOPMENT_ROADMAP.md` for detailed implementation plans and `DEVELOPMENT_STATUS.md` for current progress.

## 🎨 Design System

The application maintains visual consistency with the original UN Duty Station Codes app:

- **Primary Blue**: #008fd5 (UN branding color)
- **Table Headers**: #96C8DA
- **Material-UI Theme**: Custom theme matching original branding
- **Responsive Design**: Mobile-first approach with breakpoint optimization

## 🧪 Code Quality

- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code quality and consistency enforcement
- **Zero Console Errors**: Clean development environment
- **Material-UI Best Practices**: Proper theming and component usage
- **React Hook Form**: Controlled component patterns with validation (planned)

## 📝 Critical Development Notes

1. **TypeScript verbatimModuleSyntax**: Use `import type` for interfaces and `import` for values
2. **HTML Nesting Prevention**: Follow Material-UI component hierarchy guidelines
3. **Performance**: Debounced search, optimized rendering, efficient data structures (planned)
4. **Data Integrity**: Direct GitHub CSV fetching, fresh data loading, no persistent caching
5. **Form Stability**: Manual save/load system, no auto-save infinite loops (planned)
6. **Simplified Architecture**: No proxy configurations or complex CORS workarounds needed

## 🤝 Contributing

This project follows strict development standards:
- All components must be TypeScript-typed
- Zero tolerance for console errors/warnings
- Material-UI design system compliance
- Comprehensive error handling
- Professional UX patterns

### Development Workflow
1. Check `DEVELOPMENT_STATUS.md` for current progress
2. Follow phase-specific instructions in `NEXT_PHASE_PROMPT.md`
3. Update documentation after each development session
4. Record issues and solutions in `DEVELOPMENT_HISTORY.md`

## 📄 License

This project is developed for the UN CEB (United Nations System Chief Executives Board) for internal use in managing duty station codes across UN organizations.

## 🔗 Related Documentation

- `DEVELOPMENT_ROADMAP.md` - Complete development phases and tasks
- `DEVELOPMENT_STATUS.md` - Current implementation status and next steps
- `DEVELOPMENT_HISTORY.md` - Development session logs and issue tracking
- `NEXT_PHASE_PROMPT.md` - AI agent instructions for each development phase
- `PROJECT_SPECIFICATIONS.md` - Technical requirements and architecture

---

**Status**: 🚧 Phase 2 in development | ✅ Phase 1 complete  
**Last Updated**: September 25, 2025