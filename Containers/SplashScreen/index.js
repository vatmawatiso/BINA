import React, {useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  ImageBackground,
  Pressable,
  AsyncStorage
} from "react-native";
import { allLogo } from '@Assets';
import { toDp } from '@percentageToDP';

import NavigatorService from '@NavigatorService'

const SplashScreen = () => {

  useEffect(() => {
    setTimeout(function(){
      AsyncStorage.getItem('member').then(response => {
        console.log('response', response);
        //cek data null / tidak
        if(response == null) {
          NavigatorService.reset('Login')
        } else {
          NavigatorService.reset('Beranda')
        }
      }).catch(err => {
        console.log('err', err)
      })
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={allLogo.icbina} style={styles.logo1} />
      {/* <Pressable
        onPress={() => NavigatorService.reset('Login')}
        style={styles.buttonGet}>
        <Text style={styles.textGet}>Mulai</Text>
      </Pressable> */}
    </View>
  )
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A334B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo1: {
    width: toDp(250),
    height: toDp(150),
    marginBottom: toDp(70)
  },
  buttonGet: {
    width: toDp(108),
    height: toDp(50),
    backgroundColor: '#698498',
    borderRadius: toDp(15),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: toDp(200)
  },
  textGet: {
    fontSize: toDp(18),
    fontWeight: 'bold',
    color: 'white',
  }
});

export default SplashScreen;