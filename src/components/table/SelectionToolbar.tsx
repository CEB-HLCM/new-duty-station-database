import { Toolbar, Typography, Tooltip, IconButton, Box, ButtonGroup, Button } from '@mui/material';
import { Delete as DeleteIcon, FileDownload as ExportIcon, Close as ClearIcon } from '@mui/icons-material';
import type { DutyStation } from '../../types';

interface SelectionToolbarProps {
  selected: DutyStation[];
  onClearSelection: () => void;
  onExportCSV: (rows: DutyStation[]) => void;
  onExportExcel: (rows: DutyStation[]) => void;
  onBulkMarkObsolete?: (rows: DutyStation[]) => void; // placeholder for future bulk ops
}

function SelectionToolbar({ selected, onClearSelection, onExportCSV, onExportExcel, onBulkMarkObsolete }: SelectionToolbarProps) {
  const count = selected.length;

  if (count === 0) return null;

  return (
    <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, bgcolor: 'action.hover', borderTop: theme => `1px solid ${theme.palette.divider}` }}>
      <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
        {count} selected
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ButtonGroup size="small" variant="outlined">
          <Button startIcon={<ExportIcon />} onClick={() => onExportCSV(selected)}>CSV</Button>
          <Button onClick={() => onExportExcel(selected)}>Excel</Button>
        </ButtonGroup>

        {onBulkMarkObsolete && (
          <Tooltip title="Mark selected as obsolete">
            <span>
              <IconButton color="warning" onClick={() => onBulkMarkObsolete(selected)}>
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}

        <Tooltip title="Clear selection">
          <IconButton onClick={onClearSelection}>
            <ClearIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Toolbar>
  );
}

export default SelectionToolbar;



