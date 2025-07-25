# MTCC Balanced Scorecard Management System

A comprehensive strategic performance management platform designed for Maldives Transport and Contracting Company Plc (MTCC) implementing the Balanced Scorecard framework.

## Features

- **Strategic Objectives Management**: Manage objectives across four BSC perspectives (Financial, Customer, Internal Process, Learning & Growth)
- **KPI Management**: Define, track, and monitor key performance indicators
- **Initiative Management**: Track strategic initiatives and projects
- **Interactive Strategy Maps**: Visualize strategic relationships with traditional BSC matrix and mindmap views
- **Division Management**: Support for 18 MTCC divisions with cascading scorecards
- **Data Import/Export**: Bulk import capabilities via CSV files
- **Comprehensive Reporting**: Executive summaries, KPI reports, objectives analysis, and division performance
- **Export Capabilities**: Export reports in CSV and PDF formats for sharing and archival
- **Executive Dashboard**: Real-time performance visualization and reporting
- **Role-based Access Control**: Secure access based on user roles and divisions
- **Azure AD Integration**: Microsoft Azure authentication for office users
- **Responsive Design**: Mobile-friendly interface with MTCC branding

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Framework**: Ant Design
- **Icons**: Ant Design Icons
- **Charts**: Ant Design Charts & Recharts
- **Visualizations**: D3.js for interactive strategy maps
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Data Processing**: Papa Parse for CSV import/export

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mtcc-bsc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database:
   - Run the SQL script in `database/schema.sql` in your Supabase SQL editor
   - This will create all necessary tables, indexes, and initial data

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

### Database Setup

The application uses Supabase as the backend database. The database schema includes:

- **Users**: User management with role-based access
- **Divisions**: MTCC organizational divisions
- **Strategic Objectives**: BSC objectives across four perspectives
- **KPI Definitions**: Key performance indicator definitions
- **KPI Data**: Performance data and measurements
- **Strategic Initiatives**: Projects and initiatives
- **Notifications**: User notifications and alerts

### User Roles

The system supports the following user roles:

- **Admin**: Full system access and management
- **Executive**: Corporate and division-level access
- **Manager**: Division-specific management access
- **User**: Limited access to assigned areas

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Library configurations
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Netlify Deployment

The application is configured for deployment on Netlify. The `netlify.toml` file includes all necessary configuration.

#### Method 1: Netlify CLI (Recommended)

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy to Netlify**:
   ```bash
   netlify deploy --prod
   ```

#### Method 2: Git Integration

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

#### Environment Variables for Netlify

Add these environment variables in your Netlify site settings:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Testing the Deployed Application

1. **Strategy Map**: Navigate to `/strategy-map` to test both mindmap and BSC matrix views
2. **Reports**: Access `/reports` for comprehensive BSC reporting and analytics
3. **Data Management**: Use `/data-management` to test CSV import functionality
4. **User Management**: Access `/users` to manage user accounts and roles
5. **Dashboard**: View `/dashboard` for executive insights

### Default Admin Account

- Email: `salle.kma@gmail.com`
- Role: Admin
- Access: Full system access

## Features Implementation Status

### Phase 1: Foundation ✅
- [x] User authentication and authorization
- [x] Basic dashboard framework
- [x] Division and user management
- [x] Core navigation structure

### Phase 2: BSC Core ✅
- [x] Strategic objectives management
- [x] KPI definition and management
- [x] Strategic initiatives management
- [x] Interactive strategy maps (BSC matrix and mindmap views)
- [x] Data import/export via CSV files

### Phase 3: Advanced Features ✅
- [x] Advanced analytics and reporting system
- [x] Comprehensive BSC reporting (Executive, KPI, Objectives, Division)
- [x] Export functionality (CSV, PDF)
- [ ] Workflow and approval processes
- [ ] Integration capabilities
- [ ] Advanced dashboard features

### Phase 4: Polish & Deploy (Planned)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] User acceptance testing
- [ ] Production deployment

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is proprietary and confidential. All rights reserved by MTCC.

## Support

For technical support or questions, please contact the development team.