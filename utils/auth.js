function isAuth(req)
{
    let currentUser = req.session.userInfo;
    if (currentUser && currentUser._id && currentUser.username) {
        return true;
    } else {
        return false;
    }
}

function isAdminAuth(req)
{
    let currentUser = req.session.adminInfo;
    if (currentUser && currentUser._id && currentUser.username) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    isAuth: isAuth,
    isAdminAuth:isAdminAuth
};