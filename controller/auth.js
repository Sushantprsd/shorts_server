require("dotenv").config();
const User = require("../model/User");
const Auth = require("../model/Auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.postSignup = (req, res, next) => {
    if (req.body.phoneNumber) {
        const countryCode = req.body.countryCode;
        const number = req.body.phoneNumber;
        const phoneNumber = countryCode.toString() + number.toString();
        Auth.findOne({ phoneNumber: phoneNumber }, { _id: 1 })
            .then((user) => {
                if (user) {
                    const error = new Error("User Already Exist");
                    error.statusCode = 401;
                    throw error;
                }
                return client.verify.services(process.env.TWILIO_SERVICE_ID).verifications.create({
                    to: `+${phoneNumber}`,
                    channel: "sms",
                });
            })
            .then((data) => {
                res.status(200).json({
                    message: "Verification is sent",
                    phoneNumber: phoneNumber,
                });
            })
            .catch((err) => {
                if (!err) {
                    err.statusCode(500);
                    next(err);
                }
                next(err);
            });
    } else {
        res.status(400).json({
            message: "Wrong phone number",
            phoneNumber: phoneNumber,
        });
    }
};

exports.postVerifySignup = (req, res, next) => {
    const phoneNumber = req.body.phoneNumber.toString();
    const code = req.body.code.toString();
    if (phoneNumber && code.length === 6) {
        client.verify
            .services(process.env.TWILIO_SERVICE_ID)
            .verificationChecks.create({
                to: `+${phoneNumber}`,
                code: code,
            })
            .then((data) => {
                if (data.status === "pending") {
                    res.status(400).json({
                        message: "Wrong OTP",
                        data,
                    });
                } else {
                    const token = jwt.sign(
                        {
                            phoneNumber: phoneNumber,
                        },
                        process.env.PHONE_VERIFY_SECRET,
                        { expiresIn: "1h" }
                    );

                    res.status(200).json({
                        message: "User is Verified",
                        token: token,
                    });
                }
            })
            .catch((err) => {
                if (!err) {
                    err.statusCode(500);
                    next(err);
                }
                next(err);
            });
    } else {
        res.status(400).json({
            message: "Wrong phone number or code",
            phoneNumber: phoneNumber,
        });
    }
};

exports.postSignupDetails = (req, res, next) => {
    const authorizationHeader = req.get("Authorization");
    if (!authorizationHeader) {
        const error = new Error("Not Authorized");
        error.statusCode = 401;
        throw error;
    }
    const token = authorizationHeader.split(" ")[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.PHONE_VERIFY_SECRET);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new Error("Not Authorized");
        error.statusCode = 401;
        throw error;
    }
    const phoneNumber = decodedToken.phoneNumber;
    const password = req.body.password;
    const userName = req.body.userName;
    let jwtSecret = null;
    Auth.findOne({ phoneNumber: phoneNumber })
        .then((user) => {
            if (user) {
                const error = new Error("User Already Exist");
                error.statusCode = 401;
                throw error;
            }
            return bcrypt.hash(password, 12);
        })
        .then(async (hashPassword) => {
            jwtSecret = hashPassword;
            const session = await User.startSession();
            session.startTransaction();
            try {
                const opts = { session };
                const newUser = new User({
                    userName: userName,
                });
                const A = await newUser.save(opts);
                const newAuth = new Auth({
                    phoneNumber: phoneNumber,
                    password: hashPassword,
                    userId: A._id,
                    "public.userName": userName,
                });
                const B = await newAuth.save(opts);
                await session.commitTransaction();
                session.endSession();
                return A;
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                throw error;
            }
        })
        .then((newUser) => {
            const token1 = jwt.sign(
                {
                    userName: newUser.userName,
                },
                process.env.PROFILE_VERIFY_SECRET
            );
            console.log(newUser.userName)
            const token2 = jwt.sign(
                {
                    userId: newUser._id.toString(),
                },
                jwtSecret
            );
            res.status(201).json({
                message: "User Created",
                token1: token1,
                token2:token2
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};

exports.postLogin = (req, res, next) => {
    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;
    let loadedUser = null;
    let jwtSecret = null;
    Auth.findOne({ phoneNumber: phoneNumber }, { _id: 1, password: 1, userId: 1,'public.userName':1 })
        .then((user) => {
            if (!user) {
                const error = new Error("User Doesn't Exist");
                error.statusCode = 404;
                throw error;
            } else {
                loadedUser = user;
                jwtSecret = user.password;
                return bcrypt.compare(password, user.password);
            }
        })
        .then((isEqual) => {
            if (!isEqual) {
                const error = new Error("Password not match");
                error.statusCode = 401;
                throw error;
            }
            return User.findById(loadedUser.userId);
        })
        .then((user) => {
            if (!user) {
                const error = new Error("User Doesn't Exist");
                error.statusCode = 404;
                throw error;
            }
            const token1 = jwt.sign(
                {
                    userName: loadedUser.public.userName,
                },
                process.env.PROFILE_VERIFY_SECRET
            );
            const token2 = jwt.sign(
                {
                    userId: user._id.toString(),
                },
                jwtSecret
            );
            return res.status(200).json({
                message: "User found",
                token1: token1,
                token2:token2
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
                next(err);
            }
            next(err);
        });
};
