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
  availableDeliveryMethods: yup
    .object({
      ['Mr. Speedy']: yup.object({
        activated: yup.boolean(),
      }),
      ['Own Delivery']: yup.object({
        activated: yup.boolean(),
        deliveryPrice: yup.number().when('activated', {
          is: true,
          then: yup
            .number()
            .min(0)
            .required('Delivery Price is a required field'),
          otherwise: yup.number().min(0).integer().nullable(),
        }),
      }),
    })
    .test('testAvailableDeliveryMethods', null, (obj) => {
      if (obj['Own Delivery']?.activated || obj['Mr. Speedy']?.activated) {
        return true;
      }

      return new yup.ValidationError(
        'Please enable at least one delivery method',
        null,
        'testAvailableDeliveryMethods',
      );
    }),
  deliveryDiscount: yup.object({
    activated: yup.boolean(),
    discountAmount: yup
      .number()
      .min(0)
      .integer()
      .when('activated', {
        is: true,
        then: yup
          .number()
          .min(0)
          .integer()
          .required('Delivery Discount Amount is a required field'),
        otherwise: yup.number().nullable().min(0).integer(),
      }),
    minimumOrderAmount: yup.number().when('activated', {
      is: true,
      then: yup
        .number()
        .min(0)
        .required('Minimum Order Amount is a required field'),
      otherwise: yup.number().min(0).integer().nullable(),
    }),
  }),
  deliveryType: yup.string().required('Delivery Type is a required field'),
});

const storeDetailsValidationSchema = (days) => {
  const tempSchema = {
    displayImage: yup.string().nullable(),
    coverImage: yup.string().nullable(),
    storeDescription: yup.string().max(200),
    availablePaymentMethods: yup
      .object({
        ['Online Banking']: yup.object({
          activated: yup.boolean(),
        }),
        ['COD']: yup.object({
          activated: yup.boolean(),
        }),
      })
      .test('testAvailablePaymentMethods', null, (obj) => {
        if (obj['Online Banking']?.activated || obj['COD']?.activated) {
          return true;
        }

        return new yup.ValidationError(
          'Please select at least one payment method',
          null,
          'testAvailablePaymentMethods',
        );
      }),
    vacationMode: yup.boolean(),
    storeHours: null,
  };

  days.map((day) => {
    tempSchema.storeHours = {
      ...tempSchema.storeHours,
      [day]: yup
        .object({
          start: yup.string().nullable(),
          end: yup.string().nullable(),
          closed: yup.boolean(),
        })
        .test(`test_storeHours.${day}`, null, (obj) => {
          if (
            obj.closed === undefined ||
            (obj.start === undefined && obj.end === undefined) ||
            (!obj.closed && obj.start <= obj.end)
          ) {
            return true;
          }

          if (obj.closed) {
            return true;
          }

          return new yup.ValidationError(
            'Opening hours needs to be less than Closing hours',
            null,
            `test_storeHours.${day}`,
          );
        }),
    };
  });

  tempSchema.storeHours = yup.object(tempSchema.storeHours);

  return yup.object().shape(tempSchema);
};

export {
  itemValidationSchema,
  foodItemOptionValidationSchema,
  foodItemOptionSelectionValidationSchema,
  deliveryDetailsValidationSchema,
  storeDetailsValidationSchema,
};
