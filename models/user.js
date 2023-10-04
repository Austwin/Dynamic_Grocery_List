const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema ({
    first_name: { type: String, required: true, maxLength: 100 },
    last_name: { type: String, required: true, maxLength: 100 },
    username: { type: String, required: true, maxLength: 50},
    password: { type: String, required: true, maxLength: 50}, 
    user_lists: { type: Array },
});

UserSchema.virtual("url").get(function () {
    return `/catalog/list/${this._id}`;
})

module.exports = mongoose.model("User", UserSchema);