const jwt = require('jsonwebtoken');
const { forwardRequest } = require('../utils/httpClient');

const baseURL = process.env.USER_SERVICE_URL;

const requireAuth = async (req, res, next) => {
  // verify if user is authenticated
  const { authorization } = req.headers

  if (!authorization) {
    return res.status(401).json({error: 'Authorization token required'});
  }

  const token = authorization.split(' ')[1]

  try {
    // console.log(token)
    const { username } = jwt.verify(token, process.env.JWT_SECRET)

    const user = await forwardRequest('post', `${baseURL}/verifyUser`, {username});
    var userValid = user.data.isUserValid;

    if (userValid === "true") {
        req.user = username;
        next();
    } else {
        res.status(401).json({error: 'Request is not authorized'})
    }


  } catch (error) {
    console.log(error)
    res.status(500).json({error: error})
  }
}

module.exports = requireAuth