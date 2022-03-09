module.exports = {
    emailTemplate: (userName,userId,templateName) => {
        return `Hi Team ${userName}  (${userId}) has requested template approval with template name ${templateName}`
    },
}