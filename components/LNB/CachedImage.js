import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, ImageBackground } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

const CachedImage = props => {
    const [imgURI, setImgURI] = useState('')

    const getImageFilesystemKey = async (remoteURI) => {
        const hashed = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            remoteURI
        )
        return `${FileSystem.cacheDirectory}${hashed}`
    }
    const loadImage = async (filesystemURI, remoteURI) => {
        try {
          // Use the cached image if it exists
          const metadata = await FileSystem.getInfoAsync(filesystemURI);
          if (metadata.exists) {
            setImgURI(filesystemURI)
            return
          }
    
          // otherwise download to cache
          const imageObject = await FileSystem.downloadAsync(
            remoteURI,
            filesystemURI
          )
          setImgURI(imageObject.uri)
        }
        catch (err) {
          console.log('Image loading error:', err);
          setImgURI(remoteURI)
        }
    }

    
    useEffect(() => {
        const loadCachedImage = async () => {
            const filesystemURI = await getImageFilesystemKey(props.source.uri)
            if (props.source.uri === imgURI || filesystemURI === imgURI) {
                return null
            }
            await loadImage(filesystemURI, props.source.uri)
        }
        loadCachedImage()

        return () => {
            loadCachedImage()
        }
    }, [getImageFilesystemKey])
      

    return (
      <View>
        {props.isBackground ? (
          <ImageBackground
            {...props}
            source={imgURI ? { uri: imgURI } : null}
          >
            {props.children}
          </ImageBackground>
        ) : (
          <Image
            {...props}
            source={imgURI ? { uri: imgURI } : null}
          />
        )}
      </View>
    );
  
}

export default CachedImage