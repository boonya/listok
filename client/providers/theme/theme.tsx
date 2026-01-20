import {createTheme} from '@mui/material/styles';

export const theme_color = '#6820dd';
export const background_color = '#ffffff';

const theme = createTheme({
  palette: {
    primary: {
      main: theme_color,
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff7300',
      contrastText: '#fff',
    },
    background: {
      default: background_color,
    },
  },
  // components: {
  //   MuiCssBaseline: {
  //     styleOverrides: () => ({
  //       'html, body, #root': {
  //         height: '100%',
  //       },
  //     }),
  //   },
  // },
});

export type AppTheme = typeof theme;

if (typeof window !== 'undefined' && !('__APP_THEME' in window)) {
  Object.defineProperty(window, '__APP_THEME', {
    configurable: false,
    writable: false,
    value: theme,
  });
}

declare global {
  interface Window {
    __APP_THEME: AppTheme;
  }
}

export default theme;
