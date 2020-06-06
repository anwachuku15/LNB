import * as firebase from 'firebase'
import { 
    AUTHENTICATE, 
    LOGOUT, 
    SET_USER, 
    SET_SELECTED_USER, 
    SET_PENDING_CONNECTIONS, 
    SET_NEW_CONNECTION, 
    SET_LIKES, 
    SET_NOTIFICATIONS, 
    SET_MESSAGE_NOTIFICATIONS,
    SET_CONNECT_NOTIFICATIONS,
    MARK_NOTIFICATIONS_READ,
    MARK_MESSAGE_NOTIFICATIONS_READ,
    MARK_CONNECT_NOTIFICATIONS_READ,
    LAST_READ_TIMESTAMP,
    SET_ANNOUNCEMENTS,
    // SET_ANNOUNCEMENT,
    SET_CONNECTIONS,
} from '../actions/authActions'
// import { LOGIN, SIGNUP } from '../actions/authActions'



const initialState = {
    token: null,
    userId: null,
    credentials: {},
    connections: 0,
    pendingConnections: [],
    messages: {},
    likes: [],
    notifications: [],
    messageNotifications: [],
    lastReadMessages: [],
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
                likes: action.likes,
                notifications: action.notifications,
                messageNotifications: action.messageNotifications
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
        case SET_LIKES: {
            return {
                ...state,
                likes: action.likes
            }
        }
        case SET_NOTIFICATIONS: {
            return {
                ...state,
                notifications: action.notifications
            }
        }
        case SET_MESSAGE_NOTIFICATIONS: {
            return {
                ...state,
                messageNotifications: action.messageNotifications
            }
        }
        case SET_CONNECT_NOTIFICATIONS: {
            return {
                ...state,
                connectNotifications: action.connectNotifications
            }
        }
        case MARK_NOTIFICATIONS_READ: {
            state.notifications.forEach(notification => notification.read = true)
            return {
                ...state
            }
        }
        case MARK_MESSAGE_NOTIFICATIONS_READ: {
            state.messageNotifications.forEach(notification => notification.read = true)
            return {
                ...state
            }
        }
        case MARK_CONNECT_NOTIFICATIONS_READ: {
            state.connectNotifications.forEach(notification => notification.read = true)
            return {
                ...state
            }
        }
        case SET_NEW_CONNECTION: {
            return {
                ...state,
                connections: action.connections
            }
        }
        case SET_CONNECTIONS: {
            return {
                ...state,
                userConnections: action.userConnections
            }
        }
        case LAST_READ_TIMESTAMP: {
            return {
                ...state,
                lastReadMessages: action.lastReadMessage
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