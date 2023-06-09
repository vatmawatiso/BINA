import React, { useState, useEffect, useRef } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    Switch,
    TouchableOpacity,
    FlatList,
    Alert,
    ImageBackground,
    Pressable,
    RefreshControl,
    ScrollView,
    ToastAndroid,AsyncStorage
} from "react-native";
import { allLogo } from '@Assets';
import { toDp } from '@percentageToDP';
import BackHeader from '@BackHeader'
import { CodeField, Cursor, useBlurOnFulfill, MaskSymbol, isLastFilledCell } from 'react-native-confirmation-code-field';
import DropdownAlert from 'react-native-dropdownalert';
import NavigatorService from '@NavigatorService'
import axios from "axios";
import { svr } from "../../Configs/apikey";
//import AsyncStorage from "@react-native-async-storage/async-storage";


const konfirmasiEmail = ({ route, navigation}) => {

    let dropdownAlertRef = useRef();

    const [state, setState] = useState({
        loading: false,
        user_id: '',
        waiting: false,
        minutes: '',
        seconds: '',
        mb_id: '',
    });

    const [value, setValue] = useState('');

    const CELL_COUNT = 6;
    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });

    // https://api.bina-apps.com/dev/react/registrasi-member/verify/MB000000115/Q4Z96LIFSXUJBK9U6ZACCB2CJDQAR0XH4R6O6ARVG



    const getOTP = async () => {
        try {
            const user_id = await AsyncStorage.getItem('temp_mbid');
            console.log('cek mb id ', user_id)

            if (state.waiting) {
                console.log('Harap menunggu...');
            } else {
                const response = await axios.post(svr.url + '/register/verify/' + user_id + '/' + svr.api);

                if (response.data.status == 200) {
                    setState(state => ({ ...state, waiting: true }));

                    const addZero = (i) => {
                        if (i < 10) {
                            i = "0" + i
                        }
                        return i;
                    }

                    let ms = 60000 * 3;

                    let seconds = Math.floor((ms % (1000 * 60)) / 1000);
                    let minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
                    // let hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 & 60));

                    let x = setInterval(function () {

                        setState(state => ({ ...state, minutes: addZero(minutes) }));
                        setState(state => ({ ...state, seconds: addZero(seconds) }));

                        seconds--;

                        if (seconds < 0) {
                            seconds = 59;
                            minutes--;
                        }

                        if (minutes < 0) {
                            clearInterval(x);
                            setState(state => ({ ...state, minutes: '' }));
                            setState(state => ({ ...state, seconds: '' }));
                            setState(state => ({ ...state, waiting: false }));
                        }
                    }, 1000)
                } else {
                    dropdownAlertRef.alertWithType('error', '', 'Gagal mengirim kode verifikasi, silahkan coba lagi');
                }
            }
        } catch (error) {
            dropdownAlertRef.alertWithType('error', '', error.message);
        }

    }

    useEffect(() => {
        getOTP();
    }, [])


    const storeData = async () => {
        try {
            const user_id = await AsyncStorage.getItem('temp_mbid');

            const data = {
                "ver_code": value
            }
            // https://api.bina-apps.com/dev/react/registrasi-member/check/MB000000115/Q4Z96LIFSXUJBK9U6ZACCB2CJDQAR0XH4R6O6ARVG
            const response = await axios.post(svr.url + '/registrasi-member/check/' + user_id + '/' + svr.api, data);

            if (response.data.status == 200) {
                await AsyncStorage.setItem('mbid', user_id);

                await AsyncStorage.removeItem('temp_mbid');
                await AsyncStorage.removeItem('last_step');

                dropdownAlertRef.alertWithType('success', '', 'Akun berhasil diverifikasi');

            } else {
                setState(state => ({ ...state, loading: false }));

                dropdownAlertRef.alertWithType('error', '', 'Gagal memverifikasi akun anda, silahkan coba lagi');
            }
        } catch (error) {
            setState(state => ({ ...state, loading: false }));

            dropdownAlertRef.alertWithType('error', '', error.message);
        }
    }


    const renderCell = ({ index, symbol, isFocused }) => {
        let textChild = null;

        if (symbol) {
            textChild = (
                <MaskSymbol
                    maskSymbol="●"
                    isLastFilledCell={isLastFilledCell({ index, value })}>
                    {symbol}
                </MaskSymbol>
            );
        } else if (isFocused) {
            textChild = <Cursor />;
        }

        return (
            <Text
                key={index}
                style={{
                    width: toDp(40),
                    height: toDp(40),
                    lineHeight: toDp(50),
                    borderWidth: toDp(2),
                    borderColor: '#00000030',
                    textAlign: 'center',
                    borderRadius: toDp(8),
                    backgroundColor: '#B5B5B53B',
                    color: 'black',
                    fontFamily: 'Poppins-Regular',
                    fontSize: toDp(14),
                    marginHorizontal: toDp(4)
                }}>
                {textChild}
            </Text>
        );
    };



    return (
        <View style={styles.container}>
            {/* <BackHeader
                title={'Konfirmasi Email'}
                onPress={() => props.navigation.goBack()}
            /> */}

            <View
                style={{
                    flex: 1,
                    padding: toDp(16),
                    justifyContent: 'center'
                }}>
                <View
                    style={{
                        alignItems: 'center',
                        marginTop: toDp(0)
                    }}>
                    <Image
                        source={allLogo.phone}
                        style={{
                            width: toDp(150),
                            height: toDp(150),
                            marginBottom:toDp(10),
                            marginLeft:toDp(35)
                        }}
                    />

                    <Text
                        style={{
                            color: 'black',
                            fontFamily: 'Poppins-SemiBold',
                            textAlign: 'center',
                            fontSize: toDp(14)
                        }}>
                        Kami telah mengirimkan 6 digit kode verifikasi ke email kamu
                    </Text>

                    <View style={{ padding: toDp(20) }}>
                        <CodeField
                            ref={ref}
                            {...route}
                            value={value}
                            onChangeText={setValue}
                            cellCount={CELL_COUNT}
                            rootStyle={{
                                marginTop: toDp(20),
                                marginHorizontal: toDp(10)
                            }}
                            textContentType="oneTimeCode"
                            renderCell={renderCell}
                        />
                    </View>

                    <TouchableOpacity
                        style={{
                            width: '100%',
                            height: toDp(48),
                            borderRadius: toDp(5),
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: value.length > 5 ? '#005100' : 'grey'
                        }}
                        disabled={
                            value.length > 5 ? false : true
                        }
                        onPress={() => storeData()}>
                        <Text
                            style={{
                                color: 'white',
                                fontFamily: 'Poppins-SemiBold',
                                fontSize: toDp(14)
                            }}>
                            Kirim
                        </Text>
                    </TouchableOpacity>

                    {
                        state.waiting ?
                            <Text
                                style={{
                                    color: '#2A334B',
                                    fontFamily: 'Poppins-SemiBold',
                                    fontSize: toDp(14),
                                    marginTop: toDp(10),
                                }}>
                                {
                                    state.minutes ?
                                        `${state.minutes}:${state.seconds}`
                                        :
                                        `Kirim Ulang ?`
                                }
                            </Text>
                            :
                            <TouchableOpacity onPress={() => getOTP()}>
                                <Text
                                    style={{
                                        color: '#2A334B',
                                        fontFamily: 'Poppins-SemiBold',
                                        fontSize: toDp(14),
                                        marginTop: toDp(10)
                                    }}>
                                    Kirim Ulang ?
                                </Text>
                            </TouchableOpacity>
                    }
                </View>
            </View>
            <DropdownAlert
                updateStatusBar={false}
                ref={(ref) => {
                    if (ref) {
                        dropdownAlertRef = ref;
                    }
                }}
                messageStyle={{
                    color: 'white',
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: toDp(14),
                    textAlign: 'left'
                }}
                onClose={(data) => {
                    if (data.type == 'success') {
                        // navigation.replace('Login');
                        NavigatorService.reset('Login')
                    }
                }}
                imageStyle={{
                    display: 'none'
                }}
            />


        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },

});

export default konfirmasiEmail;
