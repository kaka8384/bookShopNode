var express = require('express');
var router = express.Router();
// var service=require('../service/catgeoryService');
let Category=require('../models/category');

router.post('/AddCatgeory', function(req, res, next) {
    // console.log(service);
    let category = req.body;
    var newModel=new Category(category);
    newModel.save(function(error) {
        if(error) {
            console.log(error);
        } else {
            console.log('saved OK!');
        }
        // 关闭数据库链接
        db.close();
    });
    // 
    
});

module.exports = router;