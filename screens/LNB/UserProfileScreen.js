import React, { useEffect, useState, useCallback } from 'react'
import { 
    Platform,
    TouchableOpacity,
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Button, 
    ScrollView,
    FlatList,
    ActivityIndicator
} from 'react-native'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { Ionicons } from '@expo/vector-icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import * as firebase from 'firebase'
import { logout, getUser } from '../../redux/actions/authActions'
import moment from 'moment'

const db = firebase.firestore()

let themeColor
let text
const UserProfileScreen = props => {
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
    } 
    if (scheme === 'light') {
        themeColor = 'white'
        text = 'black'
    }

    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState()

    const dispatch = useDispatch()

    const userId = props.navigation.getParam('userId')
    const user = useSelector(state => state.auth.selectedUser)
    console.log(user)
    const userPosts = useSelector(state => state.posts.allNeeds.filter(need => need.uid === userId))
    
    const loadUser = useCallback(async () => {
        setError(null)
        try {
            await dispatch(getUser(userId))
        } catch (err) {
            console.log(err)
            setError(err.message)
        }
        // setIsRefreshing(false)
    }, [dispatch, setIsLoading, setError])
    
    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus', loadUser
        )
        return () => {
            willFocusSub.remove()
        }
    }, [dispatch, loadUser])

    useEffect(() => {
        setIsLoading(true)
        loadUser().then(() => {
            setIsLoading(false)
            
        })
    }, [dispatch, loadUser])
    
    if (error) {
        return (
            <View style={styles.spinner}>
                <Text>An error occured</Text>
                <Button title='try again' onPress={loadProducts} color={Colors.primary}/>
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

    if (!isLoading && userPosts.length === 0) {
        return (
            <View style={styles.spinner}>
                <Text>This user hasn't posted any needs.</Text>
            </View>
        )
    }

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }
    
    return (
        <View style={styles.screen}>
            {user && (
            <View>
                <View style={styles.header}>
                        <HeaderButtons HeaderButtonComponent={HeaderButton}>
                            <Item
                                title='Direct'
                                iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                                onPress={() => {props.navigation.goBack()}}
                            />
                        </HeaderButtons>
                        <Text style={styles.headerTitle}>{user.credentials.displayName}</Text>
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
                
                <View style={{borderBottomColor:'#C3C5CD', borderBottomWidth:1}}>

                    <View style={{marginTop:40, paddingHorizontal:20, alignItems:'flex-start', flexDirection:'row'}}>
                        <View style={{flexDirection:'column', width:'40%'}}>
                            <View style={styles.avatarContainer}>
                                <Image style={styles.avatar} source={{uri: user.credentials.imageUrl}}/>
                            </View>
                            <Text style={{...styles.name, ...{color:text}}}>{user.credentials.displayName}</Text>
                            <Text style={styles.infoTitle}>{user.credentials.headline}</Text>
                        </View>

                        <View style={{width:'60%', alignSelf:'center'}}>
                            <Text style={styles.infoTitle}>Skillset</Text>
                            <Text style={{color:text}}>{user.credentials.bio}</Text>
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.info}>
                            <Text style={styles.infoValue}>{userPosts.length}</Text>
                            <Text style={styles.infoTitle}>Needs</Text>
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.infoValue}>{user.connections}</Text>
                            <Text style={styles.infoTitle}>Connections</Text>
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.infoValue}>{user.credentials.location}</Text>
                            <Text style={styles.infoTitle}>Location</Text>
                        </View>
                    </View>

                </View>

                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={userPosts}
                    // onRefresh={loadPosts}
                    // refreshing={isRefreshing}
                    style={styles.feed}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={itemData => (
                        <TouchableCmp onPress={props.onSelect} useForeground>
                            <View style={styles.feedItem} key={itemData.item.id}>
                                <TouchableCmp onPress={() => {}}>
                                    <Image source={{uri: itemData.item.userImage}} style={styles.postAvatar} />
                                </TouchableCmp>
                                <View style={{flex: 1}}>
                                    <View style={{flexDirection: 'row', justifyContent:'space-between', alignItems:'center'}}>
                                        <View>
                                            <Text style={styles.postName}>{itemData.item.userName}</Text>
                                            <Text style={styles.postTimestamp}>{moment(itemData.item.timestamp).fromNow()}</Text>
                                        </View>
                                        <Ionicons name='ios-more' size={24} color='#73788B'/>
                                    </View>
                                    <Text style={styles.post}>{itemData.item.body}</Text>
                                    {itemData.item.imageUrl ? (
                                        <Image source={{uri: itemData.item.imageUrl}} style={styles.postImage} resizeMode='cover'/>
                                    ) : (
                                        null
                                    )}
                                    <View style={{paddingTop: 15, width: '75%', flexDirection: 'row', justifyContent:'space-between', alignItems: 'center'}}>
                                        <MaterialCommunityIcons name='thumb-up-outline' size={24} color='#73788B' style={{marginRight: 16}} />
                                        <Ionicons name='ios-chatboxes' size={24} color='#73788B' style={{marginRight: 16}} />
                                    </View>
                                </View>
                            </View>
                        </TouchableCmp>
                    )}
                />

            </View>
            )}
        </View>

            
    )
}


UserProfileScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Profile'
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: themeColor,
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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
    avatarContainer: {
        shadowColor: '#151734',
        shadowRadius: 30,
        shadowOpacity: 0.2,
        elevation: 10
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 68
    },
    name: {
        marginTop: 24,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'open-sans-bold'
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 32,
        marginVertical: 24
    },
    info: {
        flex: 1,
        alignItems: 'center',
    },
    infoValue: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '300'
    },
    infoTitle: {
        color: '#C3C5CD',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4
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
    postAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 16
    },
    postName: {
        fontSize: 15,
        fontWeight: '500',
        color: "#454D65",
    },
    postTimestamp: {
        fontSize: 11,
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


export default UserProfileScreen