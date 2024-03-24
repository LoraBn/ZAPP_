import {
  ColorValue,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import React, {useState} from 'react';
import {Control, FieldValues, Path, useController} from 'react-hook-form';
import Card from './card';
import {Colors} from '../../utils/colors';

type TextInputProps<T extends FieldValues, U> = {
  control: Control<T>;
  name: Path<T>;
  defaultValue?: any;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: ColorValue;
  textColor?: ColorValue;
  items?: U[];
  disabled?: boolean;
  textSize?: number;
};

function DropdownInput<T extends FieldValues, U>({
  control,
  name,
  backgroundColor,
  defaultValue,
  placeholder,
  style,
  textColor,
  items,
  disabled,
  textSize,
}: TextInputProps<T, U>) {
  const {field} = useController({control, name, defaultValue});

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card
      disabled={disabled}
      onPress={() => setIsOpen(prevIsOpen => !prevIsOpen)}
      style={[
        styles.container,
        {backgroundColor: backgroundColor ?? Colors.LightGray},
        style,
      ]}>
      <Text
        style={[
          styles.text,
          {
            color: textColor ?? Colors.Black,
            fontSize: textSize ?? 20,
            lineHeight: textSize ? textSize * 1.2 : 20 * 1.2,
          },
        ]}>
        {field.value ?? placeholder}
      </Text>
      {!disabled && <Text style={styles.indicatorStyle}>{'>'}</Text>}
      {isOpen && (
        <Card style={styles.containerTwo}>
          {items?.map((it, i) => (
            <Pressable
              key={i}
              onPress={() => {
                field.onChange(it);
                setIsOpen(false);
              }}>
              <Text style={[styles.text, styles.smallText]}>
                {typeof it === 'string' ? it : ''}
              </Text>
            </Pressable>
          ))}
        </Card>
      )}
    </Card>
  );
}

export default DropdownInput;

const styles = StyleSheet.create({
  containerTwo: {
    position: 'absolute',
    top: 44,
    zIndex: 100,
    gap: 2,
    borderRadius: 25,
  },
  text: {
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 20 * 1.2,
    color: Colors.Black,
  },
  smallText: {
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 14 * 1.2,
    color: Colors.Black,
  },
  container: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    zIndex: 100,
  },
  indicatorStyle: {
    color: Colors.Blue,
    transform: [{rotate: '90deg'}],
    fontSize: 24,
    lineHeight: 24 * 1.2,
    fontWeight: '700',
  },
});
