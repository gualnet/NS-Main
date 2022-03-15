
var _comCol = "coms";
var _userCol = "user";

async function getComById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_comCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getCom() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_comCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getComsByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_comCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function delCom(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_comCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function delUser(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_userCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createCom(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_comCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createUser(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_userCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getUser(_query) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_userCol, _query, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getUserByCategory(_category) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_userCol, { category: _category }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getUserByCategoryAndHarbourId(_category, _harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_userCol, { category: _category, harbourid: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function updateCom(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_comCol, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateUser(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_userCol, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getUserByOnesignalId(_onesignal_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_userCol, { onesignal_userid: _onesignal_id, category: "visitor" }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getUserById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_userCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getAdminById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdbfp.FindById(_userCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}


exports.handler = async(req, res) => { 
    //var users = await getUser({onesignal_userid: null})
    //if (user[0])
    var deluser = await delUser("NezYg4hn9t");
    //var users = await getUser({harbourid: "VetL7I3G1F"});
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(deluser)); 
 }