// Loading skeleton components for better UX
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from '@mui/material';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * Table Loading Skeleton
 * Used for duty stations table, search results, etc.
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 10, columns = 6 }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableCell key={`header-${index}`}>
                <Skeleton animation="wave" width="80%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={`row-${rowIndex}`}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                  <Skeleton animation="wave" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface CardSkeletonProps {
  count?: number;
}

/**
 * Card Loading Skeleton
 * Used for homepage cards, statistics cards, etc.
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 3 }) => {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`card-${index}`}>
          <Card>
            <Skeleton variant="rectangular" height={200} animation="wave" />
            <CardContent>
              <Skeleton animation="wave" height={32} width="80%" sx={{ mb: 1 }} />
              <Skeleton animation="wave" height={20} width="100%" />
              <Skeleton animation="wave" height={20} width="90%" />
              <Skeleton animation="wave" height={20} width="95%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Statistics Card Skeleton
 * Used for dashboard statistics
 */
export const StatsCardSkeleton: React.FC<CardSkeletonProps> = ({ count = 4 }) => {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`stat-${index}`}>
          <Card>
            <CardContent>
              <Skeleton animation="wave" height={24} width="60%" sx={{ mb: 1 }} />
              <Skeleton animation="wave" height={40} width="40%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Map Loading Skeleton
 * Used for interactive map
 */
export const MapSkeleton: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: 600,
        backgroundColor: 'grey.200',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        animation="wave"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Skeleton animation="wave" height={32} width={200} sx={{ mb: 1, mx: 'auto' }} />
        <Skeleton animation="wave" height={24} width={150} sx={{ mx: 'auto' }} />
      </Box>
    </Box>
  );
};

/**
 * Form Loading Skeleton
 * Used for duty station request form
 */
export const FormSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Skeleton animation="wave" height={32} width="40%" sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={`field-${index}`}>
              <Skeleton animation="wave" height={56} width="100%" sx={{ mb: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Skeleton animation="wave" height={42} width={120} />
          <Skeleton animation="wave" height={42} width={120} />
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * List Loading Skeleton
 * Used for request basket, history, etc.
 */
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <Box>
      {Array.from({ length: items }).map((_, index) => (
        <Card key={`list-item-${index}`} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={40} height={40} animation="wave" />
              <Box sx={{ flex: 1 }}>
                <Skeleton animation="wave" height={24} width="60%" sx={{ mb: 1 }} />
                <Skeleton animation="wave" height={20} width="90%" />
              </Box>
              <Skeleton variant="rectangular" width={80} height={32} animation="wave" />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

