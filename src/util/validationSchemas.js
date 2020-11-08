import * as yup from 'yup';

export const foodItemValidationSchema = yup.object().shape({
  name: yup.string().max(50).required('Item Name is a required field'),
  description: yup.string().max(150),
  unit: yup.string().max(20),
  price: yup
    .number()
    .required('Price is a required field')
    .nullable()
    .positive()
    .integer(),
  discountedPrice: yup
    .number()
    .nullable()
    .positive()
    .integer()
    .lessThan(yup.ref('price'), 'Discounted Price should be less than Price'),
  additionalStock: yup.number().integer().nullable(),
  category: yup.string().required('Category is a required field'),
});

export const itemOptionValidationSchema = yup.object().shape({
  name: yup.string().max(50).required('Option Name is required'),
});

export const itemOptionSelectionValidationSchema = yup.object().shape({
  title: yup.string().max(50).required('Selection Name is a required field'),
  price: yup.number().required('Price is a required field').integer(),
});
