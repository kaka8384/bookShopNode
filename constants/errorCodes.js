class ErrorCode
{
}

ErrorCode.USERNAME_EXIST = 10001;  //用户名已存在
ErrorCode.USERNAME_NOTEXIST = 10002; //用户不存在
ErrorCode.PASSWORD_ERROR = 10003; //用户密码错误
ErrorCode.CUSTOMER_NOACTIVE=10004; //用户已被注销
ErrorCode.SHOPPINGCAT_NOTEXIST=10005; //用户的购物车不存在
ErrorCode.SHOPPINGCAT_PRODUCT_NOTEXIST=10006; //购物车中的商品不存在
ErrorCode.NO_DATA_PERMISSION=10007; //没有操作数据的权限
ErrorCode.COMMENT_NOTEXIST=10008; //评论不存在
ErrorCode.ISSUE_NOTEXIST=10009; //问题不存在
ErrorCode.NO_LOGIN=10010;  //用户未登录
ErrorCode.PRODUCT_COLLECTION_EXIST=10011;  //商品已收藏
ErrorCode.COLLECTION_NOTEXIST=10012; //收藏不存在
module.exports =ErrorCode;