import {Text, StyleSheet, StyleProp, ViewStyle, Pressable} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';

type WhiteCardProps = {
  children?: React.ReactNode | string;
  style?: StyleProp<ViewStyle>;
  variant?: 'white' | 'secondary';
  onPress?: () => void;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto' | undefined;
};

const WhiteCard = ({
  children,
  style,
  variant = 'white',
  onPress,
  pointerEvents,
}: WhiteCardProps) => {
  return (
    <Pressable
      pointerEvents={pointerEvents}
      onPress={onPress}
      style={[
        variant === 'white' ? styles.container : styles.secondaryContainer,
        style,
      ]}>
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.White,
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 50,
  },
  secondaryContainer: {
    backgroundColor: Colors.LightBlue,
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 50,
  },
});

export default WhiteCard;
