import DeleteIcon from '@mui/icons-material/Delete';
import {
  Card,
  CardActionArea,
  type CardActionAreaProps,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import {createLink} from '@tanstack/react-router';
import type React from 'react';

export type Props = {
  id: number;
  title: string;
  items: {
    id: string;
    title: string;
    price: number | null;
    currency: string;
  }[];
  onRemove: (id: number) => unknown;
};

const CardActionAreaLink = createLink((props: CardActionAreaProps) => (
  <CardActionArea {...props} />
));

export default function ListCard({id, title, items, onRemove}: Props) {
  const handleRemove = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onRemove(id);
  };

  return (
    <Card variant="outlined">
      <CardActionAreaLink to="/lists/$id" params={{id: id.toString()}}>
        <CardContent>
          {title && (
            <Typography variant="h6" component="h1">
              {title}
            </Typography>
          )}
          <IconButton
            aria-label="Видалити"
            title="Видалити"
            onClick={handleRemove}
            size="small"
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
          <List disablePadding>
            {items.map(({id, title, price, currency}) => (
              <ListItem key={id} disableGutters disablePadding>
                <ListItemText
                  primary={title}
                  // secondary={`${price ?? 0} ${currency}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </CardActionAreaLink>
    </Card>
  );
}
