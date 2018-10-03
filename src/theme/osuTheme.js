import { createMuiTheme } from '@material-ui/core/styles';

const osuTheme = createMuiTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#d73f09',
      strat: '#006A8E',
      white: '#fff'
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: '#ffffff',
      light: '#f2f2f2',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#ffcc00'
    }
    // error: will use the default color
  },
  typography: {
    fontFamily: '"Open Sans"'
  },
  overrides: {
    // Permanently override card styles
    MuiCardHeader: {
      root: {
        backgroundColor: '#f2f2f2'
      },
      title: {
        color: '#252525',
        fontFamily: '""'
      },
      action: {
        color: '#d73f09'
      }
    }
  }
});

export default osuTheme;