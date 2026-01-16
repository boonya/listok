import useSafeContext from '@boonya.dev/react-utils/hooks/useSafeContext';
import {Input, InputAdornment} from '@mui/material';
import type {CellContext} from '@tanstack/react-table';
import {useState} from 'react';
import {withCellBoundary} from '@/components/list-items/columns/cell-boundary';
import {type Item, TableContext} from '@/components/list-items/context';

type Props = CellContext<Item, Item['price']>;

export default withCellBoundary(function Price({row}: Props) {
  const {id, price, currency} = row.original;
  const {update} = useSafeContext(TableContext).options.meta ?? {};
  const [value, setValue] = useState(price ?? '');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue(value);
    const price = value === '' ? null : Number(Number(value).toFixed(2));
    void update?.(id, {price});
  };

  return (
    <Input
      type="number"
      onWheelCapture={(e) => {
        // @ts-expect-error It refers to not an input element for some reason
        e.target.blur?.();
      }}
      sx={{
        /* Chrome, Safari, Edge, Opera */
        'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
        /* Firefox */
        'input[type=number]': {
          MozAppearance: 'textfield',
        },
      }}
      inputProps={{
        min: 0,
        sx: {textAlign: 'end'},
      }}
      value={value}
      onChange={onChange}
      fullWidth
      endAdornment={<InputAdornment position="end">{currency}</InputAdornment>}
    />
  );
});
