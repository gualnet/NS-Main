const services = require('./services');

exports.plugin = {
	role: "admin",
	title: "ERP-USER",
	desc: "Manage erp user accounts",
	category: "administration",
}

exports.router = [
	{
		on: true,
		method: 'GET',
		route: '/api/next/erp-users',
		handler: getErpUserHandler,
	},
	{
		on: true,
		method: 'POST',
		route: '/api/next/erp-users',
		handler: createErpUserHandler,
	},
	{
		on: true,
		method: 'PUT',
		route: '/api/next/erp-users',
		handler: updateErpUserHandler,
	},
	{
		on: true,
		method: 'DELETE',
		route: '/api/next/erp-users',
		handler: deleteErpUserHandler,
	},
];

exports.handler = async (req, res) => {
	res.end('Nothing to see here.');
};


async function getErpUserHandler(req, res) {
	console.log('CALL getErpUserHandler');
	const searchOpt = { ...req.get };
	try {
		
		const erpUsers = await services.getErpUserWhere(searchOpt);
		res.end(JSON.stringify(erpUsers));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500);
		res.end(JSON.stringify({ message: 'Internal server error.'}))
	}
};

async function createErpUserHandler(req, res) {
	if (!req.body.name || typeof req.body.name !== 'string' || req.body.name === '') {
		res.writeHead(400);
		res.end(JSON.stringify({
			message: '\'name\' field can not be empty.'
		}));
		return;
	}

	const newToken = services.generateApiErpToken();
	const newUser = {
		name: req.body.name || undefined,
		harbourIds: req.body.harbourIds || [],
		apiToken: req.body.apiToken || newToken,
		role: 'ERP',
		created_at: Date.now(),
		updated_at: Date.now(),
	};

	try {
		const erpUsers = await services.createErpUser(newUser);
		res.end(JSON.stringify(erpUsers));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500);
		res.end(JSON.stringify({ message: 'Internal server error.'}))
	}
};

async function updateErpUserHandler(req, res) {
	const updateFields = { ...req.body };
	const whereFields = { ...req.get };

	if (!whereFields.id && !whereFields.name && !whereFields.apiToken) {
		res.writeHead(401);
		res.end(JSON.stringify({ message: 'Please specify at least one parameter [id, name, apiToken]' }));
		return;
	}

	try {
		const erpUsers = await services.updateErpUserWhere(updateFields, whereFields);
		res.end(JSON.stringify(erpUsers));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500);
		res.end(JSON.stringify({ message: 'Internal server error.'}))
	}
};

async function deleteErpUserHandler(req, res) {
	const whereFields = { ...req.get };
	if (!whereFields.id && !whereFields.name && !whereFields.apiToken) {
		res.writeHead(401);
		res.end(JSON.stringify({ message: 'Please specify at least one parameter [id, name, apiToken]' }));
		return;
	}

	try {
		const erpUsers = await services.deleteErpUserWhere(whereFields);
		res.end(JSON.stringify(erpUsers));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500);
		res.end(JSON.stringify({ message: 'Internal server error.'}))
	}
}