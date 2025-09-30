# UN Duty Station Codes React Application

A modern React TypeScript application for managing UN duty station codes with enhanced search, mapping, and request management functionality.

## 🎯 Project Overview

This is a complete rebuild of the existing UN Duty Station Codes application using modern React, TypeScript, and Vite. The application provides an intuitive interface for searching duty stations and submitting requests for new, updated, or removed duty station codes to the UN CEB team.

**Live Demo**: [Original App](https://un-duty-stations.netlify.app/) | **New Enhanced Version**: *Coming Soon*

## ✅ Current Implementation Status

### Completed Phases

- ✅ **Phase 1**: Foundation & Styling Setup (100% Complete)
  - Visual parity with original app
  - Material-UI v7 theme with exact UN blue branding
  - Complete layout system (Header, Sidebar, BottomNavbar)
  - React Router DOM v7 navigation
  - Homepage with navigation cards
  - **Dark mode functionality with localStorage persistence**
  - **Theme-aware styling for all components**
  - **ThemeToggle component with accessibility features**

- ✅ **Phase 2**: Data Layer & Core Services (100% Complete)
  - **Complete CSV data service** - Full implementation with GitHub raw URLs
  - **Real data loading** - 4,295 duty stations + 222 countries from GitHub HR-Public-Codes repository
  - **DataContext provider** - App-wide state management with React Context
  - **Professional DutyStationsPage** - Complete table with filtering, sorting, pagination
  - **Advanced features** - Search, country filter, obsolete toggle, CSV export
  - **Loading & error states** - Professional UX with proper error handling
  - **Data validation system** - Comprehensive validation utilities
  - **Performance optimization** - Caching and efficient data handling

- ✅ **Phase 3**: Search & Filtering System (100% Complete)
  - **Advanced Search Service** - Multiple algorithms (exact, partial, fuzzy, soundex)
  - **Professional SearchPage** - Complete UI with real-time search and suggestions
  - **Search Components** - SearchFilters, SearchResults, SearchSuggestions
  - **Performance Optimization** - < 50ms response time with 300ms debouncing
  - **Mobile Responsive** - Floating action button and responsive design
  - **Fuse.js Integration** - Fuzzy search with typo tolerance
  - **Dark Mode Support** - Complete theme integration
  - **Table Styling** - Proper alternating row colors

### 🚧 Current Phase: Phase 4 - Duty Stations Management (Ready to Start)

- ⏳ Enhanced DutyStationsPage with advanced features
- ⏳ Export functionality (CSV, Excel)
- ⏳ Bulk operations and selection
- ⏳ Mobile-responsive table design
- ⏳ Virtual scrolling for large datasets

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

The application successfully fetches data directly from the UN CEB public repository:

- **Duty Stations**: https://raw.githubusercontent.com/CEB-HLCM/HR-Public-Codes/refs/heads/main/DSCITYCD.csv (✅ 4,295 stations loaded)
- **Countries**: https://raw.githubusercontent.com/CEB-HLCM/HR-Public-Codes/refs/heads/main/DSCTRYCD.csv (✅ 222 countries loaded)

**✅ Data Loading Successfully** - GitHub raw URLs work perfectly with simple `fetch(url)` calls. **Critical lesson learned**: Avoid custom headers which trigger CORS preflight requests. Data is loaded fresh on each session with proper caching for performance.

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

**Status**: 🚧 Phase 4 ready to start | ✅ Phases 1, 2, 3 complete  
**Last Updated**: September 30, 2025

## 🎯 Ready for Phase 4 Development

Phases 1, 2, and 3 are now **100% complete**. The next development session should focus on:

1. **Enhanced DutyStationsPage** with advanced table features
2. **Export functionality** (CSV, Excel formats)
3. **Bulk operations** and row selection
4. **Mobile-responsive** table design
5. **Virtual scrolling** for large datasets

Use the **Phase 4 prompt** from `NEXT_PHASE_PROMPT.md` to continue development with complete context and clear objectives.