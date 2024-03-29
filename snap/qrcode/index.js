const TYPES = require('../../types');
const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.ADMIN_MULTIPORTS,
	ROLES.AGENT_SUPERVISEUR,
	ROLES.AGENT_ADMINISTRATEUR,
	ROLES.AGENT_CAPITAINERIE,
];

var _index = fs.readFileSync(path.join(__dirname, "view", "index.html")).toString();
var _qr = fs.readFileSync(path.join(__dirname, "view", "qr.html")).toString();
var _landing = fs.readFileSync(path.join(__dirname, "view", "landing.html")).toString();

var QRCode = require('qrcode')
var _qrCol = "qrcode";
var _userCol = "user";

// v.1.0.0 -> change link from native app to pwa
// v.1.1.0 -> add role access rights
// v.1.2.0 -> change link from pwa to native app

exports.setup =
{
	on: true,
	title: 'qrcode',
	description: "A plugin to manage the QRCODEs",
	version: '1.2.0',
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

async function createImage(_target) {
	return new Promise((resolve, reject) => {
		QRCode.toDataURL(_target, function (err, url) {
			if (err) {
				reject(err);
			} else {
				resolve(url);
			}
		});
	});
}

async function delQRCODE(_id) {
	return new Promise((resolve, reject) => {
		if (!_id) {
			reject(new Error(`delQRCODE invalid param '_id' provided [${_id}]`));
		}
		const _search = { id: _id };
		STORE.db.linkdb.Delete(_qrCol, _search, function (err, _data) {
			if (err) {
				reject(err);
			} else {
				resolve(_data);
			}
		});
	});
}

async function getQRCODE(_id) {
	return new Promise((resolve, reject) => {
		const _search = {};
		if (_id) {
			_search.id = _id;
		}
		STORE.db.linkdb.Find(_qrCol, _search, null, function (_err, _data) {
			if (_data) {
				resolve(_data);
			} else {
				reject(_err);
			}
		});
	});
}

async function saveQRCODE(_obj) {
	return new Promise((resolve, reject) => {
		_obj.updatedAt = Date.now();
		STORE.db.linkdb.Save(_qrCol, _obj, function (_err, _data) {
			if (_data) {
				resolve(_data);
			} else {
				reject(_err);
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
		// Check access rights
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;
		/**@type {TYPES.T_SCHEMA['fortpress']} */
		const DB_FP = SCHEMA.fortpress;

		const findAdminResp = await DB_FP.user.find({ id: req.userCookie.data.id }, { raw: 1 });
		if (findAdminResp.error) {
			console.error(findAdminResp.error);
			res.writeHead(500);
			res.end('Internal Error');
			return;
		} else if (findAdminResp.data.length < 1) {
			console.error('No dashboard user found');
			res.writeHead(401);
			res.end('Accès non autorisé');
			return;
		}
		const admin = findAdminResp.data[0];

		if (!verifyRoleAccess(admin?.data?.roleBackOffice, AUTHORIZED_ROLES)) {
			res.writeHead(401);
			res.end('No access rights');
			return;
		}

		if (req.get.target && req.get.mode && req.get.mode == "delete") {
			await delQRCODE(req.get.target);
		}
		if (req.method == "POST" && req.post && req.post.title && req.post.appLink) {
			if (req.post.appLink[0] !== '/') {
				req.post.appLink = `/${req.post.appLink}`;
			}
			const qrCodeObj = {
				title: req.post.title,
				appLink: req.post.appLink,
				apple: req.post.apple,
				android: req.post.android,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			}
			if (req.post.id) {
				qrCodeObj.id = req.post.id;
			}
			try {
				const result = await saveQRCODE(qrCodeObj);
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({
					success: true,
					results: result
				}));
				return;
			} catch (error) {
				console.error('[ERROR]', error);
				res.writeHead(500, 'Failure', "Content-Type: application/json");
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({
					success: false,
					message: 'Unknown Internal Server Error',
				}));
				return;
			}
		}

		var _return = _index;
		var _list = "";
		var _data = await getQRCODE();
		for (var i = 0; i < _data.length; i++) {
			var _tmp = _qr;
			_tmp = _tmp.replace(/__ID__/g, _data[i].id);
			_tmp = _tmp.replace(/__TITLE__/g, _data[i].title);
			_tmp = _tmp.replace(/__APP_LINK__/g, _data[i]?.appLink || '-');
			_tmp = _tmp.replace(/__APPLE__/g, _data[i]?.apple || '-');
			_tmp = _tmp.replace(/__ANDROID__/g, _data[i]?.android || '-');
			_tmp = _tmp.replace(/__IMG__/g, await createImage(`${OPTION.HOST_BASE_URL}/${_qrCol}/${_data[i].id}`));
			_tmp = _tmp.replace(/__URL__/g, `${OPTION.HOST_BASE_URL}/${_qrCol}/${_data[i].id}`);
			_list += _tmp;
		}

		res.setHeader("Content-Type", "text/html; charset=utf-8");
		res.end(_return.replace("__LIST__", _list));
	}
}

/**
 * Handle old qrcode links and redirect to the pwa
 */
async function qrHandler(req, res) {
	/**@type {qrcode} */
	const _result = await getQRCODE(req.param.id);

	if (_result) {
		res.setHeader("Content-Type", "text/html; charset=utf-8");
		res.end(
			_landing
				.replace("__TITLE__", _result[0].title)
				.replaceAll("__APPLE__", _result[0]?.apple || '/')
				.replaceAll("__ANDROID__", _result[0]?.android || '/')
		);
	}
	else {
		UTILS.Redirect(res, "/");
	}
}

exports.router = [
	{
		route: "/qrcode/:id", // old route to download native app from a qrcode
		handler: qrHandler,
		method: "GET",
	},
];

