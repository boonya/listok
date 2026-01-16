import {
  Box,
  type BoxProps,
  CircularProgress,
  type CircularProgressProps,
  styled,
} from '@mui/material';

const Root = styled(Box)(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  height: '100%',
  width: '100%',
  flexGrow: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  color: theme.palette.warning.main,
}));
export interface ProgressbarProps extends BoxProps {
  slotProps?: {
    progressbar?: CircularProgressProps;
  };
}

export default function Progressbar({slotProps, ...props}: ProgressbarProps) {
  return (
    <Root role="progressbar" {...props}>
      <CircularProgress aria-label="Loading..." {...slotProps?.progressbar} />
    </Root>
  );
}
