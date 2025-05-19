# Database Management Interface

A React application integrated with Supabase to create a database management interface for employees, attendances, projects, and tasks.

## Features

- CRUD operations for employees, attendances, projects, and tasks
- Master-detail forms
- Multi-tab interface
- Form validation with react-hook-form
- Responsive design with Tailwind CSS
- Dark/light theme support
- Reports with filtering and grouping

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Supabase for database
- react-hook-form for form validation

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

The application requires the following tables in your Supabase database:

- `employees`
- `attendances`
- `projects`
- `tasks`

The schema for these tables is included in the SQL files in the `database` directory. You can run these SQL scripts in the Supabase SQL editor to create the tables.

## Deployment

This application can be deployed on Vercel. Make sure to set the environment variables in your Vercel project settings.

## License

MIT
