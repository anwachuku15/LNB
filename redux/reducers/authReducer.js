import * as firebase from 'firebase'
import { AUTHENTICATE, LOGOUT, SET_USER, SET_SELECTED_USER, SET_PENDING_CONNECTIONS, SET_NEW_CONNECTION, SET_NOTIFICATIONS } from '../actions/authActions'
// import { LOGIN, SIGNUP } from '../actions/authActions'



const initialState = {
    token: null,
    userId: null,
    credentials: {},
    connections: 0,
    pendingConnections: [],
    messages: {},
    likes: [],
    notifications: []
}

export default (state = initialState, action) => {
    switch (action.type) {
        case AUTHENTICATE: {
            return {
                token: action.token,
                userId: action.userId
            }
        }
        case SET_USER: {
            return {
                ...state,
                credentials: action.credentials,
                connections: action.connections,
                pendingConnections: action.pendingConnections,
                notifications: action.notifications
            }
        }
        case SET_SELECTED_USER: {
            return {
                ...state,
                selectedUser: action.selectedUser
            }
        }
        case SET_PENDING_CONNECTIONS: {
            return {
                ...state,
                pendingConnections: action.pendingConnections
            }
        }
        case SET_NOTIFICATIONS: {
            console.log(state.notifications.lastIndexOf(action.notification))
            state.notifications.push(action.notification)
            const updatedNotifications = state.notifications
            return {
                ...state,
                notifications: updatedNotifications
            }
        }
        // case REMOVE_NOTIFICATION: {
        //     return {
        //         ...state,
        //         notifications: 
        //     }
        // }


        case SET_NEW_CONNECTION: {
            return {
                ...state,
                connections: action.connections
            }
        }
        case LOGOUT: {
            firebase.auth().signOut()
            return initialState
        }
        default:
            return state
    }
}