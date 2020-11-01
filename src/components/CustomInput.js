import React, {Component} from 'react';
import {Icon, Input} from 'react-native-elements';
import {colors} from '../../assets/colors';
import {styles} from '../../assets/styles';

class CustomInput extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      field: {name, onBlur, onChange, value},
      form: {errors, touched, setFieldTouched},
      leftIcon,
      style,
      ...inputProps
    } = this.props;

    const hasError = errors[name] && touched[name];

    return (
      <Input
        style={{...styles.textInput, ...style}}
        value={value}
        errorMessage={hasError ? errors[name] : ''}
        leftIcon={
          leftIcon ? (
            typeof leftIcon === 'string' ? (
              <Icon name={leftIcon} color={colors.primary} size={20} />
            ) : (
              leftIcon
            )
          ) : null
        }
        onChangeText={(text) => onChange(name)(text)}
        onBlur={() => {
          setFieldTouched(name);
          onBlur(name);
        }}
        {...inputProps}
      />
    );
  }
}

export default CustomInput;
