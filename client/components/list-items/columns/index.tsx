// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck // FIXME: I'll fix it in a bit

import {type ColumnDef, createColumnHelper} from '@tanstack/react-table';
import type {Item} from '@/components/list-items/context';
import ActionsCell from './actions';
import DateCell from './date';
import PriceCell from './price';
import ReorderCell from './reorder';
import SelectCell from './select';
import TitleCell from './title';

const columnHelper = createColumnHelper<Item>();

export const columns: ColumnDef<Item>[] = [
  columnHelper.display({
    id: 'reorder',
    cell: ReorderCell,
  }),
  columnHelper.display({
    id: 'select',
    cell: SelectCell,
  }),
  columnHelper.accessor('title', {
    header: 'Назва',
    cell: TitleCell,
  }),
  columnHelper.accessor('price', {
    header: 'Ціна',
    cell: PriceCell,
  }),
  columnHelper.accessor('date', {
    header: 'Дата виконання',
    cell: DateCell,
  }),
  columnHelper.display({
    id: 'actions',
    cell: ActionsCell,
  }),
];
