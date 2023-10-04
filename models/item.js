const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema ({
    item_name: { type: String, required: true, maxLength: 100 },
});

ItemSchema.virtual("url").get(function () {
    return `/catalog/item/${this._id}`;
});

ItemSchema.virtual("name").get(function () {
    return this.item_name;
});

module.exports = mongoose.model("Item", ItemSchema);