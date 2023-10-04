const Item = require("../models/item");
const List = require("../models/list");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
    // Get details of items, and lists (in parallel)
    const [
      numItems,
      numLists,
    ] = await Promise.all([
      Item.countDocuments({}).exec(),
      List.countDocuments({}).exec(),
    ]);
  
    res.render("index", {
      title: "Dynamic Grocery List Home",
      item_count: numItems,
      list_count: numLists,
    });
  });

exports.item_list = asyncHandler(async (req, res, next) => {
    const allItems = await Item.find()
    .sort({ item_name: 1 })
    .exec();

  res.render("item_list", { 
    title: "Item List", 
    item_list: allItems });
});

exports.item_detail = asyncHandler(async(req, res, next) => {
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", {
    title: "Item:",
    item: item,
  });
});

exports.item_create_get = asyncHandler(async(req, res, next) => {
  res.render("item_form", { title: "Create Item" });
});

exports.item_create_post = [
  // Validate and sanitize the name field.
  body("item_name", "Item name must contain at least 1 character")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const item = new Item({ item_name: req.body.item_name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("item_form", {
        title: "Create Item",
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Item with same name already exists.
      const itemExists = await Item.findOne({ name: req.body.item_name }).exec();
      if (itemExists) {
        // Item exists, redirect to its detail page.
        res.redirect(itemExists.url);
      } else {
        await item.save();
        // New item saved. Redirect to item detail page.
        res.redirect(item.url);
      }
    }
  }),
];

// Delete GET request
exports.item_delete_get = asyncHandler(async(req, res, next) => {
    const item = await Item.findById(req.params.id).exec();

    if (item == null) {
      //No results
      res.redirect("/catalog/items");
    }

    res.render("item_delete", {
      title: "Delete Item",
      item: item,
    });
});

// Delete POST request
exports.item_delte_post = asyncHandler(async(req, res, next) => {
    const item = await Item.findById(req.params.id).exec();

    await Item.findByIdAndDelete(req.body.itemid);
    res.redirect("/catalog/items");
});

exports.item_update_get = asyncHandler(async(req, res, next) => {
  // Get item
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_form", {
    title: "Update Item",
    item: item,
  });
});

exports.item_update_post = [
  // Validate and sanitize the name field.
  body("item_name", "Item name must contain at least 1 character")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    
    // Create an item object with escaped and trimmed data.
    const item = new Item({ item_name: req.body.item_name, _id: req.params.id, });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("item_form", {
        title: "Update Item",
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save item.
      await Item.findByIdAndUpdate(req.params.id, item);
      // Redirect to updated item record.
      res.redirect(item.url);
    }
  }),
];