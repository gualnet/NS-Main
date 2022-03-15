var _weatherCol = "weather";

var _userCol = "user";
var path_to_img = path.resolve(path.join(CONF.instance.static, "img", "bulletin"));

function testOnlyAplhaNum(value) {
    if (value.match("^[a-zA-Z0-9]*.png$")) {
        return true;
    } else
        return false;
}

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

function makeid(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log(result);
    return result;
}

function addProtocolToUrl(url) {
    var patternProtocol = new RegExp('^(https?:\\/\\/)') // protocol
    console.log(url);
    console.log(patternProtocol.test(url));
    if (patternProtocol.test(url)) {
        console.log(url);
        return url;
    } else {
        console.log(url);
        return ("https://" + url);
    }
}

function verifyPostReq(_req, _res) {
    if (!_req.post.title || _req.post.title.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Titre requis", "100", "1.0");
        return false;
    }
    if (!_req.post.content || _req.post.content.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Contenu requis", "100", "1.0");
        return false;
    }
    if (!_req.post.harbour_id || _req.post.harbour_id.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Id du port requis", "100", "1.0");
        return false;
    }
    if (!_req.post.category == "news" || !_req.post.category == "event") {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Catégorie invalide", "100", "1.0");
        return false;
    }
    return true;
}

async function getWeatherById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_weatherCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}


async function getWeather() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_weatherCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getWeatherByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_weatherCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function delWeather(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_weatherCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createWeather(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_weatherCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateWeather(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_weatherCol, { id: _obj.id }, _obj, function (_err, _data) {
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

async function getWeatherFromHarbourHandler(_req, _res) {
    var weather = await getWeatherByHarbourId(_req.param.harbour_id)
    weather = weather.sort(dynamicSort("date")).reverse();
    if (weather[0]) {
        UTILS.httpUtil.dataSuccess(_req, _res, "success", weather[0])
        return;
    }
}

async function getWeatherFromLatLonHandler(_req, _res) {
    var promise = await UTILS.httpsUtil.httpReqPromise({
        "host": "api.worldweatheronline.com",
        "path": "/premium/v1/marine.ashx?key=b9dacb23fd39441c90970816191507&q=" + _req.get.latitude + "," + _req.get.longitude + "&lang=fr&format=json&tp=1&tide=yes",
        "method": "GET"
    });
    //_res.setHeader("Content-Type", "application/json");
    UTILS.httpUtil.dataSuccess(_req, _res, "success", promise);
    return;
}

async function getWeatherFromWeatherLinkVOneHandler(_req, _res) {
    if (_req.get.entity_id) {
        let entity = await STORE.enititymgmt.getEntityById(_req.get.entity_id);

        console.log(entity);
        console.log("/v1/NoaaExt.json?user=" + entity.wlink_vone_user + "&pass=" + UTILS.Crypto.decryptText(entity.wlink_vone_pw, "AJtWbggDUidBESek3fIc") + "&apiToken=" + entity.wlink_vone_token)
        if (entity.weather_api == "wlv1") {
            var promise = await UTILS.httpsUtil.httpReqPromise({
                "host": "api.weatherlink.com",
                "path": "/v1/NoaaExt.json?user=" + entity.wlink_vone_user + "&pass=" + UTILS.Crypto.decryptText(entity.wlink_vone_pw, "AJtWbggDUidBESek3fIc") + "&apiToken=" + entity.wlink_vone_token,
                "method": "GET"
            });
        }
        //_res.setHeader("Content-Type", "application/json");
        UTILS.httpUtil.dataSuccess(_req, _res, "success", promise);
        return;
    }
    res.end();
    return;
}
async function getWeatherFromWeatherLinkVTwoHandler(_req, _res) {
    if (_req.get.entity_id) {
        let entity = await STORE.enititymgmt.getEntityById(_req.get.entity_id);

        console.log(entity);
        console.log("/v1/NoaaExt.json?user=" + entity.wlink_vone_user + "&pass=" + UTILS.Crypto.decryptText(entity.wlink_vone_pw, "AJtWbggDUidBESek3fIc") + "&apiToken=" + entity.wlink_vone_token)
        if (entity.weather_api == "wlv1") {
            var promise = await UTILS.httpsUtil.httpReqPromise({
                "host": "api.weatherlink.com",
                "path": "/v1/NoaaExt.json?user=" + entity.wlink_vone_user + "&pass=" + UTILS.Crypto.decryptText(entity.wlink_vone_pw, "AJtWbggDUidBESek3fIc") + "&apiToken=" + entity.wlink_vone_token,
                "method": "GET"
            });
        }
        //_res.setHeader("Content-Type", "application/json");
        UTILS.httpUtil.dataSuccess(_req, _res, "success", promise);
        return;
    }
    res.end();
    return;
}
async function getWeatherFromWeatherLinkVTwoHandler(_req, _res) {
    console.log('test');
    if (_req.get.entity_id) {
        let entity = await STORE.enititymgmt.getEntityById(_req.get.entity_id);
        console.log(entity.wlink_vtwo_secretkey);
        console.log("lol");
        let stations;

        var date = Math.floor(Date.now() / 1000);
        let message = "api-key" + entity.wlink_vtwo_apikey + "t" + date;
        let secretkey = entity.wlink_vtwo_secretkey;
        let api_signature = crypto.createHmac('SHA256', secretkey).update(message).digest('hex')//UTILS.Crypto.createSHA256(message + secretkey);
        console.log(api_signature);
        console.log("api-key" + entity.wlink_vtwo_apikey + "t" + date);
        if (entity.weather_api == "wlv2") {
            var promise = await UTILS.httpsUtil.httpReqPromise({
                "host": "api.weatherlink.com",
                "path": "/v2/stations?api-key=" + entity.wlink_vtwo_apikey + "&t=" + date + "&api-signature=" + api_signature,
                "method": "GET"
            });
            stations = JSON.parse(promise.data);
            stations = stations.stations;
        }
        console.log(stations);

        let weather;
        date = Math.floor(Date.now() / 1000);
        message = "api-key" + entity.wlink_vtwo_apikey + "station-id" + stations[0].station_id + "t" + date;
        api_signature = crypto.createHmac('SHA256', secretkey).update(message).digest('hex')//UTILS.Crypto.createSHA256(message + secretkey);
        console.log(api_signature);
        console.log("api-key" + entity.wlink_vtwo_apikey + "t" + date);
        if (entity.weather_api == "wlv2") {
            var promise = await UTILS.httpsUtil.httpReqPromise({
                "host": "api.weatherlink.com",
                "path": "/v2/current/"  + stations[0].station_id +  "?api-key=" + entity.wlink_vtwo_apikey + "&t=" + date + "&api-signature=" + api_signature,
                "method": "GET"
            });
            weather = JSON.parse(promise.data);
            
        }
        console.log(promise);
        //_res.setHeader("Content-Type", "application/json");
        UTILS.httpUtil.dataSuccess(_req, _res, "success", weather);
        return;
    }
    res.end();
    return;
}
exports.handler = async (req, res) => {
    var _weather = await getWeather();
    res.end(JSON.stringify(_weather));
    return;
}

exports.router =
    [
        {
            route: "/api/weather/:harbour_id",
            handler: getWeatherFromHarbourHandler,
            method: "GET",
        },
        {
            route: "/api/weather/coord/",
            handler: getWeatherFromLatLonHandler,
            method: "GET",
        },
        {
            route: "/api/weather/wlink/vone",
            handler: getWeatherFromWeatherLinkVOneHandler,
            method: "get"
        },
        {
            route: "/api/weather/wlink/vtwo",
            handler: getWeatherFromWeatherLinkVTwoHandler,
            method: "get"
        }

    ];

exports.plugin =
{
    title: "Gestion de la météo",
    desc: "",
    handler: async (req, res) => {
        var admin = await getAdminById(req.userCookie.data.id);
        var _type = admin.data.type;
        var _role = admin.role;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;

        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.weather_id) {
                var currentWeather = await getWeatherById(req.get.weather_id);
                if (currentWeather.cloudinary_img_public_id) {
                    await STORE.cloudinary.deleteFile(currentWeather.cloudinary_img_public_id);
                }
                await delWeather(req.get.weather_id);
            }
            else if (req.get.weather_id) {
                await getWeatherById(req.get.weather_id);
            }
        }
        if (req.method == "POST") {
            if (req.post.id) {
                if (verifyPostReq(req, res)) {
                    if (typeof (await updateWeather(req.post)) != "string") {
                        UTILS.httpUtil.dataSuccess(req, res, "Weather mis à jour", "1.0");
                        return;
                    }
                }
            }
            else {
                if (typeof req.body == "object" && req.multipart) {
                    var _FD = req.post;

                    _FD.date = Date.now();

                    //img gesture
                    if (_FD.img) {
                        var upload = await STORE.cloudinary.uploadFile(_FD.img, req.field["img"].filename);
                        console.log(upload);
                        _FD.img = upload.secure_url;
                        _FD.cloudinary_img_public_id = upload.public_id;
                    }
                    var weather = await createWeather(_FD);
                    console.log(weather);
                    if (weather.id) {
                        UTILS.httpUtil.dataSuccess(req, res, "Success", "Météo publié", "1.0");
                        return;
                    } else {
                        UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la publication de la météo", "1.0");
                        return;
                    }
                }
            }
        }
        else {
            var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            var _weatherHtml = fs.readFileSync(path.join(__dirname, "weather.html")).toString();
            var _weathers;

            function reformatDate(_date) {
                var split = _date.split(" ");
                var reformat = split[0].split("-")
                reformat = reformat[2] + reformat[1] + reformat[0] + split[1];
                console.log(reformat);
                return reformat;
            }

            if (_type == 'harbour_manager')
                _weathers = await getWeatherByHarbourId(_harbour_id);
            else
                _weathers = await getWeather();

            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    _weathers = _weathers.concat(await getWeatherByHarbourId(_harbour_id[i]));
                }
            }
            else if (_role == "admin")
                _weathers = await getWeather();

            var _weatherGen = "";
            for (var i = 0; i < _weathers.length; i++) {
                var date = new Date(_weathers[i].date);
                var dateFormated = [("0" + (date.getDate())).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [("0" + (date.getHours())).slice(-2), ("0" + (date.getMinutes())).slice(-2), ("0" + (date.getSeconds())).slice(-2)].join(':');
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_weathers[i].harbour_id);

                _weatherGen += _weatherHtml.replace(/__ID__/g, _weathers[i].id)
                    .replace(/__FORMID__/g, _weathers[i].id.replace(/\./g, "_"))
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__HARBOUR_ID__/g, currentHarbour.id)
                    .replace(/__CATEGORY__/g, _weathers[i].category)
                    .replace(/__BULLETIN__/g, _weathers[i].img)
                    .replace(/__TITLE__/g, _weathers[i].title)
                    .replace(/__DATE__/g, dateFormated)
                    .replace(/__DATETIMEORDER__/g, _weathers[i].date)
            }
            _indexHtml = _indexHtml.replace("__WEATHER__", _weatherGen).replace(/undefined/g, '');


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

            res.setHeader("Content-Type", "text/html");
            res.end(_indexHtml);
            return;
        }
    }
}