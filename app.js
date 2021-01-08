require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const videoRouter = require("./routes/videos");
const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGOODB_URL, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
    .then(() => {
        app.use("/public", express.static(path.join(__dirname, "public")));
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());
        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
            next();
        });

        app.get("/", (req, res, next) => {
            res.send("getting fetched");
        });
        app.use(authRouter);
        app.use(userRouter);
        app.use(videoRouter);

        app.use((error, req, res, next) => {
            if (!error.statusCode) {
                error.statusCode = 500;
            }
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.statusCode,
            });
        });
        app.listen(PORT, () => {
            console.log(`server started at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
