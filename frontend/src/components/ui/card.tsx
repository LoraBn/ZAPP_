import {
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
  Pressable,
} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';

type CardProps = {
  children?: React.ReactNode | string;
  style?: StyleProp<ViewStyle>;
  onLayout?: ((event: LayoutChangeEvent) => void) | undefined;
  onPress?: () => void;
  selected?: boolean;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
  disabled?: boolean;
};

const Card = ({
  children,
  style,
  onLayout,
  onPress,
  selected,
  pointerEvents,
  disabled,
}: CardProps) => {
  return (
    <Pressable
      disabled={disabled}
      pointerEvents={pointerEvents}
      style={[
        styles.container,
        {backgroundColor: selected ? Colors.VeryLightBlue : Colors.LightGray},
        style,
      ]}
      onLayout={onLayout}
      onPress={onPress}>
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    borderRadius: 50,
    paddingHorizontal: 25,
  },
});

export default Card;
