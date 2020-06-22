class Announcement {
    constructor(id, timestamp, uid, admin, adminHeadline, adminImage, subject, body, imageUrl, likeCount, commentCount) {
        this.id = id,
        this.timestamp, timestamp,
        this.uid = uid,
        this.admin = admin,
        this.adminHeadline = adminHeadline,
        this.adminImage = adminImage,
        this.subject = subject
        this.body = body,
        this.imageUrl = imageUrl,
        this.likeCount = likeCount,
        this.commentCount = commentCount
    }
}

// Client side validations: image not required

export default Announcement