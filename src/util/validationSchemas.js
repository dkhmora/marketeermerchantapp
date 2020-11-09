import * as yup from 'yup';

const itemValidationSchema = yup.object().shape({
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

const foodItemOptionValidationSchema = yup.object().shape({
  name: yup.string().max(50).required('Option Name is required'),
});

const foodItemOptionSelectionValidationSchema = yup.object().shape({
  title: yup.string().max(50).required('Selection Name is a required field'),
  price: yup.number().required('Price is a required field').integer(),
});

const deliveryDiscountValidationSchema = yup.object().shape({
  availableDeliveryMethods: yup.object({
    ['Mr. Speedy']: yup.object({
      activated: yup.boolean(),
    }),
    ['Own Delivery']: yup.object({
      activated: yup.boolean(),
      deliveryPrice: yup
        .number()
        .min(0)
        .nullable()
        .integer()
        .when('availableDeliveryMethods["Own Delivery"].activated', {
          is: true,
          then: yup.number().min(0).required(),
          otherwise: yup.number().min(0).integer(),
        }),
    }),
  }),
  deliveryDiscount: yup.object({
    activated: yup.boolean(),
    discountAmount: yup
      .number()
      .min(0)
      .integer()
      .when('deliveryDiscount.activated', {
        is: true,
        then: yup.number().min(0).integer().required(),
        otherwise: yup.number().nullable().min(0).integer(),
      }),
    minimumOrderAmount: yup
      .number()
      .nullable()
      .min(0)
      .integer()
      .when('["deliveryDiscount.activated"]', {
        is: true,
        then: yup.number().min(0).required(),
        otherwise: yup.number().min(0).integer(),
      }),
  }),
  deliveryType: yup.string().required('Delivery Type is a required field'),
});

export {
  itemValidationSchema,
  foodItemOptionValidationSchema,
  foodItemOptionSelectionValidationSchema,
  deliveryDiscountValidationSchema,
};
