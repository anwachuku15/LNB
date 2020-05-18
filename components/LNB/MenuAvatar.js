import React, {useEffect, useCallback, useState} from 'react'
import { useSelector } from 'react-redux'
import { View, StyleSheet, Image} from 'react-native'
import TouchableCmp from '../../components/LNB/TouchableCmp'
import * as FileSystem from 'expo-file-system'
import shorthash from 'shorthash'

const MenuAvatar = props => {
    const authUserImage = useSelector(state => state.auth.credentials.imageUrl)
    const [avatar, setAvatar] = useState()

    const loadPic = useCallback(async () => {
        const uri = authUserImage
        const name = shorthash.unique(uri)
        const path = `${FileSystem.cacheDirectory}${name}`
        const image = await FileSystem.getInfoAsync(path)
        if (image.exists) {
            console.log('read image from cache')
            setAvatar(image.uri)
            return
        } else {
            console.log('downloaded image to cache')
            const newImage = await FileSystem.downloadAsync(uri, path)
            setAvatar(newImage.uri)
        }
    })

    useEffect(() => {
        const willFocusSub = loadPic()
        return () => {
            willFocusSub
        }
    }, [loadPic])


    return (
        <View>
            <TouchableCmp onPress={props.toggleDrawer}>
                <Image source={{uri: avatar}} style={styles.menuAvatar} />
            </TouchableCmp>
        </View>
    )
}

const styles = StyleSheet.create({
    menuAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginLeft: 16
    },
})

export default MenuAvatar