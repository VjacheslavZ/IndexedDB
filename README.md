# Material UI React App

This project is a React application with Material UI v7.2.0 setup, providing a modern and responsive user interface.

## Features

- **Material UI v7.2.0** - Latest version with modern components
- **TypeScript** - Full type safety
- **Responsive Design** - Works on all device sizes
- **Custom Theme** - Configurable color palette and typography
- **Accessibility** - Built with WCAG guidelines in mind

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)
- `npm run format` - Formats all code files using Prettier
- `npm run format:check` - Checks if all files are properly formatted

## Material UI Components Used

- **ThemeProvider** - Global theme configuration
- **CssBaseline** - CSS reset and base styles
- **AppBar** - Top navigation bar
- **Container** - Responsive layout container
- **Card** - Content containers
- **Button** - Interactive elements
- **Typography** - Text components
- **Paper** - Surface components
- **Box** - Layout utility component

## Theme Configuration

The app includes a custom theme with:

- Primary color: `#1976d2` (blue)
- Secondary color: `#dc004e` (pink)
- Typography: Roboto font family

## Project Structure

```
src/
├── App.tsx          # Main application component
├── index.tsx        # Application entry point
├── index.css        # Global styles
└── ...
```

## Code Formatting

This project uses Prettier for automatic code formatting. The configuration is defined in `.prettierrc`.

### Auto-formatting Setup

- **VS Code**: Install the Prettier extension and enable format on save
- **Manual formatting**: Run `npm run format` to format all files
- **Check formatting**: Run `npm run format:check` to verify formatting

### Prettier Configuration

The project uses the following Prettier settings:

- Single quotes for strings
- Semicolons at the end of statements
- 2 spaces for indentation
- 80 characters line width
- Trailing commas in objects and arrays

## Customization

To customize the theme, modify the `theme` object in `src/App.tsx`:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#your-primary-color',
    },
    secondary: {
      main: '#your-secondary-color',
    },
  },
  // Add more theme customizations
});
```

## Learn More

- [Material UI Documentation](https://mui.com/)
- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
