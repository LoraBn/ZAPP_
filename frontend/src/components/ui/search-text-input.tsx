import {Image, StyleSheet, TextInput, View} from 'react-native';
import React from 'react';
import {Colors} from '../../utils/colors';
import {ImageStrings} from '../../assets/image-strings';

type SearchTextInputProps = {
  value?: string;
  setValue?: (text: string) => void;
};

const SearchTextInput = ({setValue, value}: SearchTextInputProps) => {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search..."
        style={styles.textInputStyle}
        value={value}
        onChangeText={setValue}
      />
      <Image source={{uri: ImageStrings.SearchIcon, height: 17, width: 17}} />
    </View>
  );
};

export default SearchTextInput;

const styles = StyleSheet.create({
  container: {flexDirection: 'row', alignItems: 'center', gap: 10},
  textInputStyle: {
    backgroundColor: Colors.LightGray,
    flex: 1,
    borderRadius: 100,
    height: 44,
    fontSize: 12,
    paddingHorizontal: 15,
  },
});
