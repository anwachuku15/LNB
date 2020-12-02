import Fire from "../../Firebase/Firebase";
import {
  CREATE_NEED,
  SET_NEEDS,
  LIKE_NEED,
  UNLIKE_NEED,
  CREATE_COMMENT,
  SET_NEED,
  SET_EVENT_POSTS,
} from "../actions/postsActions";
import Need from "../../models/need-model";

const initialState = {
  allNeeds: [],
  userNeeds: [],
  need: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_NEEDS: {
      return {
        ...state,
        allNeeds: action.allNeeds,
        userNeeds: action.userNeeds,
      };
    }
    case SET_NEED: {
      return {
        ...state,
        need: action.need,
      };
    }
    case SET_EVENT_POSTS: {
      return {
        ...state,
        eventPosts: action.eventPosts,
      };
    }
    case CREATE_NEED:
      const newNeed = new Need(
        action.postData.id,
        action.postData.timestamp,
        action.postData.uid,
        action.postData.userName,
        action.postData.userImage,
        action.postData.body,
        action.postData.media,
        action.postData.imageUrl,
        action.postData.likeCount,
        action.postData.commentCount,
        action.postData.taggedUsers
      );
      return {
        ...state,
        allNeeds: state.allNeeds.concat(newNeed),
        userNeeds: state.userNeeds.concat(newNeed),
      };

    case LIKE_NEED:
    case UNLIKE_NEED:
      let index = state.allNeeds.findIndex(
        (need) => need.id === action.needData.id
      );
      state.allNeeds[index] = action.needData;
      return {
        ...state,
      };

    case CREATE_COMMENT:
      let index2 = state.allNeeds.findIndex(
        (need) => need.id === action.commentData.postId
      );
      state.allNeeds[index2].commentCount++;
      return {
        ...state,
        need: state.allNeeds[index2],
      };
    default:
      return state;
  }
};
