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
import { colors } from 'react-native-elements'
let themeColor
let text

const AdminScreen = props => {
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
                        iconName={Platform.OS==='android' ? 'md-arrow-back' : 'ios-arrow-back'}
                        onPress={() => {props.navigation.goBack()}}
                    />
                </HeaderButtons>
                <Text style={styles.headerTitle}>Admin</Text>
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
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{flex:1, alignItems:'flex-start', padding:20}}>
                    <View style={{flexDirection: 'row', marginVertical: 5, alignSelf: 'center'}}>
                        <Text style={{color:Colors.redcrayola, fontWeight:'600', fontSize: 20}}>Weekly Notes (May 11 - May 16)</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: 5}}>
                        <Text style={{color:text}}>-    </Text>
                        <Text style={{color:Colors.orange, fontWeight: '600'}}>Refactor Notes: {"\n"}
                            <Text style={{color:text, fontWeight:'400'}}>    -    Firebase Functions{"\n"}</Text>
                            <Text style={{color:text, fontWeight:'400'}}>    -    Guard Clauses to avoid If-Nesting 
                                <Text style={{fontSize:3}}>https://youtu.be/g2nMKzhkvxw?t=429</Text> 
                                {"\n"}
                            </Text>
                            <Text style={{color:text, fontWeight:'400'}}>    -    Reusable Components for cleaner code{"\n"}</Text>
                            <Text style={{color:text, fontWeight:'400'}}>    -    Make Models! OOP/MVC{"\n"}</Text>
                        </Text>
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: 5}}>
                        <Text style={{color:text}}>-    </Text>
                        <Text style={{color:Colors.orange, fontWeight: '600'}}>Rob's Notes: {"\n"}
                            <Text style={{color:text, fontWeight:'400'}}>    -    Nav to UserProfile from ChatScreen{"\n"}</Text>
                            <Text style={{color:text, fontWeight:'400'}}>    -    Open website link on UserProfileScreen{"\n"}</Text>
                            <Text style={{color:text, fontWeight:'400'}}>    -    Improve EditProfileScreen inputs{"\n"}</Text>
                            <Text style={{color:text, fontWeight:'400'}}>    -    Fix KeyboardDismiss on ConnectScreen{"\n"}</Text>
                        </Text>
                        
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: 5}}>
                        <Text style={{color:text}}>-    </Text>
                        <Text style={{color:text}}>Start building Admin Page (allow Admins to add new admins)</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: 5}}>
                        <Text style={{color:text}}>-    </Text>
                        <Text style={{color:text}}>Implement refresh token</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: 5}}>
                        <Text style={{color:text}}>-    </Text>
                        <Text style={{color:text}}>Search/List members (include search bar on ConnectScreen)</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: 5}}>
                        <Text style={{color:text}}>-    </Text>
                        <Text style={{color:Colors.raspberry}}>ANIMATIONS: Like button, shared transitions (opening/navigating to need/picture/video, double-tap(?) etc)</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: 5}}>
                        <Text style={{color:text}}>-    </Text>
                        <Text style={{color:Colors.raspberry}}>App Redesign: DrawerScreen, Profile Header, Feed (animated header, new card component, embedded media)</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: 5}}>
                        <Text style={{color:text}}>-    </Text>
                        <Text style={{color:Colors.raspberry}}>Improve image aspect ratio, show image when pressed (UserProfile)</Text>
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
                    <View style={{flexDirection: 'row', marginVertical: 5}}>
                        <Text style={{color:text}}>-    </Text>
                        <Text style={{color:text}}>Detect when multiple devices are signed in to same account</Text>
                    </View>
                </View>
            </ScrollView>
        </View>

            
    )
}


AdminScreen.navigationOptions = (navData) => {
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
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    headerTitle: {
        color: Colors.primary,
        fontFamily: 'open-sans-bold',
        fontSize: 17,
        fontWeight: '500'
    },
})
export default AdminScreen