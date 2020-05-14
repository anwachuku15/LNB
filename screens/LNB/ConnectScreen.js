import React, { useEffect } from 'react'
import { 
    Platform,
    TouchableOpacity,
    TouchableNativeFeedback,
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
import MessageIcon from '../../components/LNB/MessageIcon'
let themeColor
let text
const ConnectScreen = props => {
    const scheme = useColorScheme()

    const dispatch = useDispatch()
    const pendingConnections = useSelector(state => state.auth.pendingConnections)
    const notifications = useSelector(state => state.auth.notifications.filter(notification => notification.type === 'connection request'))
    const displayNotifications = notifications.sort((a,b) => a.timestamp > b.timestamp ? -1 : 1)
    useEffect(() => {
        // console.log(pendingConnections)
        console.log(displayNotifications)
    }, [])
    
    
    
    const colorScheme = useColorScheme()
    let text
    let background
    if (colorScheme === 'dark') {
        themeColor = 'black'
        text = 'white'
        background = 'black'
    } else {
        themeColor = 'white'
        text = 'black'
        background = 'white'
    }

    const renderItem = ({item}) => (
        <TouchableCmp onPress={async () => {
            // await dispatch(getUser(item.senderId))
        }}>
            <ListItem
                containerStyle={{backgroundColor:background}}
                title={
                    <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                        {item.type === 'connection request' && (
                            <View style={{flexDirection:'row'}} >
                                <Text style={{color:text, fontSize: 14}}>{item.senderName} wants to connect with you.</Text>
                            </View>
                        )}
                            <Text style={{color:Colors.disabled, fontSize: 14, }}>{moment.utc(new Date(item.timestamp)).fromNow()}</Text>
                    </View>
                }
                // subtitle='Content of what was liked or commented'
                // leftAvatar=
                bottomDivider
            />
        </TouchableCmp>
    )

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }
    return (
        
        <View style={styles.screen}>
            <View style={styles.header}>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        title='Direct'
                        iconName={Platform.OS==='android' ? 'md-menu' : 'ios-menu'}
                        onPress={() => {props.navigation.toggleDrawer()}}
                    />
                </HeaderButtons>
                <Text style={styles.headerTitle}>Connect</Text>
                <HeaderButtons HeaderButtonComponent={HeaderButton}>
                    <Item
                        ButtonElement={<MessageIcon/>}
                        title='Messages'
                        onPress={() => {
                            props.navigation.navigate('Messages')
                        }}
                    />
                </HeaderButtons>
            </View>
            <View style={{flex:1, alignItems:'center'}}>
                <Text style={{color:text}}>
                    <Text style={{color:Colors.primary, fontWeight:'500'}}>NOTE: </Text>
                    Show search bar, connection requests, & connections
                </Text>
            </View>
            
        </View>

            
    )
}


ConnectScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Needs'
    }
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingTop: 49,
        paddingBottom: 16,
        backgroundColor: themeColor,
        borderBottomColor: Colors.primary,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500'
    },
})
export default ConnectScreen