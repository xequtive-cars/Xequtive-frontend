# Xequtive Frontend

A Next.js-based frontend application for the Xequtive transportation booking platform.

## Features

- **Modern Booking Flow**: Streamlined, multi-step booking process
- **Interactive Maps**: Location selection with map integration
- **Vehicle Selection**: Dynamic vehicle options based on journey requirements
- **Fare Calculation**: Automated fare estimates
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Redux State Management**: Centralized state with persistence

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **UI Components**: Shadcn UI
- **Form Validation**: Custom validation hooks
- **Maps**: Google Maps integration
- **Authentication**: Firebase Auth
- **API Communication**: Fetch API with type-safe interfaces

## Project Structure

```
src/
├── app/                  # Next.js app router pages
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # User dashboard pages
│   └── api/              # API endpoints
├── components/           # React components
│   ├── booking/          # Booking-specific components
│   │   └── common/       # Shared types and utilities
│   ├── map/              # Map-related components
│   └── ui/               # UI components (buttons, forms, etc.)
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── store/                # Redux store
│   ├── slices/           # Redux slices
│   └── middleware/       # Redux middleware
├── styles/               # Global styles
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
    └── services/         # Service modules for API communication
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Maps API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/xequtive-frontend.git
   cd xequtive-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

   ```
   NEXT_PUBLIC_API_URL=your_api_url
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

Comprehensive documentation is available in the `src/docs` directory:

- **Redux Implementation**: Overview of the Redux state management
- **Booking Flow**: Details of the booking process
- **API Integration**: Information about API interactions
- **Component Examples**: Example usage of key components

## Development Guidelines

### Code Style

- Follow the ESLint and TypeScript configurations
- Use functional components with hooks
- Keep components focused on a single responsibility
- Utilize TypeScript types for all props and state

### State Management

- Use Redux for global state that needs to be shared across components
- Use React's useState and useContext for local component state
- Follow the Redux Toolkit patterns for creating slices and actions

### Adding New Features

1. Create necessary types in the appropriate types file
2. Implement Redux slice if state needs to be shared
3. Create reusable components in the components directory
4. Integrate with the appropriate page

## Deployment

The application can be deployed to Vercel or other Next.js-compatible hosting services:

```bash
npm run build
# or
yarn build
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
