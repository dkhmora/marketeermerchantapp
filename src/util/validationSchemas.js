import * as yup from 'yup';

export const foodItemValidationSchema = yup.object().shape({
  name: yup.string().max(50).required('Item Name is required'),
  description: yup.string().max(150),
  unit: yup.string().max(20),
  price: yup.number().required().positive().integer(),
  discountedPrice: yup
    .number()
    .required()
    .positive()
    .integer()
    .lessThan(yup.ref('price'), 'Discounted Price should be less than Price'),
  additionalStock: yup.number().integer(),
  category: yup.string().required(),
});

export const itemOptionValidationSchema = yup.object().shape({
  name: yup.string().max(50).required('Option Name is required'),
});

export const itemOptionSelectionValidationSchema = yup.object().shape({
  title: yup.string().max(50).required('Selection Name is required'),
  price: yup.number().required('Price is required').integer(),
});
