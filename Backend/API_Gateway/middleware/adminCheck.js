const { forwardRequest } = require('../utils/httpClient');

const baseURL = process.env.USER_SERVICE_URL;

const checkSysAdmin = async (req, res, next) => {

    try {
        const user = await forwardRequest('post', `${baseURL}/verifyUser`, {username});
        var userValid = user.data.isUserValid;
        var isAdmin = user.data.isAdmin;

        if (userValid === "true" && isAdmin === "true") {
            req.user = username;
            req.isSysAdmin = true;

        } else {
            res.status(401).json({error: 'User is not authorised to perform the operation...'});
        }

        next();

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error!' })
    }
}

module.exports = checkSysAdmin