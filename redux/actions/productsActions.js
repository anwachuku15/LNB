// import firebase from 'firebase'
import '@firebase/firestore'
import { db } from '../../Firebase/Fire'

import Product from "../../models/product-model"

export const DELETE_PRODUCT = 'DELETE_PRODUCT'
export const CREATE_PRODUCT = 'CREATE_PRODUCT'
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT'
export const SET_PRODUCTS = 'SET_PRODUCTS'

export const fetchProducts = () => {
    return async (dispatch, getState) => {
        const userId = getState().auth.userId

        try {
            const res = await fetch('https://reactnative-ac7bd.firebaseio.com/products.json')
            if(!res.ok) {
                // check response body to see what's wrong
                throw new Error('Something went wrong')
            }
            const resData = await res.json()
            const loadedProducts = []
            for (const key in  resData) {
                loadedProducts.push(new Product(
                    key,
                    resData[key].ownerId,
                    resData[key].title,
                    resData[key].imageUrl,
                    resData[key].description,
                    resData[key].price,
                    // new Date(resDate[key].date)
                ))
            }
            
            dispatch({
                type: SET_PRODUCTS,
                products: loadedProducts,
                userProducts: loadedProducts.filter(prod => prod.ownerId === userId)
            })
        } catch (err) {
            // send to custom analytics server
            throw err
        }

    }
}

// export const createProduct = (title, description, imageUrl, price) => {return {type: CREATE_PRODUCT, productData: {title,description,imageUrl,price}}}
export const createProduct = (title, description, imageUrl, price) => { //id given in reducer (Date)
    return async (dispatch, getState) => {
        const token = getState().auth.token
        const userId = getState().auth.userId
        const res = await fetch(`https://reactnative-ac7bd.firebaseio.com/products.json?auth=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'Application/json',
            },
            body: JSON.stringify({
                title,
                description,
                imageUrl,
                price,
                ownerId: userId
            })
        })
        const resData = await res.json()

        db.collection('products').add({
            title: title,
            description: description,
            imageUrl: imageUrl,
            price: price,
            ownerId: userId
        })

        
        dispatch({
            type: CREATE_PRODUCT,
            productData: {
                id: resData.name,
                title,
                description,
                imageUrl,
                price,
                ownerId: userId
            }
        })
    }
}

export const updateProduct = (id, title, description, imageUrl) => {
    return async (dispatch, getState) => {
        const token = getState().auth.token
        const res = await fetch(`https://reactnative-ac7bd.firebaseio.com/products/${id}.json?auth=${token}`, 
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description,
                imageUrl
            })
        }
        )

        if (!res.ok) {
            throw new Error('Something went wrong')
        }

        dispatch({
            type: UPDATE_PRODUCT,
            pid: id,
            productData: {
                title,
                description,
                imageUrl
            }
        })
    }
}

export const deleteProduct = (productId) => {
    return async (dispatch, getState) => {
        const token = getState().auth.token
        const res = await fetch(`https://reactnative-ac7bd.firebaseio.com/products/${productId}.json?auth=${token}`,
        {
            method: 'DELETE',
        })

        if (!res.ok) {
            throw new Error('Something went wrong')
        }

        dispatch({
            type: DELETE_PRODUCT,
            pid: productId
        })
    }
}