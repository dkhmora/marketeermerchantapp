import {Toast as Toaster} from 'native-base';

const Toast = (props) => {
  Toaster.show({
    text: '',
    type: 'success',
    duration: 3000,
    position: 'bottom',
    style: {margin: 20, borderRadius: 16},
    ...props,
  });
};

export default Toast;
