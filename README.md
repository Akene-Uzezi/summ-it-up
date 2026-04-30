# Summ-It-Up

A modern web application built with Next.js 16 that provides intelligent text summarization services. Users can paste text or URLs to generate concise summaries powered by a backend summarization API.

## Features

- **Text Summarization**: Paste any text to generate a concise summary
- **URL Processing**: Submit URLs to summarize web content
- **Real-time Feedback**: Animated loading states with skeleton placeholders
- **Modern UI**: Built with shadcn/ui components, Tailwind CSS, and Radix UI
- **Responsive Design**: Mobile-first layout that works on all devices
- **Dark Theme**: Beautiful dark mode with carefully crafted color palette

## Tech Stack

### Frontend
- **Next.js 16** – React framework with App Router
- **React 19** – UI library with Server Components
- **TypeScript** – Type-safe development
- **Tailwind CSS 4** – Utility-first CSS framework
- **shadcn/ui** – Reusable component library
- **Radix UI** – Accessible component primitives
- **lucide-react** – Beautiful icons
- **framer-motion** – Smooth animations

### Utilities
- **class-variance-authority** – Type-safe class variance
- **clsx** – Conditional class joining
- **tailwind-merge** – Tailwind class merging
- **tw-animate-css** – Tailwind CSS animations

## Architecture

The application follows a client-side architecture with API integration:

- **App Router** (Next.js) – File-system based routing
- **Client Components** – Interactive UI with React state
- **Custom UI Components** – Reusable, styled components
- **Backend Integration** – REST API calls to summarization service

See [architecture.md](architecture.md) for detailed architecture documentation.

## Project Structure

```
summ-it-up/
├── app/
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout with metadata
│   └── globals.css        # Global styles and theme
├── components/
│   └── ui/                # Reusable UI components
│       ├── button.tsx     # Button component with variants
│       ├── card.tsx       # Card component with sections
│       ├── textarea.tsx   # Auto-resizing textarea
│       └── skeleton.tsx   # Loading skeleton component
├── lib/
│   └── utils.ts          # Utility functions (cn helper)
├── .kilo/                 # Kilo CLI configuration and modules
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build the application for production:

```bash
npm run build
```

### Production

Start the production server:

```bash
npm run start
```

## Configuration

The application expects a backend API endpoint configured via environment variable. Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### Environment Variables

- `NEXT_PUBLIC_backendUrl` – URL of the summarization backend API (default: `http://localhost:3001/api/v1`)

The API should expose a `POST /summarize` endpoint that accepts JSON:

```json
{
  "input": "text or URL to summarize"
}
```

And returns:

```json
{
  "summary": "generated summary text"
}
```

## Component Library

### Button
- Variants: default, outline, secondary, ghost, destructive, link
- Sizes: xs, sm, default, lg, icon, icon-xs, icon-sm, icon-lg
- Built with class-variance-authority for type-safe variants

### Card
- Composable sections: Header, Title, Description, Content, Footer, Action
- Size variants: default, sm
- Consistent styling with Tailwind CSS

### Textarea
- Auto-resizing based on content
- Configurable min/max rows
- Accessible and keyboard-friendly

### Skeleton
- Animated loading placeholder
- Reusable for any content type

## Styling

The project uses a custom dark theme with carefully selected color tokens defined in `globals.css`:

- **Background**: Deep slate (`oklch(0.205 0 0)`)
- **Foreground**: Off-white (`oklch(0.985 0 0)`)
- **Card**: Slightly lighter slate for depth
- **Primary**: Slate with inverted foreground for contrast
- **Accent**: Muted slate for interactive elements

All colors use the OKLCH color space for perceptual uniformity.

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for type safety
3. Keep components small and focused
4. Use existing UI components when possible
5. Maintain accessibility standards

## License

MIT
