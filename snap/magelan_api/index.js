const axios = require('axios').default;

exports.setup = {
	on: true,
  title: 'Magelan Api External',
  description: 'proxy to interface magelan eresa api',
  version: '1.0.0',
  api: true,
}

const loginHandler = async (req, res) => {
	console.clear();
	console.log('====loginHandler====');
	try {
		const login = req.get.login;
		const pass = req.get.password;
		const keyUser = OPTION.MAGELAN_USER_KEY;

		const url = `https://appli.magelan-eresa.com/appliLogin/${login}/${pass}/${keyUser}`;
		console.log('url', url);

		const response = await axios.get(url);
		console.log('response', response.data);
		if (response.data.CodeErr === '2') {
			throw new Error(response.data?.MessageErr || 'Unknown Internal Error');
		}
		const resData = {
			login: response.data.res_login,
			token: response.data.res_token,
		}
		res.writeHead(response.status, response.statusText, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			data: resData,
		}));
	} catch (error) {
		console.error(error)
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

exports.router = [
	{
    on: true,
    route: "/api/eresa/login",
    method: "GET",
    handler: loginHandler
  },
];

exports.handler = async(req, res) => { 
 res.end('Hello Snap!'); 
}