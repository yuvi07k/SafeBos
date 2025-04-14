import React from 'react';
import {
  Box,
  Pagination,
  PaginationItem,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

function CustomPagination({
  count,
  page,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
  showRowsPerPage = true,
  ...props
}) {
  const handlePageChange = (event, value) => {
    onPageChange(value);
  };

  const handleRowsPerPageChange = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: 2,
      }}
      {...props}
    >
      {showRowsPerPage && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Rows per page:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Rows per page' }}
            >
              {rowsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {`${(page - 1) * rowsPerPage + 1}-${Math.min(
            page * rowsPerPage,
            count
          )} of ${count}`}
        </Typography>
        <Pagination
          count={Math.ceil(count / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="small"
          showFirstButton
          showLastButton
          renderItem={(item) => (
            <PaginationItem
              components={{
                first: FirstPageIcon,
                last: LastPageIcon,
                previous: NavigateBeforeIcon,
                next: NavigateNextIcon,
              }}
              {...item}
            />
          )}
        />
      </Box>
    </Box>
  );
}

CustomPagination.propTypes = {
  count: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  showRowsPerPage: PropTypes.bool,
};

export default CustomPagination; 