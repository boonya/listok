import {ListItem as MuiListItem} from '@mui/material';
import type {Row} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';
import {Reorder, useDragControls} from 'framer-motion';
import {Fragment} from 'react';
import type {Item} from './context';

export type Props = {
  row: Row<Item>;
};

export default function ListItem({row}: Props) {
  const controls = useDragControls();

  return (
    <MuiListItem
      disablePadding
      sx={{
        display: 'grid',
        gridTemplateColumns: '40px 40px 1fr 150px 120px 30px',
        gap: 1,
      }}
      component={Reorder.Item}
      value={row.id}
      dragListener={false}
      dragControls={controls}
    >
      {row.getVisibleCells().map((cell) => (
        <Fragment key={cell.id}>
          {flexRender(cell.column.columnDef.cell, {
            ...cell.getContext(),
            controls,
          })}
        </Fragment>
      ))}
    </MuiListItem>
  );
}
