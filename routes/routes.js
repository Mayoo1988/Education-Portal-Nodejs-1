const express = require('express');
const router = express.Router();

console.log('Controllers now Executing ');
// Require the controllers WHICH WE DID NOT CREATE YET!!
const category_controller = require('../component/Masters/Category');

//Category Routes
// router.get('/category', category_controller.GetCategory);
// router.get('/category/:id', category_controller.GetCategoryById);
router.post('/category', category_controller.AddCategory);
// router.put('/category', category_controller.EditCategory);
// router.delete('/category', category_controller.DeleteCategory);

module.exports = router;
