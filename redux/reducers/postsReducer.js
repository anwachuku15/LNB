import Fire from '../../Firebase/Firebase'
import { CREATE_NEED, SET_NEEDS, CREATE_NEED_NOIMG, LIKE_NEED, UNLIKE_NEED, CREATE_COMMENT, SET_NEED } from '../actions/postsActions'
import Need from '../../models/need-model'


const initialState = {
    allNeeds: [],
    userNeeds: [],
    need: {}
}

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_NEEDS: {
            return {
                allNeeds: action.allNeeds,
                userNeeds: action.userNeeds
            }
        }
        case SET_NEED: {
            return {
                ...state,
                need: action.need
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
        
        case LIKE_NEED:
        case UNLIKE_NEED:
            let index = state.allNeeds.findIndex(need => need.id === action.needData.id)
            state.allNeeds[index] = action.needData
            return {
                ...state
            }
        
        case CREATE_COMMENT:
            state.allNeeds.comments = state.allNeeds.comments !== undefined
                                        ? [action.commentData, ...state.need.comments]
                                        : [action.commentData]
            let index2 = state.allNeeds.findIndex((need) => need.id === action.commentData.postId)
            state.allNeeds[index2].commentCount++
            console.log(state.allNeeds[index2].commentCount)
            return {
                ...state,
                need: {
                    ...state.need
                }
            }
        default:
            return state
    }
}