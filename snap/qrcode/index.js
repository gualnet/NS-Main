var _index = fs.readFileSync(path.join(__dirname, "view", "index.html")).toString();
var _qr = fs.readFileSync(path.join(__dirname, "view", "qr.html")).toString();
var _landing = fs.readFileSync(path.join(__dirname, "view", "landing.html")).toString();

var QRCode = require('qrcode')
var _qrCol = "qrcode";

var _qrURL = "https://prod.nauticspot.io";
var _qrROUTE = "/qrcode/";

exports.setup =
{
	on: true,
	title: 'LibraryDownloader',
	description: "A plugin to manage the QRCODEs",
	version: '1.0.0',
	// V.1.0.0 - change link to PWA
}

async function createImage(_target) {
	return new Promise(resolve => {
		QRCode.toDataURL(_target, function (err, url) {
			resolve(url);
		});
	});
}

async function delQRCODE(_id) {
	if (!_id) {
		resolve();
		return;
	}
	var _search =
	{
		id: _id,
	};

	return new Promise(resolve => {
		STORE.db.linkdb.Delete(_qrCol, _search, function (_err, _data) {
			resolve(_data);
		});
	});
}


async function getQRCODE(_id) {
	var _search = {};
	if (_id) {
		_search.id = _id;
	}
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_qrCol, _search, null, function (_err, _data) {
			if (_data) {
				resolve(_data);
			}
			else {
				resolve(_err);
			}
		});
	});
}

async function saveQRCODE(_obj) {
	return new Promise(resolve => {
		_obj.updatedAt = Date.now();
		STORE.db.linkdb.Save(_qrCol, _obj, function (_err, _data) {
			if (_data) {
				resolve(_data);
			}
			else {
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
	handler: async (req, res) => {
		console.log('QRCODE HANDLER')
		if (req.get.target && req.get.mode && req.get.mode == "delete") {
			await delQRCODE(req.get.target);
		}
		if (req.method == "POST" && req.post && req.post.title && req.post.appLink) {
			const qrCodeObj = {
				title: req.post.title,
				appLink: req.post.appLink,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			}
			if (req.post.id) {
				qrCodeObj.id = req.post.id;
			}
			try {
				const result = await saveQRCODE(qrCodeObj);
			} catch (error) {
				console.error('[ERROR]', error);
			}
		}

		var _return = _index;
		var _list = "";
		var _data = await getQRCODE();
		for (var i = 0; i < _data.length; i++) {
			var _tmp = _qr;
			_tmp = _tmp.replace(/__ID__/g, _data[i].id);
			_tmp = _tmp.replace(/__TITLE__/g, _data[i].title);
			_tmp = _tmp.replace(/__APP_LINK__/g, _data[i].appLink || 'NOTHING');
			_tmp = _tmp.replace(/__IMG__/g, await createImage(_qrURL + _qrROUTE + _data[i].id));
			_tmp = _tmp.replace(/__URL__/g, _qrURL + _qrROUTE + _data[i].id);
			_list += _tmp;
		}

		res.setHeader("Content-Type", "text/html; charset=utf-8");
		res.end(_return.replace("__LIST__", _list));
	}
}

async function qrHandler(req, res) {
	var _result = await getQRCODE(req.param.id);
	if (_result && _result[0]) {
		res.setHeader("Content-Type", "text/html; charset=utf-8");
		res.end(_landing.replace("__TITLE__", _result[0].title).replace("__APPLE__", _result[0].apple).replace("__ANDROID__", _result[0].android));
	}
	else {
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

