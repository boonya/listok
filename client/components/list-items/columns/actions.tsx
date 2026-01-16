import useSafeContext from '@boonya.dev/react-utils/hooks/useSafeContext';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import type {CellContext} from '@tanstack/react-table';
import {withCellBoundary} from '@/components/list-items/columns/cell-boundary';
import {type Item, TableContext} from '@/components/list-items/context';

type Props = CellContext<Item, unknown>;

export default withCellBoundary(function Actions({row}: Props) {
  const {remove} = useSafeContext(TableContext).options.meta ?? {};

  return (
    <IconButton
      onClick={() => remove?.(row.original.id)}
      title="Видалити"
      aria-label="Видалити"
      size="small"
    >
      <ClearIcon fontSize="inherit" />
    </IconButton>
  );
});
