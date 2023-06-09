import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  TextInput,
  Pressable,
  Platform,
  AsyncStorage,
  ToastAndroid,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { allLogo } from '@Assets';
import { toDp } from '@percentageToDP';
import NavigatorService from '@NavigatorService'
import Loader from '@Loader'
import { sha1 } from 'react-native-sha1';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { svr } from '../../Configs/apikey';
import axios from 'axios';
import {
  LoginButton,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager
} from 'react-native-fbsdk';

const Login = (props) => {

  const [state, setState] = useState({
    loading: false,
    secureTextEntry: true,
    mb_username: '',
    mb_password: '',
    rtl_id: '',
    rtl_status: '',
    encpass: '',
    updatePass: false,
    linkLogin: '',
    GUser: []
  })

  useEffect(() => {
    AsyncStorage.setItem('login', '')
    GoogleSignin.configure({
      offlineAccess: true,
      webClientId: '1074872779717-2qkssa1l8pbq24ki9jikge5869o6tamh.apps.googleusercontent.com',
      androidClientId: '1074872779717-t4sfanhv7h7uqb0mirs960oa5dqjotkv.apps.googleusercontent.com',
      scopes: ['profile', 'email']
    })
  }, [])

  const [llogin, setLogin] = useState('');
  const [user, setUser] = useState({});

  // Google Login
  const googleSignin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      //console.log('User Infor =>', userInfo)
      // setUser(userInfo)
      const ugDatas = JSON.stringify(userInfo);
      const newData = JSON.parse(ugDatas);
      state.GUser.push({ userInfo });
      //NavigatorService.navigate('Beranda')

      let body = {
        mb_name: newData.user.name,
        mb_email: newData.user.email,
        mb_phone: '',
        mb_type: 'client',
        mb_password: '',
        mb_username: newData.user.email,
        picture: newData.user.photo
      }

      let datas = [];
      datas.push({
        id: newData.user.id,
        value: {
          mb_name: newData.user.name,
          mb_phone: '',
          mb_type: '',
          password: '',
          mb_username: newData.user.email,
          mb_picture: newData.user.photo,
          mb_email: newData.user.email
        }
      })

      console.log('user log =>', ugDatas);
      //console.log('user body =>', body);

      if (state.GUser.length > 0) {
        // cek login ada ngga
        cekGLogin(newData.user.email, body, datas, newData.user.id, 'google')
      }
    } catch (error) {
      console.log('errorssss =>', error.message);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled login');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign In Proccess');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play service not available');
      } else {
        console.log('Erorr ' + error.code)
      }
    }
  };

  // cek Glogin
  const cekGLogin = (email, body, dataus, id, login) => {
    const data = {
      mb_email: email
    }
    setState(state => ({ ...state, loading: true }))
    console.log('cek login ==> ', svr.url + 'login-member/sosmed/' + svr.api, data)
    axios.post(svr.url + 'login-member/sosmed/' + svr.api, data)
      .then(response => {
        console.log('response cek login =>', JSON.stringify(response.data))
        if (response.data.status == 200) {
          const datas = {
            id: response.data.data[0]?.mb_id,
            value: response.data.data[0],
            tipe: response.data.data[0]?.mb_type,
            retail_id: response.data.rtl_id,
            rtl_status: response.data.rtl_status
          }
          if (datas.value.length === 0) {
            registrasiUser(body, id, dataus, login);
          } else {
            console.log('data regerted =>', datas);
            AsyncStorage.setItem('member', JSON.stringify(datas))
            AsyncStorage.setItem('uid', datas.id);
            AsyncStorage.setItem('rtlid', datas.retail_id)
            if (login == 'google') {
              AsyncStorage.setItem('login', 'google')
              setTimeout(function () {
                NavigatorService.reset('Beranda', { login: 'google' });
              }, 1000);
            } else {
              AsyncStorage.setItem('login', 'facebook')
              setTimeout(function () {
                NavigatorService.reset('Beranda', { login: 'facebook' });
              }, 1000);
            }
          }
          setState(state => ({ ...state, loading: false }))
        } else if (response.data.status == 404) {
          setState(state => ({ ...state, loading: false }))
          registrasiUser(body, id, dataus, login)
        } else if (response.data.status == 500) {
          alert('error server')
          console.log('error server', response)
          setState(state => ({ ...state, loading: false }))
        }
      }).catch(error => {
        console.log('error =>', error)
        setState(state => ({ ...state, loading: false }))
      })
  }

  // kalo data dari g login dan fb login ga ada maka dimasukin ke registrasiUser
  const registrasiUser = (body, id, datas, login) => {
    setState(state => ({ ...state, loading: true }))
    // console.log('body'+ JSON.stringify(body))
    axios.post(svr.url + 'registrasi-member/' + svr.api, body)
      // axios.post('http://192.168.43.234/dev/react/registrasi-member/7J54SR2X7F56VPOP3WXFYBLI171P68C53WNSSPQQ6/', body)
      .then(response => {
        console.log('response =>', id)
        // console.log('response resgiter =>', datas);
        if (response.data.status == 201) {
          console.log('register google ------------------------------=>', response.data)
          AsyncStorage.setItem('member', JSON.stringify(response.data))
          AsyncStorage.setItem('uid', response.data.id)
          // AsyncStorage.setItem('member', JSON.stringify(response.value))
          // AsyncStorage.setItem('uid', JSON.stringify(response.value.mb_id))
          if (login == 'google') {
            AsyncStorage.setItem('login', 'google')
            NavigatorService.reset('Beranda', { login: 'google' });
          } else if (login === 'facebook') {
            AsyncStorage.setItem('login', 'facebook')
            NavigatorService.reset('Beranda', { login: 'facebook' });
          }
          setState(state => ({ ...state, loading: false }))
        } else {
          // alert('Registrasi Gagal, Nama Pengguna atau Email Telah Digunakan')
          ToastAndroid.show("Registrasi Gagal, Nama Pengguna atau Email Telah Digunakan", ToastAndroid.SHORT)
          setState(state => ({ ...state, loading: false }))
        }
      }).catch(error => {
        // alert('Gagal Coba Lagi Nanti')
        ToastAndroid.show("Gagal Coba Lagi Nanti", ToastAndroid.SHORT)
        console.log('error register =>', error)
        setState(state => ({ ...state, loading: false }))
      })
  }

  // facebook login
  const fbLogin = (resCallback) => {
    return LoginManager.logInWithPermissions(['email', 'public_profile'])
      .then(
        response => {
          if (response.declinedPermissions && response.declinedPermissions.includes("email")) {
            resCallback({ message: "email is required" })
          }

          if (response.isCancelled) {
            console.log('Cancelled')
          } else {
            const infoRequest = new GraphRequest(
              '/me?fields=email,name,picture',
              null,
              resCallback
            );
            new GraphRequestManager().addRequest(infoRequest).start()
          }
        },
        function (error) {
          console.log('error =>', error)
        }
      )
  }

  // login facebook
  const onFbLogin = async () => {
    setState(state => ({ ...state, linkLogin: '' }))
    try {
      setState(state => ({ ...state, linkLogin: 'facebook' }))
      await fbLogin(_responseInfoCallBack)
    } catch (error) {
      console.log('error onfbLogin =>', error)
    }
  }

  // response info callback dari fb login
  const _responseInfoCallBack = async (error, response) => {
    if (error) {
      console.log('error response =>', error)
      return;
    } else {
      const userData = response
      console.log('response userData =>', userData)

      state.GUser.push({ userData });
      let datas = [];
      datas.push({
        mb_id: response.id,
        value: [{
          mb_name: response.name,
          mb_phone: '',
          picture: response.picture.data.url,
          mb_email: response.email
        }]
      })
      let body = {
        mb_name: response.name,
        mb_email: response.email,
        mb_phone: '',
        mb_username: response.email,
        picture: response.picture.data.url
      }
      if (state.GUser.length > 0) {
        setState(state => ({ ...state, linkLogin: 'facebook' }))
        console.log('guser length: ', state.GUser.length)
        console.log('data fb login', datas)

        cekGLogin(response.email, body, datas, response.id, 'facebook')
        const data = await AccessToken.getCurrentAccessToken();

        if (!data) {
          throw ('Something wrong obtaining access token')
        }
      }
    }
  }

  {/*Normal Login*/ }
  const getlogin = async () => {
    setState(state => ({ ...state, linkLogin: 'normal' }))
    const body = {
      mb_password: state.mb_password,
      mb_username: state.mb_username,
      retail_id: state.rtl_id,
      rtl_status: state.rtl_status
    }
    console.log('BODY' + JSON.stringify(body));

    setState(state => ({ ...state, loading: true }))
    axios.post(svr.url + 'login-member/' + svr.api, body)
      // axios.post('http://192.168.43.234/dev/react/login-member/7J54SR2X7F56VPOP3WXFYBLI171P68C53WNSSPQQ6/', body)
      .then(result => {
        console.log('Cek Result----------->' + JSON.stringify(result));
        if (result.data.status == 200) {

          const datas = {
            id: result.data.data[0].mb_id,
            value: result.data.data[0],
            tipe: result.data.data[0].mb_type,
            retail_id: result.data.rtl_id,
            rtl_status: result.data.rtl_status
          }
          console.log('DATAS' + JSON.stringify(datas));

          if (datas.value.length === 0) {
            // alert('Nama Pengguna atau Kata Sandi Salah!')
            ToastAndroid.show("Nama Pengguna atau Kata Sandi Salah!", ToastAndroid.SHORT)
          } else {
            //save Async Storage
            console.log(JSON.stringify(datas));

            AsyncStorage.setItem('member', JSON.stringify(datas))

            AsyncStorage.setItem('uid', datas.id)
            AsyncStorage.setItem('rtlid', datas.retail_id)

          }

          NavigatorService.reset('Beranda')
          setState(state => ({ ...state, loading: false }))

        } else if (result.data.status == 404) {
          ToastAndroid.show("Pengguna tidak ditemukan!", ToastAndroid.SHORT)
          // alert('Pengguna tidak ditemukan!')
          setState(state => ({ ...state, loading: false }))
        }
      })

      .catch(err => {
        // console.log(err)
        // alert('Gagal menerima data dari server!')
        ToastAndroid.show("Gagal menerima data dari server!" + err, ToastAndroid.SHORT)
        setState(state => ({ ...state, loading: false }))
      })
  }

  const Shaone = (pass) => {
    sha1(pass).then(hash => {
      setState(state => ({ ...state, mb_password: hash }));
    })
  }

  const validateInput = () => {
    if (state.mb_name.trim() == '') {
      alert('Nama tidak boleh kosong!')
      return;
    }
    if (state.mb_email.trim() == '') {
      alert('Email tidak boleh kosong!')
      return;
    }
    if (state.mb_phone.trim() == '') {
      alert('Nomor Hp tidak boleh kosong!')
      return;
    }
    if (state.mb_type.trim() == '') {
      alert('Tipe pengguna tidak boleh kosong!')
      return;
    }
    if (state.mb_username.trim() == '') {
      alert('Username tidak boleh kosong!')
      return;
    }
    if (state.mb_password.trim() == '') {
      alert('Password tidak boleh kosong!')
      return;
    }

    LoginMember()
  }


  return (
    <View style={styles.container}>
      <Loader loading={state.loading} />
      <StatusBar barStyle="dark-content" translucent={true} backgroundColor={'transparent'} />
      <View style={styles.viewLogoApp}>
        <Image source={allLogo.icbina} style={styles.logoApp} />
      </View>

      <ScrollView>
        <View style={styles.content}>
          <Text style={[styles.textName, { top: toDp(10) }]}>Nama Pengguna</Text>
          <TextInput autoCapitalize={'none'}
            style={styles.textInput}
            placeholder={'Username or Email'}
            placeholderTextColor={'#4E5A64'}
            value={state.mb_username}
            onChangeText={(text) => setState(state => ({ ...state, mb_username: text }))}
          />
          <View style={{ marginTop: toDp(-10) }}>
            <Text style={styles.textName}>Kata Sandi</Text>
            <TextInput autoCapitalize={'none'}
              style={[styles.textInput, { marginTop: toDp(-11) }]}
              placeholder={'Password'}
              placeholderTextColor={'#4E5A64'}
              secureTextEntry={state.secureTextEntry}
              // value={state.mb_password}
              onChangeText={(text) => Shaone(text)}
            />
            <Pressable style={styles.presableShow} onPress={() => setState(state => ({ ...state, secureTextEntry: !state.secureTextEntry }))}>
              {state.secureTextEntry ? <Text style={styles.icVisibility}>Show</Text> : <Text style={styles.icVisibility}>Hide</Text>}
            </Pressable>
          </View>

          <Pressable style={{ justifyContent: 'center', top: toDp(10), height: toDp(48), width: toDp(100) }} onPress={() => NavigatorService.navigate('Lupapassword')}>
            <Text style={styles.textForgot}>Lupa Kata Sandi ?</Text>
          </Pressable>

          <View style={styles.signInWith}>
            <TouchableOpacity style={[styles.btnSignInWith, { width: toDp(90), height: toDp(48), justifyContent: 'center', backgroundColor: '#516675', justifyContent: 'center' }]} onPress={() => NavigatorService.navigate('Register')}>
              <View>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: toDp(15) }}>Daftar</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnSignInWith, { backgroundColor: '#A7661B', borderRadius: toDp(10), width: toDp(90), height: toDp(48), justifyContent: 'center' }]} onPress={() => getlogin()} >
              <View>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: toDp(15) }}>Masuk</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: toDp(50), paddingVertical: 20, }}>
            <View style={styles.rowFooter}>
              <Text style={styles.textDont}>Atau Masuk Dengan</Text>
              <Pressable style={styles.pressableClick} onPress={() => googleSignin()}>
                <View style={{ flexDirection: 'row' }}>
                  <Image source={allLogo.icGoogle} style={styles.icon} />
                  <Text style={{ fontSize: toDp(12), top: toDp(14), fontWeight: 'bold', marginLeft: toDp(10) }}>Masuk Dengan Google</Text>
                </View>
              </Pressable>

              <Pressable style={styles.pressableClick1} onPress={() => onFbLogin()}>
                <View style={{ flexDirection: 'row' }}>
                  <Image source={allLogo.icFacebook} style={styles.icon1} />
                  <Text style={{ fontSize: toDp(12), top: toDp(14), fontWeight: 'bold', color: 'white', marginLeft: toDp(10) }}>Masuk Dengan Facebook</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A334B',

  },
  viewLogoApp: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoApp: {
    marginTop: toDp(100),
    width: toDp(200),
    height: toDp(60)
  },
  signInWith: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: toDp(27)
  },
  btnSignInWith: {
    width: toDp(139),
    height: toDp(48),
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: toDp(8),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4
  },
  content: {
    flex: 1,
    padding: toDp(1)
  },
  pressableClick: {
    padding: toDp(2),
    height: toDp(48),
    backgroundColor: 'white',
    width: toDp(190),
    borderRadius: toDp(10),
    marginBottom: toDp(10),
  },
  pressableClick1: {
    padding: toDp(2),
    width: toDp(190),
    height: toDp(48),
    backgroundColor: '#3B5998',
    borderRadius: toDp(10)
  },
  icbina: {
    width: toDp(200),
    height: toDp(80),
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    paddingTop: toDp(15),
    paddingBottom: toDp(13),
    fontSize: toDp(18)
  },
  desc: {
    fontSize: toDp(13),
    color: 'white'
  },
  textName: {
    fontSize: toDp(12),
    color: 'white',
    fontWeight: '800',
    width: toDp(155),
    height: toDp(55),
    marginRight: toDp(100),
    paddingTop: toDp(20)
  },
  viewContent: {
    zIndex: 2,
    width: '90%',
    height: 'auto',
    backgroundColor: '#52B788',
    borderRadius: toDp(10),
    marginTop: toDp(16),
    padding: toDp(16),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  textInput: {
    width: toDp(340),
    height: toDp(48),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: toDp(8),
    borderRadius: toDp(10),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 0,
  },
  positionRight: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: toDp(8)
  },
  textDont: {
    fontSize: toDp(12),
    color: 'white',
    marginBottom: toDp(10)
  },
  textClick: {
    fontSize: toDp(14),
    fontWeight: 'bold',
    color: '#009EE2',
  },
  presableShow: {

    justifyContent: 'center',
    alignItems: 'center',
    width: toDp(60),
    height: toDp(48),
    padding: toDp(4),
    position: 'absolute',
    zIndex: 15,
    right: toDp(8),
    top: Platform.OS === 'ios' ? toDp(30) : toDp(44)
  },
  viewRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: toDp(27)
  },
  textForgot: {
    color: 'white',
    fontSize: toDp(12),
    paddingTop: toDp(5),
    bottom: toDp(2),
    fontWeight: '800'
  },
  pressableLogin: {
    width: toDp(89),
    height: toDp(50),
    // backgroundColor:'cyan'
  },
  textLogin: {
    color: 'white',
    fontSize: toDp(14),
    textAlignVertical: 'center',
    width: toDp(90),
    height: toDp(48),
    paddingLeft: toDp(25),
    backgroundColor: '#516675',
    borderRadius: toDp(10)
  },
  pressableSignup: {
    right: toDp(200),
    bottom: toDp(50),
    // backgroundColor:'cyan'
  },
  textSignup: {
    color: 'white',
    fontSize: toDp(14),
    backgroundColor: '#A7661B',
    borderRadius: toDp(10),
    width: toDp(90),
    height: toDp(48),
    paddingLeft: toDp(26),
    textAlignVertical: 'center'
  },
  icVisibility: {
    width: toDp(36),

    // backgroundColor:'cyan',
    tintColor: '#4E5A64',
  },
  rowFooter: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    width: toDp(25),
    height: toDp(25),
    marginHorizontal: toDp(5),
    top: toDp(9)
  },
  icon1: {
    width: toDp(25),
    height: toDp(30),
    marginHorizontal: toDp(5),
    top: toDp(7),
    // backgroundColor:'cyan'
  },
  textCreate: {
    textAlign: 'right'
  },
  titleForm: {
    fontSize: toDp(20),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: toDp(4)
  },
  descForm: {
    fontSize: toDp(12),
    color: '#000000',
    textAlign: 'center',
    marginTop: toDp(14)
  }
});

export default Login;
