# Recipe AI - Frontend

A modern React + TypeScript + Vite frontend for the Recipe AI application, powered by Groq AI and YouTube API integration.

## Features

- 🤖 AI-powered recipe generation using Groq API
- 🎬 YouTube video integration for recipe tutorials
- 🔐 Secure authentication with JWT
- 📊 Analytics dashboard for recipe insights
- 💾 Save and manage favorite recipes
- 🎨 Beautiful UI with Tailwind CSS and Framer Motion animations
- ⚡ Lightning-fast Vite development server

## Tech Stack

- **Framework**: React 18.3.1
- **Language**: TypeScript 5.5.3
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React 0.344.0
- **Animations**: Framer Motion 12.23.24
- **Routing**: React Router DOM 7.9.6
- **Linting**: ESLint with TypeScript support

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/kundan1729/devops_recipe_project.git
cd client

# Install dependencies
npm install
```

### Environment Variables

The frontend uses relative `/api` requests, so it works with a reverse proxy or Kubernetes Ingress in production.

If you run the backend locally during development, Vite proxies `/api` to `http://localhost:5000`.

Create a `.env.production` file in the root directory for external service keys:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Build for Production

```bash
# Build the project
npm run build

# Preview the production build locally
npm run preview
```

### Linting & Type Checking

```bash
# Run ESLint
npm run lint

# Type check with TypeScript
npm run typecheck
```

## Project Structure

```
src/
├── api/                 # API integration (Groq, YouTube)
├── components/          # Reusable React components
│   ├── CreatorFooter.jsx
│   ├── ErrorMessage.jsx
│   ├── InputBox.jsx
│   ├── LoadingSpinner.jsx
│   ├── ProtectedRoute.jsx
│   ├── RecipeCard.jsx
│   └── VideoList.jsx
├── context/            # React Context for state management
│   └── AuthContext.jsx
├── lib/                # Utility libraries
│   ├── mongodbClient.js
│   └── supabaseClient.js
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── SavedRecipes.jsx
│   └── Analytics.jsx
├── App.tsx             # Main App component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Key Components

### Authentication
- Login and Signup pages with JWT token management
- Protected routes to ensure authenticated access
- AuthContext for global authentication state

### Recipe Generation
- AI-powered recipe generation using Groq API
- Input validation and error handling
- Real-time loading indicators

### Video Integration
- YouTube API integration for recipe videos
- Video list display with playback controls
- Search and filtering capabilities

### Dashboard & Analytics
- User dashboard with recipe statistics
- Analytics page with insights
- Save and manage favorite recipes

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set **Root Directory** to `client`
4. Add environment variables in Vercel project settings
5. Deploy

```bash
npm run deploy
```

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy

## API Integration

### Groq AI
- Used for recipe generation
- Requires `VITE_GROQ_API_KEY` environment variable
- Endpoint: `/api/recipes` (served by the backend through a reverse proxy)

### YouTube API
- Fetches recipe tutorial videos
- Requires `VITE_YOUTUBE_API_KEY` environment variable
- Integrated in video search functionality

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run deploy` - Deploy to GitHub Pages (if gh-pages configured)

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically use the next available port.

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Loading
- Ensure `.env.production` is in the root directory
- Restart the development server after updating env variables
- Variables must start with `VITE_` to be accessible

## Contributing

1. Create a new branch for your feature
2. Commit your changes
3. Push to the branch
4. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: kundan1729@gmail.com

## Related Repositories

- **Backend**: [devops_recipe_backend](https://github.com/kundan1729/devops_recipe_backend)
- **Full Project**: [devops_recipe_project](https://github.com/kundan1729/devops_recipe_project)

---

Built with ❤️ using React, TypeScript, and Vite
