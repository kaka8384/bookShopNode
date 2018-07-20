var db=require('../db/mongoConnection');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Category = mongoose.model('category', 
{ 
    // _id: [Schema.Types.ObjectId],
    name: String,
    updated: { type: Date, default: Date.now }
});

var Service={
    addCategory:function(category)
    {
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
    },

    updateCategory:function()
    {
        console.log("update");
    },

    deleteCategory:function()
    {
        console.log("delete");
    },

    queryCategoryList:function()
    {
        console.log("query");
    }
}


module.exports = Service;
// module.exports = updateCategory;
// module.exports = deleteCategory;
// module.exports = queryCategoryList;