const jwt = require('jsonwebtoken')
const { TOKENSECRETCODE } = process.env

const auth = (req, res, next) => {
    const { token } = req.cookies

    if(!token) {
        return res.status(400).send('Token not exist. Please login again')
    }

    try {
        const decode = jwt.verify(token, TOKENSECRETCODE)
        req.user = decode
    } catch(error) {
        res.status(500).send('something went wrong please try again later')
    }

    next()
}

module.exports = auth