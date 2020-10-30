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
    .lessThan(
      yup.ref('price'),
      'Discounted Price should be greater than Price',
    ),
  additionalStock: yup.number().integer(),
});
