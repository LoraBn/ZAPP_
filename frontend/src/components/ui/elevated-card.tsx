import {
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Pressable,
  View,
  TextStyle,
} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';

type ElevatedCardProps = {
  children?: React.ReactNode | string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  innerContainerStyle?: StyleProp<ViewStyle>;
};

const ElevatedCard = ({
  children,
  style,
  onPress,
  textStyle,
  innerContainerStyle,
}: ElevatedCardProps) => {
  return (
    <Pressable style={[styles.container, style]} onPress={onPress}>
      <View style={[styles.bottomContainer, innerContainerStyle]}>
        {typeof children === 'string' ? (
          <Text style={textStyle ?? styles.textStyle}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  textStyle: {
    color: Colors.White,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 11 * 1.3,
  },
  container: {
    backgroundColor: Colors.LightGray,
    borderRadius: 50,
  },
  bottomContainer: {
    backgroundColor: Colors.Blue,
    padding: 2,
    borderRadius: 50,
    paddingHorizontal: 25,
    transform: [{translateX: -3}, {translateY: -3}],
  },
});

export default ElevatedCard;
