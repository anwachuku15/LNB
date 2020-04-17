import { ADD_TO_CART, REMOVE_FROM_CART, REMOVE_ONE_FROM_CART } from "../actions/cartActions"
import { ADD_ORDER } from "../actions/ordersActions"
import CartItem from "../../models/cart-item-model"
import { DELETE_PRODUCT } from "../actions/productsActions"



const initialState = {
    items: {},
    totalAmount: 0
}

export default (state = initialState, action) => {
    switch (action.type) {
        case ADD_TO_CART:
            const addedProduct = action.product
            // const quantity = addedProduct.quantity
            const prodPrice = addedProduct.price
            const prodTitle = addedProduct.title
            let updatedOrNewCartItem

            if (state.items[addedProduct.id]) {
                updatedOrNewCartItem = new CartItem(
                    state.items[addedProduct.id].quantity++,
                    prodPrice,
                    prodTitle,
                    state.items[addedProduct.id].sum += prodPrice
                )
            } else {
                updatedOrNewCartItem = new CartItem(1, prodPrice, prodTitle, prodPrice)
            }
            return {
                ...state,
                items: {
                    [addedProduct.id]: updatedOrNewCartItem,
                    ...state.items,
                    
                },
                totalAmount: state.totalAmount + prodPrice
            }
        case REMOVE_FROM_CART:
            const cartItem = {...state.items}
            delete cartItem[action.pid]
            return {
                ...state
            }
        case REMOVE_ONE_FROM_CART:
            const selectedItem = state.items[action.pid]
            const qty = state.items[action.pid].quantity
            let cartItems
            
            if (qty < 2) {
                cartItems = {...state.items}
                delete cartItems[action.pid]
            } else {
                const cartItem = new CartItem(
                    selectedItem.quantity-1, 
                    selectedItem.productPrice, 
                    selectedItem.productTitle, 
                    selectedItem.sum-=selectedItem.productPrice 
                )
                cartItems = {
                    ...state.items,
                    [action.pid]: cartItem
                }
            }
            return {
                ...state,
                items: cartItems,
                totalAmount: state.totalAmount - selectedItem.productPrice
            }
        
            case ADD_ORDER:
            return initialState

        case DELETE_PRODUCT:
            if (!state.items[action.pid]){
                return state
            } else {
                const updatedItems = {...state.items}
                const itemTotal = state.items[action.pid].sum
                delete updatedItems[action.pid]
                return {
                    ...state,
                    items: updatedItems,
                    totalAmount: state.totalAmount - itemTotal
                }
            }
            
            
        default:
            return state
    }

    return state
}