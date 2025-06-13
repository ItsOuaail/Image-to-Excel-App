import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';

interface CustomInputProps extends TextInputProps {
  // You can add custom props here if needed
}

const CustomInput: React.FC<CustomInputProps> = (props) => {
  return (
    <TextInput
      style={[GlobalStyles.input, props.style]}
      placeholderTextColor="#999"
      {...props}
    />
  );
};

export default CustomInput;