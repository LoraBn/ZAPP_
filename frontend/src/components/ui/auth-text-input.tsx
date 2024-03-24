import {KeyboardTypeOptions, StyleSheet, TextInput, View} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';
import {Control, FieldValues, Path, useController} from 'react-hook-form';

type AuthTextInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  defaultValue?: any;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  disabled?: boolean;
  secureTextEntry?: boolean;
};

function AuthTextInput<T extends FieldValues>({
  control,
  name,
  defaultValue,
  disabled,
  keyboardType,
  placeholder,
  secureTextEntry,
}: AuthTextInputProps<T>) {
  const {field} = useController({control, name, defaultValue});

  return (
    <View
      style={styles.textInputContainer}
      pointerEvents={disabled ? 'none' : 'auto'}>
      <TextInput
        style={styles.textInputStyle}
        onChangeText={field.onChange}
        value={field.value}
        onBlur={field.onBlur}
        keyboardType={keyboardType}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={Colors.Gray}
        autoCapitalize="none"
      />
    </View>
  );
}

export default AuthTextInput;

const styles = StyleSheet.create({
  textInputStyle: {
    backgroundColor: Colors.White,
    flex: 1,
    height: 44,
    borderRadius: 100,
    paddingHorizontal: 15,
    transform: [{translateY: -7}],
    color: Colors.Black,
  },
  textInputContainer: {
    backgroundColor: Colors.Blue,
    borderRadius: 100,
  },
});
