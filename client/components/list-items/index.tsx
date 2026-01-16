import useSafeContext from '@boonya.dev/react-utils/hooks/useSafeContext';
import PlusIcon from '@mui/icons-material/Add';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List as MuiList,
  ListItem as MuiListItem,
} from '@mui/material';
import {Reorder} from 'framer-motion';
import type {HTMLAttributes} from 'react';
import {TableContext, withTableProvider} from './context';
import ListItem from './list-item';

type Props = HTMLAttributes<HTMLUListElement> & {};

export type {Item} from './context';

export default withTableProvider(function ListItems(props: Props) {
  const table = useSafeContext(TableContext);
  const {create, reorder} = table.options.meta ?? {};

  const handleCreate = async () => {
    await create?.({});
    // TODO: focus to just added
  };

  // TODO: Take a look later
  return (
    // @ts-expect-error Later
    <MuiList
      sx={{display: 'grid', gap: 1}}
      component={Reorder.Group}
      values={table.getRowModel().rows.map(({id}) => id)}
      onReorder={reorder}
      axis="y"
      {...props}
    >
      <MuiListItem disablePadding>
        <ListItemButton onClick={handleCreate}>
          <ListItemIcon>
            <PlusIcon />
          </ListItemIcon>
          <ListItemText primary="Елемент списку" />
        </ListItemButton>
      </MuiListItem>
      {table.getRowModel().rows.map((row) => (
        <ListItem key={row.id} row={row} />
      ))}
    </MuiList>
  );
});
