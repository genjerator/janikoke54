import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const ChallengeListItem = ({ item, onPressItem }) => {
  return (
      <TouchableOpacity onPress={() => onPressItem({item})}>
        <View style={styles.container}>
          <Text>{item.name}

          </Text>
        </View>
      </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default ChallengeListItem;
