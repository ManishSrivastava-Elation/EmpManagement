import { StyleSheet, Text, View, Button } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

const Registration = () => {
  return (
    <View style={styles.container}>
      <Text>Registration Screen</Text>

      <Button
        title="Back To Login"
        onPress={() => router.replace('/login')}
      />
      <Button
        title="Go To company"
        onPress={() => router.push('/companyRegistration')}
      />
      <Button
        title="Back To Login"
        onPress={() => router.push('/employeeRegistration')}
      />
    </View>
  );
};

export default Registration;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});