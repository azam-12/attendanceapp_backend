var jwt = require('jsonwebtoken');
const JWT_SECRET = 'Attendanceappfor$epit';


const fetchuser = (req, res, next) => {
    // Get the user from jwt token and add id to req object
    const token = req.header('auth-token')
    if (!token) {
        res.status(410).send({ error: "Inside fetchuser: No token provided" })
    }  
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
        // here next refers to the function that is written after fetchuser the next function is async (req, res)    
    } catch (error) {
        res.status(410).send({ error: "Inside fetchuser: catch loop Please authenticate using a valid token" })
    }

}


module.exports = fetchuser;