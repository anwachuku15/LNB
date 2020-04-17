import * as firebase from 'firebase'
import { AUTHENTICATE, LOGOUT, SET_USER } from '../actions/authActions'
// import { LOGIN, SIGNUP } from '../actions/authActions'



const initialState = {
    token: null,
    userId: null,
    credentials: {},
    connections: null,
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
                messages: action.messages,
                likes: action.likes,
                notifications: action.notifications
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