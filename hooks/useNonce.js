import React, { useEffect, useState } from 'react'
import { generateHexStringAsync } from 'expo-auth-session'

// Generate a random hex string for the nonce parameter
const useNonce = () => {
    const [nonce, setNonce] = useState(null);

    useEffect(() => {
        generateHexStringAsync(16).then(value => setNonce(value));
    }, []);

    return nonce;
}

export default useNonce