import React, { useEffect, useState, useCallback } from 'react'
import firebase from 'firebase'
// EXPO
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
// REDUX
import { useSelector, useDispatch } from 'react-redux'
// REACT-NATIVE
import { AppState, Platform, TouchableOpacity, TouchableNativeFeedback, Text, Button, FlatList, ActivityIndicator, View, StyleSheet, Image, SafeAreaView } from 'react-native'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { Ionicons } from '@expo/vector-icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import '@firebase/firestore'
import { fetchNeeds, likeNeed } from '../../redux/actions/postsActions'
import moment from 'moment'
import NeedActions from '../../components/LNB/NeedActions'
import { setLikes } from '../../redux/actions/authActions';

const db = firebase.firestore()

let themeColor
let text

const HomeScreen = props => {
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
    } 
    if (scheme === 'light') {
        themeColor = 'white'
        text = 'black'
    }
    
    // APP SETTINGS
    const [appState, setAppState] = useState(AppState.currentState)
    useEffect(() => {
        AppState.addEventListener('change', _handleAppStateChange)
        return () => {
            AppState.removeEventListener('change', _handleAppStateChange)
        }
    },[])
    const _handleAppStateChange = nextAppState => {
        if ((appState === 'inactive' || 'background') && nextAppState === 'active') {
            console.log('App has come to the foreground')
        }
        setAppState(nextAppState)
    }
    // PUSH NOTIFICATIONS
    useEffect(() => {
        registerForPushNotificationsAsync()
        // return () => {
        //     registerForPushNotificationsAsync.remove()
        // }
    }, [registerForPushNotificationsAsync])
    const registerForPushNotificationsAsync = async () => {
        if (Constants.isDevice) {
            const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
            let finalStatus = status;
            if (status !== 'granted') {
                const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            try {
                let token = await Notifications.getExpoPushTokenAsync();
                // console.log(token);
                db.doc(`/users/${firebase.auth().currentUser.uid}`)
                    .set(
                        {pushToken: token},
                        {merge: true}
                    )

            } catch (err) {
                console.log('error: ' + err)
            }
        } else {
            // alert('Must use physical device for Push Notifications');
        }

        // ANDROID --> FIREBASE?
        if (Platform.OS === 'android') {
            Notifications.createChannelAndroidAsync('default', {
                name: 'default',
                sound: true,
                priority: 'max',
                vibrate: [0, 250, 250, 250],
            });
        }
    };

    // SCREEN SETTINGS/UI/FUNCTIONS
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState()
    const needs = useSelector(state => state.posts.allNeeds)
    // const notifications = useSelector(state => state.auth.notifications)
    const dispatch = useDispatch()
    
    const loadData = useCallback(async () => {
        setError(null)
        setIsRefreshing(true)
        try {
            await dispatch(fetchNeeds())
            dispatch(setLikes())
        } catch (err){
            console.log(err)
            setError(err.message)
        }
        setIsRefreshing(false)
    },[dispatch, setIsRefreshing, setError])

    // NAV LISTENER
    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus',
            loadData
        )
        // Clean up listener when function re-runs https://reactjs.org/docs/hooks-effect.html
        return () => {
            willFocusSub
        }
    }, [loadData])

    useEffect(() => {
        setIsLoading(true)
        loadData().then(() => {
            setIsLoading(false)
        })
    }, [dispatch, loadData])
    

    const selectUserHandler = (userId) => {
        props.navigation.navigate({
            routeName: 'UserProfile',
            params: {
                userId: userId
            }
        })
    }


    if (error) {
        return (
            <View style={styles.spinner}>
                <Text>An error occured</Text>
                <Button title='try again' onPress={loadData} color={Colors.primary}/>
            </View>
        )
    }

    if (isLoading) {
        return (
            <View style={styles.spinner}>
                <ActivityIndicator 
                    size='large'
                    color={Colors.primary}
                />
            </View>
        )
    }

    if (!isLoading && needs.length === 0) {
        console.log('not loading')
        return (
            <View style={styles.spinner}>
                <Text>No needs found.</Text>
            </View>
        )
    }

   

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }

    const commentButtonHandler = () => {
        props.navigation.navigate('Comment')
    }
    
    return (
        <View style={styles.screen}>
            {/* HEADER */}
            <View style={styles.header}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Menu'
                        iconName={Platform.OS==='android' ? 'md-menu' : 'ios-menu'}
                        onPress={() => {props.navigation.toggleDrawer()}}
                    />
                </HeaderButtons>
                <Text style={styles.headerTitle}>Feed</Text>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Direct'
                        iconName={Platform.OS==='android' ? 'md-chatboxes' : 'ios-chatboxes'}
                        onPress={() => {
                            props.navigation.navigate('Messages')
                        }}
                    />
                </HeaderButtons>
            </View>

            {/* NEED POSTS */}
            <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={needs}
                onRefresh={loadData}
                refreshing={isRefreshing}
                style={styles.feed}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                renderItem={itemData => (
                    <TouchableCmp onPress={props.onSelect} useForeground>
                        <View style={styles.feedItem} key={itemData.item.id}>
                            <TouchableCmp onPress={() => selectUserHandler(itemData.item.uid)}>
                                <Image source={{uri: itemData.item.userImage}} style={styles.avatar} />
                            </TouchableCmp>
                            <View style={{flex: 1}}>
                                <View style={{flexDirection: 'row', justifyContent:'space-between', alignItems:'center'}}>
                                    <View>
                                        <TouchableCmp onPress={() => selectUserHandler(itemData.item.uid)}>
                                            <Text style={styles.name}>
                                                {itemData.item.userName}
                                                <Text style={styles.timestamp}>  ·  {moment(itemData.item.timestamp).fromNow()}</Text>
                                            </Text>
                                        </TouchableCmp>
                                    </View>
                                    <Ionicons name='ios-more' size={24} color='#73788B'/>
                                </View>
                                <Text style={styles.post}>{itemData.item.body}</Text>
                                {itemData.item.imageUrl ? (
                                    <Image source={{uri: itemData.item.imageUrl}} style={styles.postImage} resizeMode='cover'/>
                                ) : (
                                    null
                                )}
                                {/* <View style={{paddingTop: 15, width: '75%', flexDirection: 'row', justifyContent:'space-between', alignItems: 'center'}}>
                                    <TouchableCmp onPress={() => {dispatch(likeNeed(itemData.item.id))}}>
                                        <View style={{flexDirection:'row'}}>
                                            <MaterialCommunityIcons name='thumb-up-outline' size={24} color='#73788B' style={{marginRight: 7}} />
                                            <Text style={{color:Colors.disabled, alignSelf:'center'}}>{itemData.item.likeCount}</Text>
                                        </View>
                                    </TouchableCmp>
                                    <TouchableCmp onPress={() => {props.navigation.navigate('Comment')}}>
                                        <View style={{flexDirection:'row'}}>
                                            <Ionicons name='ios-chatboxes' size={24} color='#73788B' style={{marginRight: 7}} />
                                            {itemData.item.commentCount > 0 && <Text style={{color:Colors.disabled, alignSelf:'center'}}>{itemData.item.commentCount}</Text>}
                                        </View>
                                    </TouchableCmp>
                                </View> */}
                                <NeedActions needId={itemData.item.id} leaveComment={commentButtonHandler}/>
                            </View>
                        </View>
                    </TouchableCmp>
                )}
            />
        </View>
    )
}



const styles = StyleSheet.create({
    touchable: {
        overflow: 'hidden',
        borderRadius: 10,
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    screen: {
        flex: 1,
        backgroundColor: themeColor
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingTop: 49,
        paddingBottom: 16,
        backgroundColor: themeColor,
        borderBottomColor: Colors.primary,
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500'
    },
    feed: {
        // marginHorizontal: 16
    },
    feedItem: {
        backgroundColor: '#FFF',
        borderRadius: 5,
        padding: 8,
        flexDirection: 'row',
        marginVertical: 5,
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowOpacity: 0.26,
        shadowOffset: {width: 0, height: 2},
        // shadowRadius: 8,
        elevation: 5,
        // borderRadius: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 16
    },
    name: {
        fontSize: 15,
        fontWeight: '500',
        color: "#454D65",
    },
    timestamp: {
        fontSize: 14,
        color: '#C4C6CE',
        marginTop: 4
    },
    post: {
        marginTop: 16,
        fontSize: 14,
        color: '#838899'
    },
    postImage: {
        width: undefined,
        height: 150,
        borderRadius: 5,
        marginVertical: 16
    }
})

export default HomeScreen