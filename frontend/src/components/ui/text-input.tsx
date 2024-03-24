import {
  StyleSheet,
  TextInput as RNTextInput,
  StyleProp,
  TextStyle,
  ColorValue,
  KeyboardTypeOptions,
} from 'react-native';
import React from 'react';
import {Control, FieldValues, Path, useController} from 'react-hook-form';
import {Colors} from '../../utils/colors';

type TextInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  defaultValue?: any;
  placeholder?: string;
  style?: StyleProp<TextStyle>;
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  disabled?: boolean;
};

function TextInput<T extends FieldValues>({
  control,
  name,
  defaultValue,
  placeholder,
  style,
  backgroundColor,
  textColor,
  keyboardType,
  multiline,
  disabled,
}: TextInputProps<T>) {
  const {field} = useController({control, name, defaultValue});

  return (
    <RNTextInput
      value={field.value}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      placeholder={placeholder}
      placeholderTextColor={textColor}
      multiline={multiline}
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor ?? Colors.LightGray,
          color: textColor ?? Colors.Black,
        },
        style,
      ]}
      keyboardType={keyboardType}
      pointerEvents={disabled ? 'none' : 'auto'}
    />
  );
}

export default TextInput;

const styles = StyleSheet.create({
  container: {
    borderRadius: 25,
    padding: 10,
    flex: 1,
  },
});
