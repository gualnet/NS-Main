//gestions des cameras


//set datatable cols
var _cameraCol = "camera";
var _userCol = "user";


// set path for img storage
var path_to_img = path.resolve(path.join(CONF.instance.static, "img"));

//function to sort array
var dynamicSort = function (property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        /* next line works with strings and numbers,
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

//generate id
function makeid(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function verifyPostReq(_req, _res) {
    if (!_req.post.title || _req.post.title.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Titre requis", "100", "1.0");
        return false;
    }
    if (!_req.post.harbour_id || _req.post.harbour_id.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Id du port requis", "100", "1.0");
        return false;
    }
    return true;
}

//db functions <
async function getCameraById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_cameraCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}


async function getCamera() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_cameraCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getCameraByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_cameraCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function delCamera(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_cameraCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createCamera(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_cameraCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateCamera(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_cameraCol, { id: _obj.id }, _obj, function (_err, _data) {
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
// >

async function getCameraFromHarbourHandler(_req, _res) {
    var camera = await getCameraByHarbourId(_req.param.harbour_id)
    camera = camera.sort(dynamicSort("date")).reverse();
    UTILS.httpUtil.dataSuccess(_req, _res, "success", camera);
    return;
}


exports.router =
    [
        {
            route: "/api/camera/:harbour_id",
            handler: getCameraFromHarbourHandler,
            method: "GET",
        },
    ];

exports.plugin =
{
    title: "Gestion des caméras",
    desc: "",
    handler: async (req, res) => {
        //get user from FORTPRESS db <
        var admin = await getAdminById(req.userCookie.data.id);
        var _type = admin.data.type;
        var _role = admin.role;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;
        // >
        
        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.camera_id) {
                var promise = await delCamera(req.get.camera_id);
            }
            else if (req.get.camera_id) {
                await getCameraById(req.get.camera_id);
            }
        }
        if (req.method == "POST") {
            if (req.post.id) {

                if (verifyPostReq(req, res)) {
                    if (typeof (await updateCamera(req.post)) != "string") {
                        UTILS.httpUtil.dataSuccess(req, res, "Camera mis à jour", "1.0");
                        return;
                    }
                }
            }
            else {
                req.post.date = Date.now();
                if (typeof (await createCamera(req.post)) != "string") {
                    UTILS.httpUtil.dataSuccess(req, res, "Camera créé", "1.0");
                    return;
                }
            }
        }
        else {
            //get html files
            var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            var _cameraHtml = fs.readFileSync(path.join(__dirname, "camera.html")).toString();
            
            //get cameras from user role
            var _cameras = [];
            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    _cameras = _cameras.concat(await getCameraByHarbourId(_harbour_id[i]));
                }
            }
            else if (_role == "admin")
                _cameras = await getCamera();


            //modify html dynamically <
            var _cameraGen = "";
            for (var i = 0; i < _cameras.length; i++) {
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_cameras[i].harbour_id);
                _cameraGen += _cameraHtml.replace(/__ID__/g, _cameras[i].id)
                    .replace(/__FORMID__/g, _cameras[i].id.replace(/\./g, "_"))
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__HARBOUR_ID__/g, currentHarbour.id)
                    .replace(/__URL__/g, _cameras[i].url)
                    .replace(/__TITLE__/g, _cameras[i].title)
            }
            _indexHtml = _indexHtml.replace("__CAMERA__", _cameraGen).replace(/undefined/g, '');
            // >
            
            var userHarbours = [];
            var harbour_select;
            if (_role == "user") {
                harbour_select = '<div class="col-12">'
                    + '<div class= "form-group" >'
                    + '<label class="form-label">Séléction du port</label>'
                    + '<select class="form-control" style="width:250px;" name="harbour_id">';
                for (var i = 0; i < _harbour_id.length; i++) {
                    userHarbours[i] = await STORE.harbourmgmt.getHarbourById(_harbour_id[i]);
                    harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
                }
                harbour_select += '</select></div></div>';
            } else if (_role == "admin") {
                harbour_select = '<div class="col-12">'
                    + '<div class= "form-group" >'
                    + '<label class="form-label">Séléction du port</label>'
                    + '<select class="form-control" style="width:250px;" name="harbour_id">';
                userHarbours = await STORE.harbourmgmt.getHarbour();
                console.log("ici");
                console.log(userHarbours);
                for (var i = 0; i < userHarbours.length; i++) {
                    harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
                }
                harbour_select += '</select></div></div>';
            }
            _indexHtml = _indexHtml.replace('__HARBOUR_ID_INPUT__', harbour_select);
            //>
    
            //send plugin html page
            res.setHeader("Content-Type", "text/html");
            res.end(_indexHtml);
            return;
        }
    }
}