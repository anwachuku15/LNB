import { CREATE_ANNOUNCEMENT, CREATE_ANNOUNCEMENT_NOIMG, DELETE_ANNOUNCEMENT } from '../actions/adminActions'
import { SET_ANNOUNCEMENTS, SET_ANNOUNCEMENT } from '../actions/authActions'
import Announcement from '../../models/announcement-model'

const initialState = {
    announcements: [],
    announcement: {}
}

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_ANNOUNCEMENTS: {
            return {
                announcements: action.announcements
            }
        }
        case SET_ANNOUNCEMENT: {
            return {
                ...state,
                announcement: action.announcement,
            }
        }
        case CREATE_ANNOUNCEMENT: 
            const newAnnouncement = new Announcement(
                action.postData.id,
                action.postData.timestamp,
                action.postData.uid,
                action.postData.admin,
                action.postData.adminHeadline,
                action.postData.adminImage,
                action.postData.subject,
                action.postData.body,
                action.postData.imageUrl,
                action.postData.likeCount,
                action.postData.commentCount
            )
            return {
                ...state,
                announcements: state.announcements.concat(newAnnouncement),
            }
        
        case CREATE_ANNOUNCEMENT_NOIMG: 
            const newAnnouncementNoImg = new Announcement(
                action.postData.id,
                action.postData.timestamp,
                action.postData.uid,
                action.postData.admin,
                action.postData.adminHeadline,
                action.postData.adminImage,
                action.postData.subject,
                action.postData.body,
                action.postData.imageUrl,
                action.postData.likeCount,
                action.postData.commentCount
            )
            return {
                ...state,
                announcements: state.announcements.concat(newAnnouncementNoImg),
            }
        
        case DELETE_ANNOUNCEMENT:
            let index = state.announcements.findIndex(announcement => announcement.id === action.announcementId)
            state.announcements.splice(index, 1)
            return {
                ...state
            }
        default:
            return state
    }
}