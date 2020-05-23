import React from 'react'
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
import Placeholder from '../../components/UI/HeaderButtonPlaceholder'
import MessageIcon from '../../components/LNB/MessageIcon'
import { CheckBox } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons'
let themeColor
let text

const AdminScreen = props => {
    const scheme = useColorScheme()

    const dispatch = useDispatch()
    
    const CheckMark = () => (
        <Ionicons
            name='ios-checkmark-circle'
            size={16}
            color={Colors.blue}
        />
    )

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
                <HeaderButtons HeaderButtonComponent={Placeholder}>
                    <Item
                        title='Messages'
                        iconName='md-more'
                    />
                </HeaderButtons>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{paddingRight:10}}>
                <View style={{flex:1, alignItems:'flex-start', padding:20}}>
                    <View style={{flexDirection: 'row', marginVertical: 5, alignSelf: 'center'}}>
                        <Text style={{color:Colors.redcrayola, fontWeight:'600', fontSize: 20}}>Notes</Text>
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: 5}}>
                        <Text style={{color:text}}>-    </Text>
                        <Text style={{color:Colors.orange, fontWeight: '600'}}>Refactor Notes: <CheckMark/>{"\n"}
                            <Text style={{color:text, fontWeight:'400'}}>    -    Firebase Functions{"\n"}</Text>
                            <Text style={{color:text, fontWeight:'400'}}>    -    Guard Clauses to avoid If-Nesting 
                                <Text style={{fontSize:3}}>https://youtu.be/g2nMKzhkvxw?t=429</Text> 
                                {"\n"}
                            </Text>
                            <Text style={{color:text, fontWeight:'400'}}>    -    Make Models! OOP/MVC{"\n"}</Text>
                        </Text>
                    </View>
                    <View style={{flexDirection: 'row', marginVertical: 5}}>
                        <Text style={{color:text}}>-    </Text>
                        <Text style={{color:Colors.orange, fontWeight: '600'}}>Misc Notes Notes:    <CheckMark/>{"\n"}
                        <Text style={{color:text, fontWeight:'400'}}>    -    Redesign User Profile{"\n"}</Text>
                        <Text style={{color:text, fontWeight:'400'}}>    -    Mass messaging from Admins{"\n"}</Text>

                        <Text style={{color:text, fontWeight:'400'}}>    -    Start Events App{"\n"}</Text>
                        <Text style={{color:text, fontWeight:'400'}}>    -    Start planning how best to migrate shopping app into LNBapp (Stripe payments){"\n"}</Text>
                        <Text style={{color:text, fontWeight:'400'}}>    -    Allow user to upload audio/video{"\n"}</Text>
                        <Text style={{color:text, fontWeight:'400'}}>    -    Twitter style profile layouts & responsive headers{"\n"}</Text>
                        <Text style={{color:text, fontWeight:'400'}}>    -    Build Admin Page (allow Admins to add new admins){"\n"}</Text>
                        <Text style={{color:text, fontWeight:'400'}}>    -    Implement useMemo when necessary to cache images{"\n"}</Text>
                        <Text style={{color:Colors.raspberry, fontWeight:'400'}}>    -    ANIMATIONS: Like button, shared transitions (opening/navigating to need/picture/video, double-tap(?) etc){"\n"}</Text>
                        <Text style={{color:Colors.raspberry, fontWeight:'400'}}>    -    App Redesign: DrawerScreen, Profile Header, Feed (animated header, new card component, embedded media){"\n"}</Text>
                        <Text style={{color:Colors.raspberry, fontWeight:'400'}}>    -    Improve image aspect ratio, show image when pressed (UserProfile){"\n"}</Text>
                        <Text style={{color:text, fontWeight:'400'}}>    -    Research and implement best practices for SQLite database use cases</Text>
                        <Text style={{color:text, fontWeight:'400'}}>    -    Detect when multiple devices are signed in to same account{"\n"}</Text>
                        <Text style={{color:text, fontWeight:'400'}}>    -    TESTING, TESTING, TESTING{"\n"}</Text>
                        </Text>
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
        flex: 1
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