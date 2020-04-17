import PRODUCTS from '../../data/dummy-data'
import { DELETE_PRODUCT, CREATE_PRODUCT, UPDATE_PRODUCT, SET_PRODUCTS } from '../actions/productsActions'
import Product from '../../models/product-model'

const initialState = {
    availableProducts: [],
    userProducts: []
}
 
export default (state = initialState, action) => {
    switch (action.type) {
        case SET_PRODUCTS:
            return {
                availableProducts: action.products,
                userProducts: action.userProducts
            }
        case CREATE_PRODUCT:
            const newProduct = new Product(
                action.productData.id, 
                action.productData.ownerId,
                action.productData.title,
                action.productData.imageUrl,
                action.productData.description,
                action.productData.price,
                action.productData.dateAdded
            )
            return {
                ...state,
                availableProducts: state.availableProducts.concat(newProduct), // concat: old array + new element 
                userProducts: state.userProducts.concat(newProduct)
            }
            case UPDATE_PRODUCT:
                const productIndex = state.userProducts.findIndex(
                    prod => prod.id === action.pid
                )
                const availableProductIndex = state.availableProducts.findIndex(
                    prod => prod.id === action.pid
                )
    
                const updatedProduct = new Product(
                    action.pid,
                    state.userProducts[productIndex].ownerId,
                    action.productData.title,
                    action.productData.imageUrl,
                    action.productData.description,
                    state.userProducts[productIndex].price,
                    // state.userProducts[productIndex].dateAdded
                )
    
                const updatedUserProducts = [...state.userProducts]
                updatedUserProducts[productIndex] = updatedProduct
    
                const updatedAvailableProducts = [...state.availableProducts]
                updatedAvailableProducts[availableProductIndex] = updatedProduct
    
                return {
                    ...state,
                    availableProducts: updatedAvailableProducts,
                    userProducts: updatedUserProducts
                }
        case DELETE_PRODUCT:
            return {
                ...state,
                availableProducts: state.availableProducts.filter(
                    product => product.id !== action.pid    
                ),
                userProducts: state.userProducts.filter(
                    product => product.id !== action.pid    
                )
            }

            
        default:
            return state
    }
}