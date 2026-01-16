import ErrorIcon from '@mui/icons-material/Error';
import {IconButton, Tooltip} from '@mui/material';
import type {PropsWithChildren} from 'react';
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary';

function FallbackComponent({error, resetErrorBoundary}: FallbackProps) {
  const message =
    error instanceof Error && typeof error.message === 'string'
      ? error.message
      : 'Щось пішло не так.';

  return (
    <Tooltip title={message}>
      <IconButton color="error" onClick={resetErrorBoundary} size="small">
        <ErrorIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
}

export default function CellBoundary({children}: PropsWithChildren) {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      {children}
    </ErrorBoundary>
  );
}

export function withCellBoundary<P extends object>(
  Component: React.FunctionComponent<P>,
) {
  return function WrappedComponent(props: P) {
    return (
      <CellBoundary>
        <Component {...props} />
      </CellBoundary>
    );
  };
}
