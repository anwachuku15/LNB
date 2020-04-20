import * as firebase from 'firebase'
import { AUTHENTICATE, LOGOUT, SET_USER, SET_SELECTED_USER, SET_CONNECT_REQUEST } from '../actions/authActions'
// import { LOGIN, SIGNUP } from '../actions/authActions'



const initialState = {
    token: null,
    userId: null,
    credentials: {},
    connections: null,
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
                messages: action.messages,
                likes: action.likes,
                notifications: action.notifications
            }
        }
        case SET_SELECTED_USER: {
            return {
                ...state,
                selectedUser: action.selectedUser
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