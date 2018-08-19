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
      res.send({
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
                res.send({
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
              status:"error",
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
			isAuth: false
		})
	}
});

//修改管理员密码
router.put('/UpdateUser/:userId', function(req, res, next) {
  if(!auth.isAdminAuth(req))
  {
      res.send({
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
            res.send({
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
      res.send({
          success: false,
          code: errorcodes.NO_LOGIN
      });
  }
  else
  {
    let userId = req.params.userId;
    User.remove({_id: userId}, (err)=>{
        if (err) {
            res.send({
                success: false,
                error: err
            });
        } else {
            res.send({
                success: true
            });
        }
    });
  }
});

//分页查询管理员
router.get('/UsersByPage', function(req, res, next) {
  let {page,username,rowCount}=req.query;
  let limit = rowCount?rowCount:constants.PAGE_SIZE;
  let skip = (page - 1) * limit;
  let queryCondition = {}; 
  if(username){
      queryCondition['username'] = new RegExp(username);
  }
  User.countDocuments(queryCondition, (err, count)=>{
    User.find(queryCondition)
          // .sort(sortCondition)
          .limit(limit)
          .skip(skip)
          .exec((err, users)=>{
              if(err){
                  res.send({
                      success: false,
                      error: err
                  });
              }else {
                  res.send({
                      success: true,
                      list: users,
                      pagination: {
                          total: count,
                          current: page
                      }
                  });
              }
          });
  });
});

module.exports = router;
