let moment=require('moment');

function getAuthToken(len) {
    let tokenStr = '0123456789abcdefghijklmnopqrstuvwxy';
    let token = '';
    for (let i = 0; i < len; i++) {
        token += tokenStr[Math.floor(Math.random() * tokenStr.length)];
    }
    return token;
}

function getOrderNumber(number) {
    return moment().format('YYYYMMDDHH')+_prefixOOO(number);
}

function getSortField(sorter)
{
    return sorter.split('_')[0];
}

function getSortType(sorter)
{
    var type=sorter.split('_')[1];
    return type=="ascend"?1:-1;
}

function _prefixOOO(number) {
    return ('000' + number).substr(-4);
}

module.exports = {
    getAuthToken: getAuthToken,
    getOrderNumber:getOrderNumber,
    getSortField:getSortField,
    getSortType:getSortType
};