import ReorderIcon from '@mui/icons-material/Reorder';
import IconButton from '@mui/material/IconButton';
import type {CellContext} from '@tanstack/react-table';
import type {DragControls} from 'framer-motion';
import type {PointerEvent} from 'react';
import {withCellBoundary} from '@/components/list-items/columns/cell-boundary';
import type {Item} from '@/components/list-items/context';

type Props = CellContext<Item, never> & {
  controls: DragControls;
};

export default withCellBoundary(function Reorder({controls}: Props) {
  const startDrag = (event: PointerEvent<HTMLElement>) => controls.start(event);

  return (
    <IconButton
      size="small"
      sx={{
        cursor: 'move',
      }}
      title="Змінити послідовність"
      aria-label="Змінити послідовність"
      onPointerDown={startDrag}
    >
      <ReorderIcon />
    </IconButton>
  );
});
