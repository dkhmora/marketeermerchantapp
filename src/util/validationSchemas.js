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

const deliveryDetailsValidationSchema = yup.object().shape({
  availableDeliveryMethods: yup.object({
    ['Mr. Speedy']: yup.object({
      activated: yup.boolean(),
    }),
    ['Own Delivery']: yup.object({
      activated: yup.boolean(),
      deliveryPrice: yup.number().when('activated', {
        is: true,
        then: yup.number().min(0).required(),
        otherwise: yup.number().min(0).integer().nullable(),
      }),
    }),
  }),
  deliveryDiscount: yup.object({
    activated: yup.boolean(),
    discountAmount: yup
      .number()
      .min(0)
      .integer()
      .when('activated', {
        is: true,
        then: yup.number().min(0).integer().required(),
        otherwise: yup.number().nullable().min(0).integer(),
      }),
    minimumOrderAmount: yup.number().when('activated', {
      is: true,
      then: yup.number().min(0).required(),
      otherwise: yup.number().min(0).integer().nullable(),
    }),
  }),
  deliveryType: yup.string().required('Delivery Type is a required field'),
});

const storeDetailsValidationSchema = yup.object().shape({
  displayImage: yup.string().nullable(),
  coverImage: yup.string().nullable(),
  storeDescription: yup.string().max(200),
  availablePaymentMethods: yup.object({
    ['Online Banking']: yup.object({
      activated: yup.boolean(),
    }),
    ['COD']: yup.object({
      activated: yup.boolean(),
    }),
  }),
  vacationMode: yup.boolean(),
});

export {
  itemValidationSchema,
  foodItemOptionValidationSchema,
  foodItemOptionSelectionValidationSchema,
  deliveryDetailsValidationSchema,
  storeDetailsValidationSchema,
};
