import React from 'react'
import { 
    Platform, 
    View, 
    Text, 
    Image, 
    StyleSheet, 
    TouchableOpacity,
    TouchableNativeFeedback,

} from 'react-native'
import { useColorScheme } from 'react-native-appearance'
import Card from '../UI/Card'
import Colors from '../../constants/Colors'


// PRESENTATIONAL (STYLING) COMPONENT
const Post = props => {
    const colorScheme = useColorScheme()
    let text
    let priceColor
    if (colorScheme === 'dark') {
        text = 'white'
        priceColor = 'coral'
    } else {
        text = 'black'
        priceColor = Colors.orange
    }

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }
    return (
        <View style={styles.feedItem}>
            <Image source={post.avatar} style={styles.avatar} />
        </View>
        // <Card style={styles.product}>
        //     <View style={styles.touchable}>
        //         <TouchableCmp onPress={props.onSelect} useForeground>
        //             <View>
        //                 <View style={styles.imageContainer}>
        //                     <Image source={{uri: props.image}} style={styles.image}/>
        //                 </View>
                        
        //                 <View style={styles.prodInfo}>
        //                     <Text style={{...styles.title, ...{color:text}}}>{props.title}</Text>
        //                     <Text style={{...styles.price,...{color:priceColor}}}>${props.price.toFixed(2)}</Text>
        //                 </View>
                        
        //                 <View style={styles.buttons}>
        //                     {props.children}
        //                 </View>
        //             </View>
                    
        //         </TouchableCmp>
        //     </View>
        // </Card>
    )
}

const styles = StyleSheet.create({

})

// const styles = StyleSheet.create({
//     product: {
//         height: 300,
//         margin: 20,
//     },
//     touchable: {
//         overflow: 'hidden',
//         borderRadius: 10,
//     },
//     imageContainer: {
//         width: '100%',
//         height: '60%',
//         borderTopLeftRadius: 10,
//         borderTopRightRadius: 10,
//         overflow: 'hidden'
//     },
//     image: {
//         width: '100%',
//         height: '100%',
//     },
//     prodInfo: {
//         alignItems: 'center',
//         height: '19%',
//         padding: 10
//     },  
//     title: {
//         fontFamily: 'open-sans-bold',
//         fontSize: 18,
//         marginVertical: Platform.OS === 'android' ? 4 : 0
//     },
//     price: {
//         fontFamily: 'open-sans',
//         fontSize: 14,
//         // color: '#888'
//         // color: 'lightgray'
//     },
//     buttons: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         height: '21%',
//         paddingHorizontal: 20
//     }
// })

export default Post