import { GET_ALL_OTHER_USERS, GET_ALL_TAGS } from '../constants'

const initialState = {
  usersInfo: [],
  allTags: [],
  userTags: [],
  tvTags: [],
  warningTags: [],
  describeTags: [],
  dislikeTags: [],
}

export default function usersReducer(state = initialState, action) {
  switch (action.type) {
    case GET_ALL_OTHER_USERS:
      return {
        ...state,
        usersInfo: action.users,
      }
    case GET_ALL_TAGS:
      const user = []
      const tv = []
      const warning = []
      const describe = []
      const dislike = []
      action.tags.forEach((tag) => {
        if (tag.type === 'unassigned') {
          user.push(tag)
          tv.push(tag)
        }
        if (tag.type === 'tv') {
          tv.push(tag)
        }
        if (tag.type === 'profile') {
          user.push(tag)
        }
        if (tag.type === 'warning') {
          warning.push(tag)
          dislike.push(tag)
        }
        if (tag.type === 'profile-dislike') {
          dislike.push(tag)
        }
        if (tag.type === 'profile-describe') {
          describe.push(tag)
        }
      })
      return {
        ...state,
        allTags: action.tags,
        userTags: user,
        tvTags: tv,
        warningTags: warning,
        describeTags: describe,
        dislikeTags: dislike,
      }
    default:
      return state
  }
}
