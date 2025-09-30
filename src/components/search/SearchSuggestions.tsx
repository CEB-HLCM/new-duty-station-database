// Search suggestions component with autocomplete functionality
// Following CEB Donor Codes proven patterns

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Popper,
  ClickAwayListener,
  Fade,
  Divider,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Language as CountryIcon,
  Place as StationIcon,
} from '@mui/icons-material';
import type { UseSearchReturn } from '../../hooks/useSearch';

interface SearchSuggestionsProps {
  searchHook: UseSearchReturn;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onSuggestionSelect: (suggestion: string) => void;
  maxSuggestions?: number;
}

interface SuggestionItem {
  text: string;
  type: 'station' | 'country' | 'common';
  category: string;
}

function SearchSuggestions({
  searchHook,
  anchorEl,
  open,
  onClose,
  onSuggestionSelect,
  maxSuggestions = 10,
}: SearchSuggestionsProps) {
  const { suggestions, query, dutyStations, isReady } = searchHook;
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);

  // Categorize suggestions
  const categorizedSuggestions = React.useMemo(() => {
    if (!isReady || !suggestions.length || !dutyStations || dutyStations.length === 0) return [];

    const items: SuggestionItem[] = [];
    const lowerQuery = query.toLowerCase();

    // Add station name suggestions
    const stationSuggestions = suggestions.filter(suggestion => {
      return dutyStations.some(station => 
        station.NAME && station.NAME.toLowerCase().includes(lowerQuery) && 
        station.NAME === suggestion
      );
    });

    stationSuggestions.slice(0, Math.ceil(maxSuggestions * 0.4)).forEach(suggestion => {
      items.push({
        text: suggestion,
        type: 'station',
        category: 'Station Names',
      });
    });

    // Add common name suggestions
    const commonSuggestions = suggestions.filter(suggestion => {
      return dutyStations.some(station => 
        station.COMMONNAME && station.COMMONNAME.toLowerCase().includes(lowerQuery) && 
        station.COMMONNAME === suggestion
      );
    });

    commonSuggestions.slice(0, Math.ceil(maxSuggestions * 0.3)).forEach(suggestion => {
      items.push({
        text: suggestion,
        type: 'common',
        category: 'Common Names',
      });
    });

    // Add country suggestions
    const countrySuggestions = suggestions.filter(suggestion => {
      return dutyStations.some(station => 
        station.COUNTRY && station.COUNTRY.toLowerCase().includes(lowerQuery) && 
        station.COUNTRY === suggestion
      );
    });

    countrySuggestions.slice(0, Math.ceil(maxSuggestions * 0.3)).forEach(suggestion => {
      items.push({
        text: suggestion,
        type: 'country',
        category: 'Countries',
      });
    });

    return items.slice(0, maxSuggestions);
  }, [isReady, suggestions, query, dutyStations, maxSuggestions]);

  // Group suggestions by category
  const groupedSuggestions = React.useMemo(() => {
    const groups: Record<string, SuggestionItem[]> = {};
    
    categorizedSuggestions.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });

    return groups;
  }, [categorizedSuggestions]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < categorizedSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : categorizedSuggestions.length - 1
          );
          break;
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < categorizedSuggestions.length) {
            event.preventDefault();
            onSuggestionSelect(categorizedSuggestions[selectedIndex].text);
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, selectedIndex, categorizedSuggestions, onSuggestionSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [categorizedSuggestions]);

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect(suggestion);
    onClose();
  };

  const getIconForType = (type: SuggestionItem['type']) => {
    switch (type) {
      case 'station':
        return <StationIcon fontSize="small" />;
      case 'country':
        return <CountryIcon fontSize="small" />;
      case 'common':
        return <LocationIcon fontSize="small" />;
      default:
        return <SearchIcon fontSize="small" />;
    }
  };

  const getColorForType = (type: SuggestionItem['type']) => {
    switch (type) {
      case 'station':
        return 'primary';
      case 'country':
        return 'secondary';
      case 'common':
        return 'info';
      default:
        return 'default';
    }
  };

  if (!open || categorizedSuggestions.length === 0) {
    return null;
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      transition
      style={{ zIndex: 1300, width: anchorEl?.offsetWidth }}
      modifiers={[
        {
          name: 'flip',
          enabled: true,
          options: {
            altBoundary: true,
            rootBoundary: 'document',
            padding: 8,
          },
        },
        {
          name: 'preventOverflow',
          enabled: true,
          options: {
            altAxis: true,
            altBoundary: true,
            tether: true,
            rootBoundary: 'document',
            padding: 8,
          },
        },
      ]}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Paper
            elevation={8}
            sx={{
              maxHeight: 400,
              overflow: 'auto',
              mt: 0.5,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ClickAwayListener onClickAway={onClose}>
              <List ref={listRef} dense disablePadding>
                {Object.entries(groupedSuggestions).map(([category, items], categoryIndex) => (
                  <React.Fragment key={category}>
                    {categoryIndex > 0 && <Divider />}
                    
                    {/* Category Header */}
                    <ListItem disablePadding>
                      <Box sx={{ px: 2, py: 1, width: '100%' }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="medium"
                          textTransform="uppercase"
                        >
                          {category}
                        </Typography>
                      </Box>
                    </ListItem>

                    {/* Category Items */}
                    {items.map((item, itemIndex) => {
                      const globalIndex = categorizedSuggestions.findIndex(s => s.text === item.text);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <ListItem key={`${category}-${itemIndex}`} disablePadding>
                          <ListItemButton
                            selected={isSelected}
                            onClick={() => handleSuggestionClick(item.text)}
                            sx={{
                              pl: 3,
                              '&.Mui-selected': {
                                backgroundColor: 'action.selected',
                              },
                            }}
                          >
                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                              {getIconForType(item.type)}
                            </Box>
                            <ListItemText
                              primary={item.text}
                              primaryTypographyProps={{
                                variant: 'body2',
                                noWrap: true,
                              }}
                            />
                            <Chip
                              size="small"
                              label={item.type}
                              color={getColorForType(item.type)}
                              variant="outlined"
                              sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </React.Fragment>
                ))}
                
                {/* Footer with suggestion count */}
                {categorizedSuggestions.length > 0 && (
                  <>
                    <Divider />
                    <ListItem disablePadding>
                      <Box sx={{ px: 2, py: 1, width: '100%', textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {categorizedSuggestions.length} suggestion{categorizedSuggestions.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </ListItem>
                  </>
                )}
              </List>
            </ClickAwayListener>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
}

export default SearchSuggestions;
