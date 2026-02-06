# Tesseric Frontend

Modern, elegant Next.js frontend for Tesseric architecture review service.

## Features

- **🎨 Theme Switcher**: Light/Dark mode with smooth transitions
- **📝 Dual Input Modes**: Text description or drag-and-drop screenshots (v1.1+)
- **🔥 Tone Toggle**: Switch between Professional and Roast mode feedback
- **📊 Beautiful Results Display**: Interactive risk cards with severity indicators
- **⚡ Real-time Analysis**: Smooth loading states and animations
- **🎯 Responsive Design**: Works perfectly on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4 with custom theme system
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)

## Setup

### Prerequisites

- Node.js 18+ and npm
- Backend running on port 8000 (see backend/README.md)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local if backend is not on localhost:8000
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running Locally

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

The app will be available at http://localhost:3000

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main page (review form + results)
│   └── globals.css         # Tailwind + theme CSS variables
├── components/
│   ├── ThemeProvider.tsx   # Theme context provider
│   ├── ThemeSwitcher.tsx   # Light/Dark mode toggle button
│   ├── ReviewForm.tsx      # Input form with drag-drop + text modes
│   └── ReviewResults.tsx   # Results display with risk cards + tone toggle
├── lib/
│   └── api.ts              # API client (submitReview, checkHealth)
├── package.json
├── tsconfig.json
├── tailwind.config.js      # Tailwind + theme configuration
└── README.md               # This file
```

## Components

### ReviewForm

Main input component with:
- **Input Mode Selector**: Toggle between text and image upload
- **Text Area**: For describing architecture (min 50 chars)
- **Drag & Drop Zone**: For screenshot uploads (v1.1+ feature)
- **Tone Selector**: Choose Professional or Roast mode
- **Submit Button**: With loading state

**Props**:
- `onSubmit: (request: ReviewRequest) => Promise<void>` - Callback for form submission
- `loading: boolean` - Whether submission is in progress

### ReviewResults

Results display component with:
- **Score Gauge**: Circular progress indicator (0-100)
- **Summary Card**: High-level review summary
- **Risk Cards**: Color-coded by severity with detailed information
- **Tone Toggle**: Switch between Professional/Roast modes
- **Show More**: Expands to show all risks (if >3)

**Props**:
- `review: ReviewResponse` - Review data from API
- `onToggleTone: () => void` - Callback for tone toggle
- `currentTone: "standard" | "roast"` - Current tone mode
- `loading: boolean` - Whether tone switch is in progress

### ThemeSwitcher

Fixed position button (top-right) that toggles between light/dark mode.

**Features**:
- Persists preference to localStorage
- Smooth transitions
- System theme detection

## Theme System

The app uses a custom CSS variable-based theme system:

**Light Mode Colors**:
- Background: White
- Primary: Blue (#3B82F6)
- Cards: White with subtle shadows
- Text: Dark gray

**Dark Mode Colors**:
- Background: Dark blue-gray (#0F172A)
- Primary: Lighter blue (#60A5FA)
- Cards: Dark with borders
- Text: Light gray

**Customization**:
Edit `app/globals.css` to change theme colors. All components use semantic color variables like `bg-background`, `text-foreground`, etc.

## API Integration

The frontend communicates with the backend via REST API:

**Endpoints Used**:
- `POST /review` - Submit architecture for analysis
- `GET /health` - Check backend health (optional)

**Request Example**:
```typescript
{
  design_text: "Multi-AZ deployment with EC2...",
  format: "text",
  tone: "standard"
}
```

**Response Example**:
```typescript
{
  review_id: "review-uuid",
  architecture_score: 75,
  risks: [
    {
      id: "SEC-001",
      title: "Data Not Encrypted",
      severity: "CRITICAL",
      pillar: "security",
      // ... more fields
    }
  ],
  summary: "Found 2 issues...",
  tone: "standard",
  created_at: "2026-01-21T12:00:00Z"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## User Flow

1. **Landing Page**: User sees hero section with Tesseric branding
2. **Input Selection**: Choose text description or image upload
3. **Text Entry**: Type/paste architecture description (min 50 chars)
4. **Tone Selection**: Choose Professional or Roast mode
5. **Submit**: Click "Get My Architecture Score"
6. **Loading**: See animated loading state
7. **Results**: View score, summary, and risk cards
8. **Tone Toggle**: Switch between Professional/Roast without re-submitting
9. **New Review**: Click "Review Another Architecture" to start over

## Styling Guidelines

### Colors

Use semantic Tailwind classes:
- `bg-background` instead of `bg-white`
- `text-foreground` instead of `text-black`
- `bg-card` for card backgrounds
- `text-muted-foreground` for secondary text

### Spacing

- Container: `max-w-6xl mx-auto px-4`
- Section gaps: `space-y-8` or `gap-8`
- Card padding: `p-6`

### Animations

- Fade in: `animate-fade-in` (custom keyframe)
- Transitions: `transition-all duration-200`
- Hover effects: `hover:shadow-lg`

## Development Tips

### Adding New Components

1. Create in `components/` folder
2. Use TypeScript for props
3. Export as named export (not default)
4. Use semantic color classes
5. Add hover/focus states
6. Test in both light/dark modes

### Testing Theme

Toggle theme with the sun/moon button (top-right). Check:
- All text is readable
- Cards have proper contrast
- Borders are visible
- Buttons work in both modes

### Performance

- Images: Use Next.js `<Image>` component (when adding images)
- Fonts: Already optimized with `next/font/google`
- Code splitting: Automatic with Next.js App Router
- CSS: Tailwind purges unused styles in production

## Future Enhancements (v1.1+)

- [ ] Image upload and OCR integration
- [ ] Review history page (`/reviews`)
- [ ] Architecture comparison view
- [ ] Export to PDF
- [ ] Share review link
- [ ] Dark mode improvements (more contrast options)
- [ ] Mobile-optimized drag-and-drop
- [ ] Keyboard shortcuts

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

### Backend Connection Error
Check:
1. Backend is running (`uvicorn app.main:app --reload` in backend/)
2. `NEXT_PUBLIC_API_URL` in `.env.local` is correct
3. CORS is configured in backend (already done)

### Theme Not Persisting
Clear localStorage and refresh:
```javascript
localStorage.removeItem('tesseric-theme')
```

### Styles Not Updating
1. Stop dev server
2. Delete `.next/` folder
3. Run `npm run dev` again

## Contributing

See main repo [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

[To be determined]
