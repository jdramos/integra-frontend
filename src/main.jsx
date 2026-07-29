import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { ColorModeProvider } from './theme/ColorModeContext.jsx';
import { SocketProvider } from './realtime/SocketContext.jsx';
import { MessagingProvider } from './realtime/MessagingContext.jsx';

const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: { main: mode === 'dark' ? '#60A5FA' : '#0A66C2' },
    secondary: { main: mode === 'dark' ? '#34D399' : '#057642' },
    background: mode === 'dark'
      ? { default: '#0B1120', paper: '#111827' }
      : { default: '#F3F2EF', paper: '#FFFFFF' },
    text: mode === 'dark'
      ? { primary: '#F8FAFC', secondary: '#CBD5E1' }
      : { primary: '#1f1f1f', secondary: '#666666' }
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h3: { fontWeight: 900 },
    h4: { fontWeight: 900 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 700 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          border: `1px solid ${theme.palette.divider}`
        })
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ theme }) => ({
          position: 'sticky',
          top: 76,
          zIndex: theme.zIndex.snackbar,
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.18)',
          border: '1px solid rgba(15, 23, 42, 0.10)',
          animation: 'alertAppear 180ms ease-out',
          '@keyframes alertAppear': {
            from: { opacity: 0, transform: 'translateY(-8px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          },
          [theme.breakpoints.down('sm')]: {
            top: 68
          },
          '.MuiSnackbar-root &': {
            position: 'static'
          },
          '.MuiDialog-root &': {
            position: 'static',
            zIndex: 'auto'
          }
        })
      }
    }
  }
});

function Root() {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('integra-rh-color-mode');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const colorMode = useMemo(() => ({
    mode,
    toggleColorMode: () => setMode((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('integra-rh-color-mode', next);
      return next;
    })
  }), [mode]);

  return (
    <ColorModeProvider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <AuthProvider>
            <SocketProvider>
              <MessagingProvider>
                <App />
              </MessagingProvider>
            </SocketProvider>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </ColorModeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
