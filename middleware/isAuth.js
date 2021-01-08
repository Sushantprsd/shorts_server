const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Auth = require("../model/Auth");

module.exports = (req, res, next) => {
    const authorizationHeader = req.get("Authorization");
    const authorizationHeader2 = req.get("Authorization2") 
    if (!authorizationHeader && !authorizationHeader2) {
        const error = new Error("Not Authorized");
        error.statusCode = 401;
        throw error;
    }
    const token = authorizationHeader.split(" ")[1];
    const token2 = authorizationHeader2.split(" ")[1];
    let decodedToken1;
    let decodedToken2;
    try {
        decodedToken1 = jwt.verify(token, process.env.PROFILE_VERIFY_SECRET);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken1) {
        const error = new Error("Not Authorized");
        error.statusCode = 401;
        throw error;
    }
    Auth.findOne({ "public.userName": decodedToken1.userName }, { _id: 1,password:1 })
        .then((user) => {
            if (!user) {
                const error = new Error("User doesn't exist");
                error.statusCode = 404;
                throw error;
            }
            try {
                decodedToken2 = jwt.verify(token2, user.password);
            } catch (err) {
                err.statusCode = 500;
                throw err;
            }
            if (!decodedToken2) {
                const error = new Error("Not Authorized");
                error.statusCode = 401;
                throw error;
            }
            return User.findById(decodedToken2.userId, { _id: 1, userName: 1, public: 1 });
        })
        .then((user) => {
            if (!user) {
                const error = new Error("User doesn't exist");
                error.statusCode = 404;
                throw error;
            }
            req.user = user;
            req.userId = user._id;
            next();
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};
