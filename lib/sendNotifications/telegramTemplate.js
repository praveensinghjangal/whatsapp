module.exports = {
    emailTemplate: (userName,userId,templateName) => {
        return `Hi Team.
        <br/>${userName}  (${userId}) has requested template approval 
        <br> with template name ${templateName}`
    },
}