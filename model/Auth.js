const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthSchema = new Schema({
    public: {
        verified: {
            type: Boolean,
            default: false,
        },
        userName: {
            type: String,
            unique: true,
            index: true,
            require: true,
        },
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        require:true
    },
    phoneNumber: {
        type: String,
        unique: true,
        index: true,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
});

AuthSchema.index({ "public.userName": 1 }, { unique: true }, { index: true });

module.exports = mongoose.model("Auth", AuthSchema);
