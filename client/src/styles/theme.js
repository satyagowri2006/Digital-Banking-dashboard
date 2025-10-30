// Example MUI theme config (You can expand this as you customize MUI)
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#00bfae' },
    warning: { main: '#ff9800' },
    error: { main: '#f44336' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: [
      'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'
    ].join(','),
  },
});

export default theme;
