import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { likeNeed } from '../../redux/actions/postsActions'
import { setLikes } from '../../redux/actions/authActions'
import { View, TouchableNativeFeedback, TouchableOpacity, Platform, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'


import Colors from '../../constants/Colors'
import firebase from 'firebase'

const db = firebase.firestore()


const NeedActions = props => {

    const need = useSelector(state => state.posts.allNeeds.find(need => need.id === props.needId))
    const [isLiked, setIsLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(need.likeCount)
    const [commentCount, setCommentCount] = useState(need.commentCount)

    const dispatch = useDispatch()

    useEffect(() => {
        
        const needDataListener = db.doc(`/needs/${props.needId}`).onSnapshot(snapshot => {
            setLikeCount(snapshot.data().likeCount)
            setCommentCount(snapshot.data().commentCount)
        })
        needDataListener
    },[dispatch])

    let TouchableCmp = TouchableOpacity
        if (Platform.OS === 'android' && Platform.Version >= 21) {
            TouchableCmp = TouchableNativeFeedback
        }


    return (
    <View style={{paddingTop: 15, width: '75%', flexDirection: 'row', justifyContent:'space-between', alignItems: 'center'}}>
        <TouchableCmp onPress={() => {
            dispatch(likeNeed(props.needId))
        }}>
            <View style={{flexDirection:'row'}}>
                <MaterialCommunityIcons name='thumb-up-outline' size={24} color='#73788B' style={{marginRight: 7}} />
                {likeCount > 0 && <Text style={{color:Colors.disabled, alignSelf:'center'}}>{likeCount}</Text>}
            </View>
        </TouchableCmp>
        <TouchableCmp onPress={props.leaveComment}>
            <View style={{flexDirection:'row'}}>
                <Ionicons name='ios-chatboxes' size={24} color='#73788B' style={{}} />
                {commentCount > -1 && <Text style={{color:Colors.disabled, alignSelf:'center', marginLeft: 7}}>{commentCount}</Text>}
            </View>
        </TouchableCmp>
    </View>
  );
}


export default NeedActions
