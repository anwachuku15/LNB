import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { likeNeed, unLikeNeed } from '../../redux/actions/postsActions'
import { View, TouchableNativeFeedback, TouchableOpacity, Platform, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

import Colors from '../../constants/Colors'
import firebase from 'firebase'
import { db } from '../../Firebase/Fire'



const NeedActions = props => {

    const need = useSelector(state => state.posts.allNeeds.find(need => need.id === props.needId))
    const userLikes = useSelector(state => state.auth.likes)
    const [likeCount, setLikeCount] = useState(need.likeCount)
    const [commentCount, setCommentCount] = useState(need.commentCount)
    const dispatch = useDispatch()
    const [isLiked, setIsLiked] = useState(false)
    
    
    const uid = useSelector(state => state.auth.userId)
    
    

    useEffect(() => {
        const setLikeIcon = db.collection('likes')
            .where('needId','==',props.needId)
            .where('uid', '==', uid)
            .onSnapshot(snapshot => {
                if (snapshot.empty) {
                    setIsLiked(false)
                } else {
                    setIsLiked(true)
                }
            })
        const needDataListener = db.doc(`/needs/${props.needId}`).onSnapshot(snapshot => {
            if (snapshot.exists) {
                setLikeCount(snapshot.data().likeCount)
                setCommentCount(snapshot.data().commentCount)
            }
        })

        return () => {
            needDataListener()
            setLikeIcon()
        }
    },[dispatch, setIsLiked, setCommentCount])

    const likeHandler = async () => {
        await dispatch(likeNeed(props.needId))
        setIsLiked(true)
        setLikeCount(likeCount+1)
        Haptics.impactAsync('medium')
    }
    const unlikeHandler = async () => {
        await dispatch(unLikeNeed(props.needId))
        setIsLiked(false)
        setLikeCount(likeCount-1)
        Haptics.impactAsync('medium')
    }

    let TouchableCmp = TouchableOpacity
    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }


    return (
        <View style={{paddingTop: 15, width: '75%', flexDirection: 'row', justifyContent:'space-between', alignItems: 'center'}}>
            <TouchableCmp onPress={props.leaveComment}>
                <View style={{flexDirection:'row'}}>
                    <MaterialIcons name='comment' size={24} color={Colors.green} style={{}} />
                    {commentCount > 0 && <Text style={{color:Colors.disabled, alignSelf:'center', marginLeft: 7}}>{commentCount}</Text>}
                </View>
            </TouchableCmp>
            <TouchableCmp onPress={isLiked ? unlikeHandler : likeHandler}>
                <View style={{flexDirection:'row'}}>
                    <MaterialCommunityIcons name={isLiked ? 'thumb-up' : 'thumb-up-outline'} size={24} color={Colors.pink} style={{marginRight: 7}} />
                    {likeCount > 0 && <Text style={{color:Colors.disabled, alignSelf:'center'}}>{likeCount}</Text>}
                </View>
            </TouchableCmp>
            
        </View>
  );
}


export default NeedActions
