import * as React from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import type { LeadField } from '../../types/leadFields';
import { Stack, ButtonGroup, Typography, Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

function not(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => !b.includes(value));
}

function intersection(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => b.includes(value));
}

interface LeadColumnSelectorProps {
  leadFields: LeadField[],
  selectedIds: number[],
  handleSelectedIds: (ids: number[]) => void,
  handleClose: () => void
}

export default function LeadColumnSelector({ leadFields, selectedIds, handleSelectedIds, handleClose }: LeadColumnSelectorProps) {
  const [checked, setChecked] = React.useState<readonly number[]>([]);
  const [left, setLeft] = React.useState<number[]>(not(leadFields.map(f => f.id), selectedIds) ?? []);
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

  interface props {
    items: readonly number[], setter: React.Dispatch<React.SetStateAction<number[]>>, title?: string
  }

  const CustomList = ({ items, setter, title }: props) => {
    const [dragIndex, setDragIndex] = React.useState<number | null>(null)
    const [dragOver, setDragOver] = React.useState<number | null>(null)

    const handleDragStart = (index: number) => {
      setDragIndex(index)
    }
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
    }
    const handleDrop = (e, index: number) => {
      e.stopPropagation()
      if (dragIndex === null) return
      const newItems = [...items]
      const draggedItem = newItems[dragIndex]
      newItems.splice(dragIndex, 1)
      newItems.splice(index, 0, draggedItem)
      setter(newItems)
      setDragIndex(null)
      setDragOver(null)
    }

    const handleDropLast = () => {
      if (dragIndex === null) return
      const newItems = [...items]
      const draggedItem = newItems[dragIndex]
      newItems.splice(dragIndex, 1)
      newItems.push(draggedItem)
      setter(newItems)
      setDragIndex(null)
      setDragOver(null)
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
              const fieldData = leadFields.find(field => field.id === value)
              return (
                <ListItemButton
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  key={value}
                  role="listitem"
                  onClick={handleToggle(value)}
                  className='column-list-item'
                  sx={{
                    outline: dragIndex === idx ? `2px solid ${alpha(theme.palette.contrast.light, .5)}` : "",
                    borderTop: (dragOver === idx && dragIndex !== null && dragOver < dragIndex) ? `4px solid ${alpha(theme.palette.primary.main, .6)}` : "",
                    borderBottom: (dragOver === idx && dragIndex !== null && dragOver > dragIndex) ? `4px solid ${alpha(theme.palette.primary.main, .6)}` : "",
                  }}
                >
                  <ListItemIcon sx={{ pointerEvents: "none" }}>
                    <Checkbox
                      checked={checked.includes(value)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={fieldData?.name} sx={{ pointerEvents: "none" }} />
                </ListItemButton>
              );
            })}
          </List>
          <Box flexGrow={1}
            onDragOver={handleDragOver}
            onDrop={() => handleDropLast()}
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
          <CustomList items={left} setter={setLeft} title={"Columnas Disponibles"} />
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
          <CustomList items={right} setter={setRight} title={"Columnas a Mostrar"} />
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