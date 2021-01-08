const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    public: {
        displayPicture: {
            imageUrl: {
                type: String,
            },
        },
        verified: {
            type: Boolean,
            default: false,
        },
        bio:{
            type: String,
        }
    },
    userName:{
        type:String,
        unique:true,
        index:true,
        require:true
    },
});

module.exports = mongoose.model("User", UserSchema);
