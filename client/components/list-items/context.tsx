import {
  getCoreRowModel,
  type RowData,
  type RowSelectionState,
  type Table,
  useReactTable,
} from '@tanstack/react-table';
import {createContext, type PropsWithChildren, useState} from 'react';
import {columns} from './columns';

export interface Item {
  id: string;
  title: string;
  price: number | null;
  currency: string;
  date: string | null;
  is_completed: boolean;
}

export type DataGridActions = Partial<{
  update: (id: string, values: Partial<Omit<Item, 'id'>>) => unknown;
  remove: (id: string) => unknown;
  create: (values: Partial<Omit<Item, 'id'>>) => unknown;
  reorder: (ids: string[]) => unknown;
}>;

export interface TableProviderProps extends DataGridActions {
  data: Item[];
}

declare module '@tanstack/react-table' {
  // biome-ignore lint/correctness/noUnusedVariables: <This is a module augmentation>
  interface TableMeta<TData extends RowData = Item> extends DataGridActions {}
}

export const TableContext = createContext<Table<Item>>(undefined!);

export function TableProvider({
  children,
  data,
  update,
  remove,
  create,
  reorder,
}: PropsWithChildren<TableProviderProps>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    state: {
      rowSelection, // pass the row selection state back to the table instance
    },
    onRowSelectionChange: setRowSelection, // hoist up the row selection state to your own scope
    meta: {
      update,
      remove,
      create,
      reorder,
    },
  });

  return (
    <TableContext.Provider value={table}>{children}</TableContext.Provider>
  );
}

TableProvider.displayName = 'Table.ContextProvider';

export function withTableProvider(Component: React.FunctionComponent) {
  return function WrappedComponent(props: TableProviderProps) {
    return (
      <TableProvider {...props}>
        <Component />
      </TableProvider>
    );
  };
}
