class Announcement {
    constructor(id, timestamp, uid, admin, adminHeadline, adminImage, body, imageUrl, likeCount, commentCount) {
        this.id = id,
        this.timestamp, timestamp,
        this.uid = uid,
        this.admin = admin,
        this.adminHeadline = adminHeadline,
        this.adminImage = adminImage,
        this.body = body,
        this.imageUrl = imageUrl,
        this.likeCount = likeCount,
        this.commentCount = commentCount
    }
}

// Client side validations: image not required

export default Announcement