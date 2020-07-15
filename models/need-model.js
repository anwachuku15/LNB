class Need {
    constructor(id, timestamp, uid, userName, userImage, body, media, imageUrl, likeCount, commentCount, taggedUsers) {
        this.id = id,
        this.timestamp, timestamp,
        this.uid = uid,
        this.userName = userName,
        this.userImage = userImage,
        this.body = body,
        this.media = media,
        this.imageUrl = imageUrl,
        this.likeCount = likeCount,
        this.commentCount = commentCount,
        this.taggedUsers = taggedUsers
    }
}

// Client side validations: image not required

export default Need