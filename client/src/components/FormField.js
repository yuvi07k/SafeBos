import React from 'react';
import { useField } from 'formik';
import {
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Autocomplete,
} from '@mui/material';
import PropTypes from 'prop-types';

function FormField({ name, label, type = 'text', options = [], ...props }) {
  const [field, meta, helpers] = useField(name);
  const error = meta.touched && meta.error;

  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <Select
            {...field}
            error={!!error}
            label={label}
            onChange={(e) => helpers.setValue(e.target.value)}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        );
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={field.value}
                onChange={(e) => helpers.setValue(e.target.checked)}
              />
            }
            label={label}
          />
        );
      case 'radio':
        return (
          <FormControl component="fieldset">
            <RadioGroup
              {...field}
              onChange={(e) => helpers.setValue(e.target.value)}
            >
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case 'autocomplete':
        return (
          <Autocomplete
            options={options}
            getOptionLabel={(option) => option.label}
            value={field.value}
            onChange={(_, value) => helpers.setValue(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                {...field}
                error={!!error}
                label={label}
              />
            )}
          />
        );
      default:
        return (
          <TextField
            {...field}
            {...props}
            type={type}
            error={!!error}
            label={label}
            fullWidth
          />
        );
    }
  };

  return (
    <FormControl fullWidth error={!!error}>
      {type !== 'checkbox' && type !== 'radio' && <InputLabel>{label}</InputLabel>}
      {renderField()}
      {error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  );
}

FormField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

export default FormField; 