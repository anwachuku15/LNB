import * as firebase from 'firebase'
import * as Google from 'expo-google-app-auth'
import ENV from '../secrets/env'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Crypto from 'expo-crypto'

const isUserEqual = (googleUser, firebaseUser) => {
    if (firebaseUser) {
        const providerData = firebaseUser.providerData;
        for (let i = 0; i < providerData.length; i++) {
        if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
            providerData[i].uid === googleUser.getBasicProfile().getId()) {
            // We don't need to reauth the Firebase connection.
            return true;
        }
        }
    }
    return false;
}

const onSignIn = (googleUser, props) => {
    // console.log('Google Auth Response', googleUser);
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    const unsubscribe = firebase.auth().onAuthStateChanged(async firebaseUser => {
        unsubscribe();
        // Check if we are already signed-in Firebase with the correct user.
        if (!isUserEqual(googleUser, firebaseUser)) {
        // Build Firebase credential with the Google ID token.
        const credential = firebase.auth.GoogleAuthProvider.credential(
            googleUser.idToken,
            googleUser.accessToken
        )
        // Sign in with credential from the Google user.
        // let data
        try {
            const data = await firebase.auth().signInWithCredential(credential)
            
            dispatch(googleSignIn(data, googleUser))
            if (data.additionalUserInfo.isNewUser) {
                props.navigation.navigate('Onboarding')
            }
        } catch (err) {
            // console.log(err.message)
        }
        } else {
        console.log('User already signed-in Firebase.');
        }
    });
}

export const signInWithGoogleAsync = async (props) => {
    try {
        const result = await Google.logInAsync({
            // androidClientId: YOUR_CLIENT_ID_HERE,
            behavior: 'web',
            iosClientId: ENV.google_ios_expo_client,
            iosStandaloneAppClientId: ENV.google_ios_app_client,
            scopes: ['profile', 'email'],
        });
    
    if (result.type === 'success') {
        onSignIn(result, props)
        return result.accessToken;
    } else {
        return { cancelled: true };
    }
    } catch (e) {
        return { error: true };
    }
}

export const loginWithApple = async (props) => {
    const csrf = Math.random().toString(36).substring(2, 15)
    const nonce = Math.random().toString(36).substring(2, 10)
    const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce)
    const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL
        ],
        state: csrf,
        nonce: hashedNonce
    })
    const { identityToken, email, state, fullName } = appleCredential

    if (identityToken) {
        const provider = new firebase.auth.OAuthProvider('apple.com')
        const credential = provider.credential({
            idToken: identityToken,
            rawNonce: nonce
        })
        const data = await firebase.auth().signInWithCredential(credential)
        const displayName = fullName.givenName + ' ' + fullName.familyName
        dispatch(appleLogin(data, displayName))
        if (data.additionalUserInfo.isNewUser) {
            props.navigation.navigate('Onboarding')
        }


    }
}