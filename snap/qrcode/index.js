var _index = fs.readFileSync(path.join(__dirname, "view", "index.html")).toString();
var _qr = fs.readFileSync(path.join(__dirname, "view", "qr.html")).toString();
var _landing = fs.readFileSync(path.join(__dirname, "view", "landing.html")).toString();

var QRCode = require('qrcode')
var _qrCol = "qrcode";

var _qrURL = "https://prod.nauticspot.io";
var _qrROUTE = "/qrcode/";

async function createImage(_target)
{
	return new Promise(resolve => 
	{
		QRCode.toDataURL(_target, function (err, url)
		{
		  resolve(url);
		});
	});
}

async function delQRCODE(_id)
{
	if(!_id)
	{
		resolve();
		return;
	}
	var _search =
	{
		id: _id,
	};

    return new Promise(resolve => 
	{
        STORE.db.linkdb.Delete(_qrCol, _search, function (_err, _data)
		{
            resolve(_data);
        });
    });
}


async function getQRCODE(_id)
{
	var _search = {};
	if(_id)
	{
		_search.id = _id;
	}
    return new Promise(resolve => 
	{
        STORE.db.linkdb.Find(_qrCol, _search, null, function (_err, _data)
		{
            if (_data)
			{
                resolve(_data);
			}
            else
			{
                resolve(_err);
			}
        });
    });
}

async function saveQRCODE(_obj)
{
    return new Promise(resolve => 
	{
        STORE.db.linkdb.Save(_qrCol, _obj, function (_err, _data)
		{
            if (_data)
			{
                resolve(_data);
			}
            else
			{
                resolve(_err);
			}
        });
    });
}

exports.plugin = 
{
	title: "QRCODE",
	desc: "Manage QRCODES",
	role: "admin",
	handler: async(req, res) =>
	{
		if(req.get.target && req.get.mode && req.get.mode == "delete")
		{
			await delQRCODE(req.get.target);
		}
		if(req.method == "POST" && req.post && req.post.title && req.post.android && req.post.apple)
		{
			var _save = 
			{
				title: req.post.title,
				apple: req.post.apple,
				android: req.post.android,
			};
			if(req.post.id)
			{
				_save.id = req.post.id;
			}
			await saveQRCODE(_save);
		}

		var _return = _index;
		var _list = "";
		var _data = await getQRCODE();
		for(var i = 0; i < _data.length; i++)
		{
			var _tmp = _qr;
			_tmp = _tmp.replace(/__ID__/g, _data[i].id);
			_tmp = _tmp.replace(/__TITLE__/g, _data[i].title);
			_tmp = _tmp.replace(/__APPLE__/g, _data[i].apple);
			_tmp = _tmp.replace(/__ANDROID__/g, _data[i].android);
			_tmp = _tmp.replace(/__IMG__/g, await createImage(_qrURL + _qrROUTE + _data[i].id));
			_tmp = _tmp.replace(/__URL__/g, _qrURL + _qrROUTE + _data[i].id);
			_list += _tmp;
		}
		
		res.setHeader("Content-Type", "text/html; charset=utf-8");
		res.end(_return.replace("__LIST__", _list));
	}
}

async function qrHandler(req, res)
{
	var _result = await getQRCODE(req.param.id);
	if(_result && _result[0])
	{
		res.setHeader("Content-Type", "text/html; charset=utf-8");
		res.end(_landing.replace("__TITLE__", _result[0].title).replace("__APPLE__", _result[0].apple).replace("__ANDROID__", _result[0].android));
	}
	else
	{
		UTILS.Redirect(res, "/");
	}
}

exports.router = 
[
	{
		route: _qrROUTE + ":id",
		handler: qrHandler,
		method: "GET",
	},
];

exports.setup =
{
	description: "A plugin to manage the QRCODEs",
}