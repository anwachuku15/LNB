import React, {useEffect, useCallback, useState, useMemo} from 'react'
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

    const memoizedAvatar = useMemo(() => {
        return (
            <TouchableCmp onPress={props.toggleDrawer}>
                <Image source={{uri: avatar}} style={styles.menuAvatar} />
            </TouchableCmp>
        )
    }, [avatar, setAvatar])


    return (
        <View>
            {memoizedAvatar}
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