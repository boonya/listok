import useSafeContext from '@boonya.dev/react-utils/hooks/useSafeContext';
import {Input} from '@mui/material';
import type {CellContext} from '@tanstack/react-table';
import {format} from 'date-fns';
import {useState} from 'react';
import {withCellBoundary} from '@/components/list-items/columns/cell-boundary';
import {type Item, TableContext} from '@/components/list-items/context';

type Props = CellContext<Item, Item['date']>;

export default withCellBoundary(function DateCell({row}: Props) {
  const {id, date} = row.original;
  const {update} = useSafeContext(TableContext).options.meta ?? {};
  const [value, setValue] = useState(date ? format(date, 'yyyy-MM-dd') : '');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue(value);
    const date = value === '' ? null : new Date(value).toISOString();
    void update?.(id, {date});
  };

  return (
    <Input
      type="date"
      value={value}
      onChange={onChange}
      fullWidth
      sx={{
        // Hide the built-in date-format hint in WebKit browsers
        [`& input[type="date"]::-webkit-datetime-edit,
        & input[type="date"]::-webkit-datetime-edit-text,
        & input[type="date"]::-webkit-datetime-edit-fields-wrapper,
        & input[type="date"]::-webkit-calendar-picker-indicator`]: {
          opacity: value ? 1 : 0,
          // transition: 'opacity 0.1s',
        },
        [`&:hover input[type="date"]::-webkit-datetime-edit,
        &:hover input[type="date"]::-webkit-datetime-edit-text,
        &:hover input[type="date"]::-webkit-datetime-edit-fields-wrapper,
        &:hover input[type="date"]::-webkit-calendar-picker-indicator`]: {
          opacity: 1,
        },
      }}
    />
  );
});
