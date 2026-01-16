import AddIcon from '@mui/icons-material/Add';
import {Box, Button} from '@mui/material';
import {useLiveQuery} from 'dexie-react-hooks';
import ListCard from '@/components/lists/list-card';
import {getListsStorage} from '@/providers/storage/lists';
import {notifyError} from '@/utils/notify';

export default function ListOfListsScreen() {
  const {listing, create, remove} = getListsStorage();
  const lists = useLiveQuery(listing) ?? [];

  const createList = () => {
    create().catch((error) => {
      notifyError(['lists'], error, 'Не вдалося створити список.');
    });
  };

  const removeList = (id: number) => {
    remove([id]).catch((error) => {
      notifyError(['lists'], error, 'Не вдалося видалити список.');
    });
  };

  return (
    <Box
      sx={{
        p: 2,
        margin: '0 auto',
        maxWidth: 1200,
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        alignItems: 'flex-start',
        alignContent: 'center',
        gap: 2,
      }}
    >
      <Button onClick={createList} startIcon={<AddIcon />} variant="outlined">
        Новий список
      </Button>
      <Box sx={{display: 'inline-flex', gap: 2, flexWrap: 'wrap'}}>
        {/* <MasonryContainer> */}
        {lists.map(({id, title /**, items */}) => (
          <ListCard
            key={id}
            id={id}
            title={title}
            items={[] /** items */}
            onRemove={removeList}
          />
        ))}
      </Box>
      {/* </MasonryContainer> */}
    </Box>
  );
}
