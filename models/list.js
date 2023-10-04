const mongoose = require('mongoose');
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const ListSchema = new Schema ({
    list_name: { type: String, required: true, maxLength: 100 },
    date_created: { type: Date, default: Date.now },
    created_by: { type: String, required: true, maxLength: 100 },
    items: { type: Array},
});

ListSchema.virtual("url").get(function () {
    return `/catalog/list/${this._id}`;
});

ListSchema.virtual("date_created_formatted").get(function () {
    return DateTime.fromJSDate(this.date_created).toLocaleString(DateTime.DATE_MED);
  });

module.exports = mongoose.model("List", ListSchema);