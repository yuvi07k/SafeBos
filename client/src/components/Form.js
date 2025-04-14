import React from 'react';
import { Formik, Form as FormikForm } from 'formik';
import { Box, Button, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

function Form({
  initialValues,
  validationSchema,
  onSubmit,
  children,
  submitButtonText = 'Submit',
  submitButtonProps = {},
  ...props
}) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ isSubmitting, handleSubmit }) => (
        <FormikForm {...props}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {children}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              onClick={handleSubmit}
              sx={{ mt: 2 }}
              {...submitButtonProps}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                submitButtonText
              )}
            </Button>
          </Box>
        </FormikForm>
      )}
    </Formik>
  );
}

Form.propTypes = {
  initialValues: PropTypes.object.isRequired,
  validationSchema: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  submitButtonText: PropTypes.string,
  submitButtonProps: PropTypes.object,
};

export default Form; 