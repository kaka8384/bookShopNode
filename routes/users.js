var express = require('express');
let User=require('../models/user');
let moment=require('moment');
let constants=require('../constants/constants');
let errorcodes=require('../constants/errorCodes');
let utils=require('../utils/utils');
let md5=require("md5");
var router = express.Router();
let auth=require('../utils/auth');

//添加管理员
router.post('/AddUser', function(req, res, next) {
  if(!auth.isAdminAuth(req))
  {
      res.status(401).send({
          success: false,
          code: errorcodes.NO_LOGIN
      });
  }
  else
  {
    let user = req.body;
    user.password=md5(user.password); //密码加密
    var newModel=new User(user);
    newModel.save((err, user)=>{
        if(err){
            if(err.code==11000)
            {
                res.send({
                    success: false,
                    code: errorcodes.USERNAME_EXIST
                });  //管理员用户名重复
            }  
            else
            {
                res.status(500).send({
                    success: false,
                    error: err
                });
            }
        }else {
            res.send({
                success: true,
                user:user
            });
        }
    });
  }
});

//管理员登录
router.post('/UserLogin',function (req, res, next) {
  let adminInfo = req.body;
  User.findByUserName(adminInfo['username'], function(err, userList){
      if(err){
          res.send({
              error:err
          });
      }
      if(userList.length==0){
          //管理员不存在
          res.send({
              success: false,
              code: errorcodes.USERNAME_NOTEXIST 
          });
      }else {
          if(md5(adminInfo['password'])===userList[0]['password']){
              let {_id, username} = userList[0];
              let authToken = utils.getAuthToken(10);
              //登录成功将用户信息写入 session
              req.session.adminInfo = {
                  _id,
                  username
              };
              res.send({
                  success: true,
                  status:"ok",
                  adminInfo:{
                      username: adminInfo['username'],
                      authToken:authToken,
                  }
              });
          }
          else {
              //密码错误
              res.send({
                  success: false,
                  code: errorcodes.PASSWORD_ERROR
              });
          }
      }
  });
});

//管理员退出
router.post('/UserLogout',function (req, res, next) {
	let currentUser = req.session.adminInfo;
	if(currentUser && currentUser._id){
    delete req.session.adminInfo;
    res.send({
				success: true,
				adminInfo:{
					username: currentUser['username']
				}
			});
	}else {
		res.send({
			success: true
		})
	}
});

//修改管理员
router.put('/UpdateUser/:userId', function(req, res, next) {
  if(!auth.isAdminAuth(req))
  {
      res.status(401).send({
          success: false,
          code: errorcodes.NO_LOGIN
      });
  }
  else
  {
    let userId = req.params.userId;
    let user = req.body;
    if(user.password)
    {
        user.password=md5(user.password);  //修改密码
    }
    user.updated=moment().format();
    let newUser = Object.assign({}, user);
    User.findOneAndUpdate({_id:userId}, newUser, {new: true}, (err, user)=>{
        if(err){
            res.status(500).send({
                success: false,
                error: err
            });
        }
        else if(user==null)
        {
            res.send({
                success: false,
                code: errorcodes.USERNAME_NOTEXIST 
            });
        }
        else {
            res.send({
                success: true,
                user: user
            });
        }
    });
  }
});

//删除管理员
router.delete('/DeleteUser/:userId', function(req, res, next) {
  if(!auth.isAdminAuth(req))
  {
      res.status(401).send({
          success: false,
          code: errorcodes.NO_LOGIN
      });
  }
  else
  {
    let userId = req.params.userId;
    User.remove({_id: userId}, (err)=>{
        if (err) {
            res.status(500).send({
                success: false,
                error: err
            });
        } else {
            res.send({
                success: true,
                userId:userId
            });
        }
    });
  }
});

//批量删除管理员
router.delete('/BatchDeleteUser', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let userIds = req.body.userIds;
        User.remove({_id: {$in:userIds}}, (err)=>{
            if (err) {
                res.status(500).send({
                    success: false,
                    error: err
                });
            } else {
                res.send({
                    success: true,
                    userIds:userIds
                });
            }
        });
    }
});

//分页查询管理员
router.get('/UsersByPage', function(req, res, next) {
    if(!auth.isAdminAuth(req))  //如果没有登录信息
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let {currentPage,username,pageSize,sorter}=req.query;
        let limit = pageSize?parseInt(pageSize):constants.PAGE_SIZE;
        let skip = (currentPage - 1) * limit;
        let queryCondition = {}; 
        let sortCondition = {};
        if(username){
            queryCondition['username'] = new RegExp(username);
        }
        if(sorter)
        {
            let sortField=utils.getSortField(sorter);
            let sortType=utils.getSortType(sorter);
            switch(sortField)
            {
                case "username": //账户名排序
                Object.assign(sortCondition,{"username":sortType});    
                break;
                case "updated": //更新时间排序
                Object.assign(sortCondition,{"updated":sortType});    
                break;
            }
        }
        else
        {
            Object.assign(sortCondition,{"updated":-1}); // 默认按更新时间倒序    
        }
        User.countDocuments(queryCondition, (err, count)=>{
          User.find(queryCondition)
                .sort(sortCondition)
                .limit(limit)
                .skip(skip)
                .exec((err, users)=>{
                    if(err){
                        res.status(500).send({
                            success: false,
                            error: err
                        });
                    }else {
                        res.send({
                            success: true,
                            list: users,
                            pagination: {
                                total: count,
                                current: parseInt(currentPage)
                            }
                        });
                    }
                });
        });
    }
  
});

//查询当前登录用户
router.get('/CurrentUser', function(req, res, next) {
    if(!auth.isAdminAuth(req))  //如果没有登录信息
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let currentUser = req.session.adminInfo;
        res.send({
            success: true,
            name: currentUser.username,
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
            userid: currentUser._id,
            notifyCount: 0
        });
    }
  });

module.exports = router;
