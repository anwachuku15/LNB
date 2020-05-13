import React from 'react'
import { 
    View, 
    Text, 
    StyleSheet, 
    CheckBox,
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
const DeveloperScreen = props => {
    const scheme = useColorScheme()

    const dispatch = useDispatch()
    

    const colorScheme = useColorScheme()
    let text
    if (colorScheme === 'dark') {
        themeColor = 'black'
        text = 'white'
    } else {
        themeColor = 'white'
        text = 'black'
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
                <Text style={styles.headerTitle}>Dev Notes</Text>
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
            <View style={{flex:1, alignItems:'flex-start', padding:20}}>
                <View style={{flexDirection: 'row', marginVertical: 5, alignSelf: 'center'}}>
                    <Text style={{color:Colors.redcrayola, fontWeight:'600', fontSize: 20}}>Weekly Notes (May 11 - May 16)</Text>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 5}}>
                    <Text style={{color:text}}>-    </Text>
                    <Text style={{color:Colors.raspberry, fontWeight: '600'}}>* Search/List members (include search bar on ConnectScreen)</Text>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 5}}>
                    <Text style={{color:text}}>-    </Text>
                    <Text style={{color:text}}>ANIMATIONS: Like button, shared transitions (opening/navigating to need/picture/video, double-tap(?) etc)</Text>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 5}}>
                    <Text style={{color:text}}>-    </Text>
                    <Text style={{color:text}}>App Redesign: DrawerScreen, Profile Header, Feed (animated header, new card component, embedded media)</Text>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 5}}>
                    <Text style={{color:text}}>-    </Text>
                    <Text style={{color:text}}>Move connect request notifications to connect screen</Text>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 5}}>
                    <Text style={{color:text}}>-    </Text>
                    <Text style={{color:text}}>Add user picture to notifications and navigate to appropriate screen on press</Text>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 5}}>
                    <Text style={{color:text}}>-    </Text>
                    <Text style={{color:text}}>Improve image aspect ratio</Text>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 5}}>
                    <Text style={{color:text}}>-    </Text>
                    <Text style={{color:text}}>Allow user to upload audio/video</Text>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 5}}>
                    <Text style={{color:text}}>-    </Text>
                    <Text style={{color:text}}>Research and implement best practices for SQLite database use cases</Text>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 5}}>
                    <Text style={{color:text}}>-    </Text>
                    <Text style={{color:text}}>TESTING, TESTING, TESTING</Text>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 5}}>
                    <Text style={{color:text}}>-    </Text>
                    <Text style={{color:text}}>Start planning how best to migrate shopping app into LNBapp (Stripe payments)</Text>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 5}}>
                    <Text style={{color:text}}>-    </Text>
                    <Text style={{color:text}}>In-App links</Text>
                </View>
            </View>
            
        </View>

            
    )
}


DeveloperScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Developer'
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
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500'
    },
})
export default DeveloperScreen