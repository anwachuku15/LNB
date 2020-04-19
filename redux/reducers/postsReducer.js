import Fire from '../../Firebase/Firebase'
import { CREATE_NEED, SET_NEEDS, CREATE_NEED_NOIMG } from '../actions/postsActions'
import Need from '../../models/need-model'


const initialState = {
    allNeeds: [],
    userNeeds: []
}

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_NEEDS: {
            return {
                allNeeds: action.allNeeds,
                userNeeds: action.userNeeds
            }
        }
        case CREATE_NEED:
            const newNeed = new Need(
                action.postData.id,
                action.postData.timestamp,
                action.postData.uid,
                action.postData.userName,
                action.postData.userImage,
                action.postData.body,
                action.postData.imageUrl,
                action.postData.likeCount,
                action.postData.commentCount
            )
            return {
                ...state,
                allNeeds: state.allNeeds.concat(newNeed),
                userNeeds: state.userNeeds.concat(newNeed)
            }
        case CREATE_NEED_NOIMG:
            const newNeedNoImg = new Need(
                action.postData.id,
                action.postData.timestamp,
                action.postData.uid,
                action.postData.userName,
                action.postData.userImage,
                action.postData.body,
                action.postData.imageUrl,
                action.postData.likeCount,
                action.postData.commentCount
            )
            return {
                ...state,
                allNeeds: state.allNeeds.concat(newNeedNoImg),
                userNeeds: state.userNeeds.concat(newNeedNoImg)
            }
        
        default:
            return state
    }
}