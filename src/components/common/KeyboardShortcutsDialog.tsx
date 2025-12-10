// Keyboard shortcuts help dialog
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardIcon from '@mui/icons-material/Keyboard';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: KeyboardShortcut[] = [
  {
    keys: ['Ctrl', 'K'],
    description: 'Focus search / Go to search page',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', 'H'],
    description: 'Go to home page',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', 'D'],
    description: 'Go to duty stations page',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', 'M'],
    description: 'Go to maps page',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', 'Shift', 'R'],
    description: 'Go to requests page',
    category: 'Navigation',
  },
  {
    keys: ['?'],
    description: 'Show keyboard shortcuts (this dialog)',
    category: 'Help',
  },
  {
    keys: ['Esc'],
    description: 'Close dialogs and modals',
    category: 'General',
  },
  {
    keys: ['Tab'],
    description: 'Navigate between interactive elements',
    category: 'Navigation',
  },
  {
    keys: ['Enter'],
    description: 'Activate buttons and links',
    category: 'General',
  },
];

/**
 * Keyboard Shortcuts Help Dialog
 * Shows available keyboard shortcuts to users
 */
export const KeyboardShortcutsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Listen for custom event to show dialog
    const handleShow = () => setOpen(true);
    window.addEventListener('show-keyboard-shortcuts', handleShow);
    return () => window.removeEventListener('show-keyboard-shortcuts', handleShow);
  }, []);

  const handleClose = () => setOpen(false);

  // Group shortcuts by category
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));
  
  // Detect if Mac for displaying appropriate key symbols
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const formatKey = (key: string): string => {
    if (!isMac) return key;
    
    // Mac-specific key symbols
    const macKeys: Record<string, string> = {
      'Ctrl': '⌘',
      'Shift': '⇧',
      'Alt': '⌥',
      'Enter': '↵',
      'Esc': '⎋',
      'Tab': '⇥',
    };
    
    return macKeys[key] || key;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="keyboard-shortcuts-title"
      aria-describedby="keyboard-shortcuts-description"
    >
      <DialogTitle
        id="keyboard-shortcuts-title"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyboardIcon />
          <Typography variant="h6" component="span">
            Keyboard Shortcuts
          </Typography>
        </Box>
        <IconButton
          aria-label="close keyboard shortcuts dialog"
          onClick={handleClose}
          edge="end"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers id="keyboard-shortcuts-description">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Use these keyboard shortcuts to navigate the application more efficiently.
          {isMac && ' Key symbols shown for Mac keyboard.'}
        </Typography>

        {categories.map((category) => (
          <Box key={category} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              {category}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="40%"><strong>Keys</strong></TableCell>
                    <TableCell><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shortcuts
                    .filter(s => s.category === category)
                    .map((shortcut, index) => (
                      <TableRow key={`${category}-${index}`} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {shortcut.keys.map((key, keyIndex) => (
                              <Chip
                                key={keyIndex}
                                label={formatKey(key)}
                                size="small"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  backgroundColor: 'grey.200',
                                  color: 'text.primary',
                                }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{shortcut.description}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, fontStyle: 'italic' }}>
          💡 Tip: Press <Chip label="?" size="small" sx={{ mx: 0.5, fontFamily: 'monospace' }} /> 
          anytime to see this dialog again.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

