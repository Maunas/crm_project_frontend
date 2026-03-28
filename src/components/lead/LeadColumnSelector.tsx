import * as React from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { Stack, ButtonGroup, Typography, Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

function not(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => !b.includes(value));
}

function intersection(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => b.includes(value));
}

interface LeadColumnSelectorProps<T> {
  itemsList: T[],
  selectedIds: number[],
  handleSelectedIds: (ids: number[]) => void,
  handleClose: () => void,
  showField: keyof T
}

export default function LeadColumnSelector<T extends { id: number }>
  ({ itemsList, selectedIds, handleSelectedIds, handleClose, showField }: LeadColumnSelectorProps<T>) {
  const [checked, setChecked] = React.useState<readonly number[]>([]);
  const [left, setLeft] = React.useState<number[]>(not(itemsList.map(f => f.id), selectedIds) ?? []);
  const [right, setRight] = React.useState<number[]>(selectedIds ?? []);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setRight(right.concat(left));
    setLeft([]);
  };

  const handleAllLeft = () => {
    setLeft(left.concat(right));
    setRight([]);
  };

  const handleCheckedToRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedToLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const theme = useTheme()

  //Permite identificar el objeto cuando paso de una lista a otra
  const globalDraggedIndex = React.useRef<number | null>(null)

  interface props {
    isLeftList: boolean, title?: string
  }

  const CustomList = ({ isLeftList = true, title }: props) => {
    const [dragIndex, setDragIndex] = React.useState<number | null>(null)
    const [dragOver, setDragOver] = React.useState<number | null>(null)

    const items = isLeftList ? [...left] : [...right]
    const setter = isLeftList ? setLeft : setRight

    const contraryItems = isLeftList ? [...right] : [...left]
    const contrarySetter = isLeftList ? setRight : setLeft

    const handleDragStart = (index: number) => {
      setDragIndex(index)
      globalDraggedIndex.current = index
    }
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
    }

    const handleDrop = (index: number, last: boolean = false) => {
      if (globalDraggedIndex.current == null) return
      let draggedItem
      //Si dragIndex es nulo, es transferencia entre listas
      if (dragIndex != null) {
        draggedItem = items[globalDraggedIndex.current]
        items.splice(dragIndex, 1)
      } else {
        draggedItem = contraryItems[globalDraggedIndex.current]
        contraryItems.splice(globalDraggedIndex.current, 1)
        contrarySetter(contraryItems)
      }
      if (last) {
        items.push(draggedItem)
      } else {
        items.splice(index, 0, draggedItem)
      }
      setter(items)
      setDragIndex(null)
      setDragOver(null)
      globalDraggedIndex.current = null
    }

    const handleDragEnter = (index: number) => {
      setDragOver(index)
    }

    return (
      <Paper >
        {title &&
          <Box p=".5rem" sx={{ backgroundColor: alpha(theme.palette.secondary.light, .8) }}>
            <Typography variant="body2" fontWeight={600}>{title}</Typography>
          </Box>}
        <Stack height="25rem">
          <List dense component="div" role="list"
            sx={{ overflow: 'auto', padding: 0, marginTop: ".5rem", }}
          >
            {items.map((value: number, idx) => {
              const labelId = `transfer-list-item-${value}-label`;
              const fieldData = itemsList.find(field => field.id === value)
              if (!fieldData) return
              return (
                <ListItemButton
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDrop={() => handleDrop(idx)}
                  key={value}
                  role="listitem"
                  onClick={handleToggle(value)}
                  className='column-list-item'
                  sx={{
                    cursor: dragIndex !== null ? "grabbing" : "grab",
                    backgroundColor: dragIndex === idx ? `${alpha(theme.palette.background.default, .5)}` : "",
                    border: dragIndex === idx ? `2px solid ${alpha(theme.palette.contrast.light, .5)}` : "",
                    borderTop: (dragOver === idx && dragIndex !== null && dragOver < dragIndex) ? `4px solid ${alpha(theme.palette.secondary.main, .6)}` : "",
                    borderBottom: (dragOver === idx && dragIndex !== null && dragOver > dragIndex) ? `4px solid ${alpha(theme.palette.secondary.main, .6)}` : "",
                  }}
                >
                  <ListItemIcon sx={{ pointerEvents: "none" }}>
                    <Checkbox
                      checked={checked.includes(value)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={`${fieldData?.[showField]}`} sx={{ pointerEvents: "none" }} />
                </ListItemButton>
              );
            })}
          </List>
          <Box flexGrow={1}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(0, true)}
          />
        </Stack>
      </Paper>
    )
  };

  return (
    <Stack alignItems="start" spacing="1rem">
      <Typography variant="h2" >Seleccionar Columnas</Typography>
      <Grid
        width="100%"
        container
        spacing={2}
        sx={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <Grid size="grow" minWidth="13rem">
          <CustomList isLeftList={true} title={"Columnas Disponibles"} />
        </Grid>
        <Grid>
          <Grid container direction="column" sx={{ alignItems: 'center' }}>
            <Button
              sx={{ my: 0.5 }}
              variant="contained"
              size="small"
              onClick={handleAllRight}
              disabled={left.length === 0}
              aria-label="move all right"
            >
              ≫
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="contained"
              size="small"
              onClick={handleCheckedToRight}
              disabled={leftChecked.length === 0}
              aria-label="move selected right"
            >
              &gt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="contained"
              size="small"
              onClick={handleCheckedToLeft}
              disabled={rightChecked.length === 0}
              aria-label="move selected left"
            >
              &lt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="contained"
              size="small"
              onClick={handleAllLeft}
              disabled={right.length === 0}
              aria-label="move all left"
            >
              ≪
            </Button>
          </Grid>
        </Grid>
        <Grid size="grow" minWidth="13rem">
          <CustomList isLeftList={false} title={"Columnas a Mostrar"} />
        </Grid>
      </Grid>
      <Stack width="100%" alignItems="end">
        <ButtonGroup >
          <Button variant="outlined" onClick={() => handleClose()}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => handleSelectedIds(right)} disabled={right.length === 0}>
            Guardar Cambios
          </Button>
        </ButtonGroup>
      </Stack>
    </Stack>
  );
}