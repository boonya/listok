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

export default theme;
