const List = require("../models/list");
const Item = require("../models/item");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.list_list = asyncHandler(async (req, res, next) => {
    const allLists = await List.find()
    .sort({ title: 1 })
    .exec();

  res.render("list_list", { title: "My Lists", list_list: allLists });
});

exports.list_detail = asyncHandler(async(req, res, next) => {
    const list = await List.findById(req.params.id).exec();

    if (list === null) {
        // No results.
        const err = new Error("List not found");
        err.status = 404;
        return next(err);
    }

    res.render("list_detail", {
        title: "List:",
        list: list,
        list_items: list.items,
    });
});

exports.list_create_get = asyncHandler(async(req, res, next) => {
    res.render("list_form", { title: "Create List" });
});

exports.list_create_post = [
    // Validate and sanitize the name field.
    body("list_name", "List name must contain at least 1 character")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("created_by")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Created by must be specified.")
        .isAlphanumeric()
        .withMessage("Created by is not alphanumeric"),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      const list = new List({ 
        list_name: req.body.list_name, 
        date_created: req.body.date_created, 
        created_by: req.body.created_by
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render("list_form", {
          title: "Create List",
          list: list,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid.
        // Check if List with same name already exists.
        const listExists = await List.findOne({ name: req.body.list_name }).exec();
        if (listExists) {
          // List exists, redirect to its detail page.
          res.redirect(listExists.url);
        } else {
          await list.save();
          // New list saved. Redirect to list detail page.
          res.redirect(list.url);
        }
      }
    }),
];

exports.list_delete_get = asyncHandler(async(req, res, next) => {
  const list = await List.findById(req.params.id).exec();

  if (list == null) {
    //No results
    res.redirect("/catalog/lists");
  }

  res.render("list_delete", {
    title: "Delete List",
    list: list,
  });
});

exports.list_delte_post = asyncHandler(async(req, res, next) => {
  const list = await List.findById(req.params.id).exec();

  await List.findByIdAndDelete(req.body.listid);
  res.redirect("/catalog/lists");
});

exports.list_update_get = asyncHandler(async(req, res, next) => {
  const list = await List.findById(req.params.id).exec();

  if (list === null) {
    // No results.
    const err = new Error("List not found");
    err.status = 404;
    return next(err);
  }

  res.render("list_form", {
    title: "Update List",
    list: list,
  });
});

exports.list_update_post = [
  // Validate and sanitize the name field.
  body("list_name", "List name must contain at least 1 character")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("created_by")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Created by must be specified."),
      

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    const prevList = await List.findById(req.params.id);
    const itemList = prevList.items;

    // Create List object with escaped and trimmed data
    const list = new List({ 
      list_name: req.body.list_name, 
      created_by: req.body.created_by,
      items: itemList,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("list_form", {
        title: "Update List" + itemList.at(0),
        list: list,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save list
      await List.findByIdAndUpdate(req.params.id, list, {});
      // Redirect to updated list record.
      res.redirect(list.url);
    }
  }),
];

exports.item_add_get = asyncHandler(async(req, res, next) => {
  const list = await List.findById(req.params.id).exec();

  res.render("item_form", { 
    title: `Create Item For: ${list.list_name}`,
  });
});
 
exports.item_add_post = [
  // Validate and sanitize the name field.
  body("item_name", "Item name must contain at least 1 character")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Get List that is being added to
    const list = await List.findById(req.params.id).exec();

    // Create a item object with escaped and trimmed data.
    const item = new Item({ item_name: req.body.item_name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("item_form", {
        title: `Create Item for ${list.list_name}`,
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Item with same name already exists.
      const itemExists = await Item.findOne({ item_name: req.body.item_name }).exec();
      if (itemExists) {
        // Item exists, redirect to its detail page.
        res.redirect(itemExists.url);
      } else {
        //Save item, add it to list, and save list
        await item.save();
        list.items.push(item);
        await list.save();

        // New item saved. Redirect to list detail page.
        res.render("list_item_detail", {
          title: `${list.list_name}: ${item.item_name}`,
          list: list,
          item: item,
        });
      }
    }
  }),
];

exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const [list, item] = await Promise.all([List.findById(req.params.listid).exec(), Item.findById(req.params.itemid).exec()]);

  res.render("list_item_delete", {
    title: `Delete ${item.item_name} from ${list.list_name}`,
    list: list, 
    item: item
  });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  const [list, item] = await Promise.all([List.findById(req.params.listid).exec(), Item.findById(req.params.itemid).exec()]);
  const itemList = list.items;

  for (let i = 0; i < itemList.length; i++) {
    if(itemList[i].item_name == item.item_name) {
      itemList.splice(i,1);
    }
  }

  list.items = itemList;
  list.save();
  Item.findByIdAndDelete(req.params.itemid).exec();
  res.render("list_detail", {
    title: `${list.list_name}`,
    list: list,
  });
});

exports.list_item_detail = asyncHandler(async (req, res, next) => {
  const [list, item] = await Promise.all([List.findById(req.params.listid).exec(), Item.findById(req.params.itemid).exec()]);

  res.render("list_item_detail", {
    title: `${list.list_name}: ${item.item_name}`,
    list: list,
    item: item,
  });
});

exports.clear_list_get = asyncHandler(async (req, res, next) => {
  const list = await List.findById(req.params.id).exec();

  res.render("clear_list", { 
    title: `Clear list: ${list.list_name}`,
    list: list,
  });
});

exports.clear_list_post = asyncHandler(async (req, res, next) => {
  const list = await List.findById(req.params.id).exec();

  list.items = [];
  await list.save();

  res.redirect(list.url);
});