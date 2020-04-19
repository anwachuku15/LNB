import React, { useEffect, useState } from 'react'
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Button, 
    ScrollView 
} from 'react-native'
// REDUX
import { useSelector, useDispatch } from 'react-redux'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'
import { HeaderButtons, Item } from 'react-navigation-header-buttons'
import HeaderButton from '../../components/UI/HeaderButton'
import * as firebase from 'firebase'
import { logout } from '../../redux/actions/authActions'

const db = firebase.firestore()

let themeColor
let text
const ProfileScreen = props => {
    const scheme = useColorScheme()
    if (scheme === 'dark') {
        themeColor = 'black'
        text = 'white'
    } 
    if (scheme === 'light') {
        themeColor = 'white'
        text = 'black'
    }

    const user = useSelector(state => state.auth)
    const userPosts = useSelector(state => state.posts.userNeeds)
    const dispatch = useDispatch()
    
    // useEffect(() => {
    //     const unsubscribe = console.log('location: ' + user.credentials.location)
    //     return unsubscribe
    // })
    

    
    return (
        
        <View style={styles.screen}>
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

            <View style={{flex:1}}>
                <View style={{marginTop:40, alignItems:'center'}}>
                    <View style={styles.avatarContainer}>
                        <Image style={styles.avatar} source={{uri: user.credentials.imageUrl}}/>
                    </View>
                    <Text style={{...styles.name, ...{color:text}}}>{user.credentials.displayName}</Text>
                    <Text style={styles.infoTitle}>{user.credentials.headline}</Text>
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
                <Button 
                    onPress={() => {
                        dispatch(logout)
                        props.navigation.navigate('Auth')
                    }} 
                    title='Log Out' 
                    color={Colors.orange} 
                />
            </View>
        </View>

            
    )
}


ProfileScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Profile'
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: themeColor,
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
        shadowOpacity: 0.4,
        elevation: 10
    },
    avatar: {
        width: 136,
        height: 136,
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
    }
})


export default ProfileScreen