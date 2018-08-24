let express = require('express');
let router = express.Router();
let fs = require('fs');
let path = require('path');
var multipart = require('connect-multiparty');
let errorcodes=require('../constants/errorCodes');

router.post('/UploadImg', multipart(), function (req, res) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        var filePath=req.files.file.path;
        //获得文件名
        var filename = req.files.file.originalFilename || path.basename(filePath);
    
        //复制文件到指定路径
        var targetPath = './public/uploads/' + filename;
      
        //复制文件流
        fs.createReadStream(filePath).pipe(fs.createWriteStream(targetPath));
      
        //响应ajax请求，告诉它图片传到哪了
        res.send({
            success: true,
            url: 'http://' + req.headers.host + '/uploads/' + filename
        });
    }

  });

module.exports = router;