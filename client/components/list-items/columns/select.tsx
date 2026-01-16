import useSafeContext from '@boonya.dev/react-utils/hooks/useSafeContext';
import {Checkbox} from '@mui/material';
import type {CellContext} from '@tanstack/react-table';
import {withCellBoundary} from '@/components/list-items/columns/cell-boundary';
import {type Item, TableContext} from '@/components/list-items/context';

type Props = CellContext<Item, never>;

export default withCellBoundary(function Select({row}: Props) {
  const {update} = useSafeContext(TableContext).options.meta ?? {};

  const onChange = (
    _e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    void update?.(row.id, {is_completed: checked});
  };

  return (
    <Checkbox
      size="small"
      checked={row.original.is_completed}
      disabled={!row.getCanSelect()}
      indeterminate={row.getIsSomeSelected()}
      onChange={onChange}
    />
  );
});
