async function getCol(_table, _col) {
    return new Promise(resolve => {
        STORE.db[_table].Find(_col, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function create(_table, _col, _obj) {
    return new Promise(resolve => {
        STORE.db[_table].Create(_col, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function update(_table, _col, _obj) {
    return new Promise(resolve => {
        STORE.db[_table].Update(_col, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getById(_table, _col, _id) {
    return new Promise(resolve => {
        STORE.db[_table].FindById(_col, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getColArray(_table) {
    var p = STORE.db[_table].link.dataPath;
    console.log(p);
    return new Promise(resolve => {
        fs.readdir(p, function (err, files) {
            if (err) {
                throw err;
            }
            console.log(files);
            resolve(files);
        });
    });
}

exports.plugin =
{
    title: "import/export",
    desc: "",
    handler: async (req, res) => {
        if (req.method == "POST") {
            if(req.post.db) {
                let jsn = {};
                console.log(req.post.db)
                let tables = Object.keys(req.post.db);
                console.log(tables);
                for(var t = 0; t < tables.length; t++) {
                    jsn[tables[t]] = {};
                    files = Object.keys(req.post.db[tables[t]]);
                    for(var i = 0; i < files.length; i++) {
                        jsn[tables[t]][files[i]] = [];
                        for (var o = 0; o < req.post.db[tables[t]][[files[i]]].length; o++) {
                            let obj = req.post.db[tables[t]][files[i]][o];
                            currentObj = await getById(tables[t], files[i], obj.id);
                            console.log(jsn[tables[t]][files[i]])
                            if (currentObj.id) {
                                jsn[tables[t]][files[i]].push(await update(tables[t], files[i], obj));
                            } else {
                                jsn[tables[t]][files[i]].push(await create(tables[t], files[i], obj));
                            }
                        }
                    }
                }

                UTILS.httpUtil.dataSuccess(req, res, "Entité mis à jour",jsn, "1.0");
                return;
            }
        }
        else if (req.method == "GET") {
            if(req.get.db) {
                let jsn = {};
                console.log(STORE.db.linkdbfp.link.dataPath);
                
                let files;
                let tables = Object.keys(STORE.db);
                console.log(tables);
                for(var t = 0; t < tables.length; t++) {
                    jsn[tables[t]] = {};
                    files = await getColArray(tables[t]);
                    for(var i = 0; i < files.length; i++) {
                        jsn[tables[t]][files[i]] = await getCol(tables[t],files[i]);
                    }
                }
                UTILS.httpUtil.dataSuccess(req, res, "Entité mis à jour",jsn, "1.0");
                return;
            }
            else {
                var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
                res.setHeader("Content-Type", "text/html");
                res.end(_indexHtml);
                return;
            }
        } 
    }
}