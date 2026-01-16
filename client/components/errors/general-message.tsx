import {
  Box,
  type BoxProps,
  styled,
  Typography,
  type TypographyProps,
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

interface GeneralErrorProps extends BoxProps {
  slotProps?: {
    h1?: TypographyProps;
    h2?: TypographyProps;
  };
}

export default function GeneralError({slotProps, ...props}: GeneralErrorProps) {
  return (
    <Root role="alert" {...props}>
      <Typography variant="h1" color="inherit" {...slotProps?.h1}>
        {slotProps?.h1?.children ?? 'От халепа!'}
      </Typography>
      <Typography variant="h2" color="inherit" {...slotProps?.h2}>
        {slotProps?.h2?.children ?? 'Щось пішло не так.'}
      </Typography>
    </Root>
  );
}
