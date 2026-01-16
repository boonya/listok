import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography, {type TypographyProps} from '@mui/material/Typography';
import {createLink} from '@tanstack/react-router';
import SignOutButton from './sign-out-button';
import SyncStatusIndicator from './sync-status';

const TypographyLink = createLink((props: TypographyProps) => (
  <Typography component="a" {...props} />
));

type Props = {
  title?: string;
};

export default function AppHeader({title}: Props) {
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{gap: 1}}>
        <Box sx={{flexGrow: 1}}>
          <TypographyLink variant="h6" color="inherit" to="/">
            {title || 'Home'}
          </TypographyLink>
        </Box>
        <SyncStatusIndicator />
        <SignOutButton />
      </Toolbar>
    </AppBar>
  );
}
