const express = require("express");
const router = express.Router();

const item_controller = require("../controllers/itemController");
const list_controller = require("../controllers/listController");

// ITEM ROUTES //

// GET catalog home page
router.get("/", item_controller.index);

// GET create item
router.get("/item/create", item_controller.item_create_get);

// POST create item
router.post("/item/create", item_controller.item_create_post);

// GET delete item
router.get("/item/:id/delete",  item_controller.item_delete_get);

// POST delete item
router.post("/item/:id/delete", item_controller.item_delte_post);

// GET update item
router.get("/item/:id/update", item_controller.item_update_get);

// POST update item
router.post("/item/:id/update", item_controller.item_update_post);

// GET item detail
router.get("/item/:id", item_controller.item_detail);

// GET items list
router.get("/items", item_controller.item_list);

// LIST ROUTES //

// GET create list
router.get("/list/create", list_controller.list_create_get);

// POST create list
router.post("/list/create", list_controller.list_create_post);

// GET delete list
router.get("/list/:id/delete",  list_controller.list_delete_get);

// POST delete list
router.post("/list/:id/delete", list_controller.list_delte_post);

// GET update list
router.get("/list/:id/update", list_controller.list_update_get);

// POST update list
router.post("/list/:id/update", list_controller.list_update_post);

// GET list detail
router.get("/list/:id", list_controller.list_detail);

// GET lists list
router.get("/lists", list_controller.list_list);

// GET list add item
router.get("/list/:id/addItem", list_controller.item_add_get);

// POST list add item
router.post("/list/:id/addItem", list_controller.item_add_post);

// GET list delete item
router.get("/list/:listid/item/:itemid/delete", list_controller.item_delete_get);

// POST list delete item
router.post("/list/:listid/item/:itemid/delete", list_controller.item_delete_post);

// GET item detail from list page
router.get("/list/:listid/item/:itemid", list_controller.list_item_detail);

// GET clear list
router.get("/list/:id/clear", list_controller.clear_list_get);

// POST clear list
router.post("/list/:id/clear", list_controller.clear_list_post)
module.exports = router;