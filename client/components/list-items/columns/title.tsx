import useSafeContext from '@boonya.dev/react-utils/hooks/useSafeContext';
import {Input} from '@mui/material';
import type {CellContext} from '@tanstack/react-table';
import {useState} from 'react';
import {type Item, TableContext} from '@/components/list-items/context';
import {withCellBoundary} from './cell-boundary';

type Props = CellContext<Item, Item['title']>;

export default withCellBoundary(function Title({row}: Props) {
  const {id, title} = row.original;
  const {update} = useSafeContext(TableContext).options.meta ?? {};
  const [value, setValue] = useState(title);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue(title);
    void update?.(id, {title});
  };

  return <Input value={value} onChange={onChange} fullWidth />;
});
