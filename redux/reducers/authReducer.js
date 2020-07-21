import * as firebase from 'firebase'
import { 
    AUTHENTICATE, 
    LOGOUT, 
    SET_USER, 
    SET_ALL_USERS,
    SET_SELECTED_USER, 
    SET_PENDING_CONNECTIONS, 
    SET_NEW_CONNECTION, 
    SET_USER_CONNECTIONS,
    // SET_LIKES, 
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
    SET_INCOMING_REQUESTS,
    SET_OUTGOING_REQUESTS,
    SET_GROUP_CHATS,
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
    lastReadAnnouncements: null,
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
                outgoingRequests: action.outgoingRequests,
                likes: action.likes,
                notifications: action.notifications,
                messageNotifications: action.messageNotifications,
                lastReadAnnouncements: action.lastReadAnnouncements
            }
        }
        case SET_ALL_USERS: {
            return {
                ...state,
                allUsers: action.allUsers,
                // isOnline: action.isOnline
            }
        }
        case SET_SELECTED_USER: {
            return {
                ...state,
                selectedUser: action.selectedUser
            }
        }
        // case SET_PENDING_CONNECTIONS: {
        //     return {
        //         ...state,
        //         pendingConnections: action.pendingConnections
        //     }
        // }
        case SET_GROUP_CHATS: {
            return {
                ...state,
                groupChats: action.groupChats
            }
        }
        case SET_INCOMING_REQUESTS: {
            return {
                ...state,
                pendingConnections: action.incomingRequests
            }
        }
        case SET_OUTGOING_REQUESTS: {
            return {
                ...state,
                outgoingRequests: action.outgoingRequests
            }
        }
        // case SET_LIKES: {
        //     return {
        //         ...state,
        //         likes: action.likes
        //     }
        // }
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
                userConnections: action.userConnections,
                userConnectionIds: action.userConnectionIds
            }
        }
        case SET_USER_CONNECTIONS: {
            return {
                ...state,
                selectedUserConnections: action.selectedUserConnections
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