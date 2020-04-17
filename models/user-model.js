class User {
    constructor(id, user, body, image, likeCount, commentCount) {
        this.id = id,
        this.user = user,
        this.body = body,
        this.image = image,
        this.likeCount = likeCount,
        this.commentCount = commentCount
    }
}

// Client side validations: image not required

export default User