// API_BOUEE
const axios = require('axios').default;
const TYPES = require('../../types');
const ENUM = require('../lib-js/enums');
const myLogger = require('../lib-js/myLogger');
const erpUsersServices = require('../erpUsers/services');

const CAPTEUR_NUMBER = {
	'b000140': 41,'b000151': 42, 'b000141': 44,'b000139': 45,
	'b000134': 46,'b000149': 47, 'b000135': 65, 'b000148': 68,
	'b000138': 69, 'b000142': 73, 'b000132': 75, 'b000133': 76,
	'b000144': 77, 'b000137': 78, 'b000136': 79,
};


exports.setup = {
	on: true,
	title: 'API BOUEE',
	description: 'Get data from bouee influxdb',
	version: '1.0.0',
	api: true,
}

exports.handler = async (req, res) => {
	res.end('Hello Snap!');
}


const fetchPresencesTest = async (devid) => {
	const limit = 1;
	const limitStr = (limit > 0) ? `LIMIT ${limit}` : '';
	const lastPeriodAmount = 48;
	const lastPeriodUnit = 'h'; // h for hours / m for minutes /..
	const devidStr = (devid === '') ? '' : `devid='${devid}' AND`;
	// // DATA SOURCE 1
	const influxOpt1 = {
		dbName: 'presence_jadespot_ts_new',
		query: `SELECT * FROM presence WHERE ${devidStr} time >= now() - ${lastPeriodAmount}${lastPeriodUnit} ${limitStr}`,
	}
	const url = `http://buoys.nauticspot.io:8086/query?pretty=false/&db=${influxOpt1.dbName}&q=${influxOpt1.query}`;
	const objectSource1 = await fetchDataSource(url, devid);

	// DATA SOURCE 2
	const influxOpt2 = {
		dbName: 'statsbouee4',
		query: `SELECT * FROM payload WHERE ${devidStr} time >= now() - ${lastPeriodAmount}${lastPeriodUnit} ${limitStr}`,
	}
	const url2 = `http://buoys.nauticspot.io:8086/query?pretty=false/&db=${influxOpt2.dbName}&q=${influxOpt2.query}`;
	const objectSource2 = await fetchDataSource(url2, devid);

	const finalPresence = presenceDecisionTable(objectSource1, objectSource2);
	const presenceObj = {
		devid,
		time: objectSource1[devid].time,
		code: objectSource1[devid].CN,
		presence: finalPresence,
	}
	return(presenceObj);
};

const fetchDataSource = async (url, devid) => {
	const resp = await axios({
		url: url,
		headers: { 'Authorization': 'Token admin:vanille' }
	});
	const objectSource = normailseDataSource(devid, resp.data.results);
	return(objectSource);
};

const presenceDecisionTable = (obj1, obj2) => {
	const total = obj1.presence_new + obj1.presence_new2 + obj2.presence_w_delai;
	const presence = (total / 3) > 1 ? true : false;
	return(presence);
}

const normailseDataSource = (devid, rawResults) => {
	const serie = rawResults[0]?.series?.[0];
	if (!serie) {
		throw new Error('Internal server error', { cause: { httpCode: 500 }});
	}
	const obj = {};
	// create an object with the columns as key and their value
	// EX: {b000130: {time: '2022-09-01T23:55:25.73701261Z',devid: 'b000130',pres_x10_loose: 10,pres_x10_new: 10,pres_x10_new2: 10,presence_combi: 1,presence_loose: 1,presence_new: 1,presence_new2: 1}}
	serie.values.map(valuesArr => {
		const temp = { CN: CAPTEUR_NUMBER[devid] };
		valuesArr.map((value, index) => {
			temp[serie.columns[index]] = value;
			if (serie.columns[index] === 'devid') {
				obj[value] = temp;
			}
		})
	})
	return(obj);
};

const verifyAccess = async (apiAuthToken, harbourId, devid) => {
	// validate api token
	const [erpUsers] = await erpUsersServices.getErpUserWhere({ apiToken: apiAuthToken });
	if (!erpUsers) {
		throw new Error('Invalide API Token', { cause: { httpCode: 401 }});
	}
	// verify if ERP can access to the requested port absences
	if (!harbourId || !erpUsers.harbourIds.includes(harbourId)) {
		throw new Error('Invalid \'harbour-id\' parameter.', { cause: { httpCode: 401 }});
	}
	if (harbourId !== '4e.mx_85wK') { // Allowed only for cavalaire
		throw new Error('Access Denied', { cause: { httpCode: 403 }});
	}
	if (CAPTEUR_NUMBER[devid] === undefined) {
		throw new Error('Invalid \'devid\' parameter.', { cause: { httpCode: 401 }});
	}
};

const getBoueePresence = async (req, res) => {
	try {
		const apiAuthToken = req.headers['x-auth-token'];
		const harbourId = req.get["harbour-id"];
		const devid = req.get.devid || '';

		await verifyAccess(apiAuthToken, harbourId, devid); // will throw an error if something is wrong

		const limit = req.get.limit || 0;
		const presence = await fetchPresencesTest(devid, limit);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			results: presence,
		}));
	} catch (error) {
		let errorHttpCode;
		if (error.response) {
			console.error('[AXIOS ERROR]', error?.response?.data?.error);
			myLogger.logError(error.response?.data?.error, { module: 'api_bouee' })
		} else {
			console.error('[ERROR]', error);
			myLogger.logError(error, { module: 'api_bouee' })
		}
		errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

let portsInfo = {
	"rgmlITNzoi": { // Marigot
		"prefix": "b000",
		"captors": ["b000160", "b000161", "b000162", "b000163", "b000164", "b000165", "b000166", "b000167", "b000168", "b000169", "b000170", "b000171", "b000172", "b000173", "b000174", "b000175", "b000176", "b000177", "b000178", "b000179", "b000180", "b000181", "b000182", "b000183", "b000184", "b000185", "b000186", "b000187", "b000188", "b000189", "b000190", "b000191", "b000192", "b000193", "b000194", "b000195", "b000196", "b000197", "b000198", "b000199", "b000200", "b000201", "b000202", "b000203", "b000204", "b000205", "b000206", "b000207", "b000208", "b000209", "b000210", "b000211", "b000212", "b000213", "b000214", "b000215", "b000216", "b000217", "b000218", "b000219", "b000220", "b000221", "b000222", "b000223", "b000224", "b000225", "b000226", "b000227", "b000228", "b000229", "b000230", "b000231", "b000232", "b000233", "b000234", "b000235", "b000236", "b000237", "b000238", "b000239", "b000240", "b000241", "b000242", "b000243", "b000244", "b000245", "b000246", "b000247", "b000248", "b000249", "b000250", "b000251", "b000252", "b000253", "b000254", "b000255", "b000256", "b000257", "b000258", "b000259"]
	}
}

const getByPort = async (req, res) => {
	try {
		const portId = req.param.port_id;
		const portInfo = portsInfo[portId];

		if (!portInfo) {
			throw new Error('Invalid port id', { cause: { httpCode: 401 }});
		}
		/**@type {string[]}*/
		const { captors } = portsInfo[portId];
		const promises = [];
		const timeOffset = "140h";
		const dbName = 'presence_jadespot_ts_new';
		const baseUrl = `http://buoys.nauticspot.io:8086/query?pretty=false/&db=${dbName}`;
		captors.map(devid => {
			const queryUrl = `${baseUrl}&q=SELECT * FROM presence WHERE devid='${devid}' and time >= now() - ${timeOffset}`;

			promises.push(fetchDataSource(queryUrl, devid));
		});
		const results = await Promise.all(promises);
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			results,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'api_bouee' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

const addPort = async (req, res) => {
	const portId = req.body.id;
	const prefix = req.body.prefix;
	const from = req.body.from;
	const to = req.body.to;

	portsInfo[portId] = {
		prefix,
		from,
		to,
	}
	res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({
		success: true,
		results: portsInfo,
	}));
}

const addCaptors = async (req, res) => {
	try {
		const captors = req.body.captors;
		const portId = req.body.port_id;

		if (!portsInfo[portId]) {
			throw new Error('Invalid port id', { cause: { httpCode: 401 }});
		}
		for (let c in captors) {
			if (portsInfo[portId].captors.includes(captors[c])) {
				continue;
			}
			portsInfo[portId].captors.push(captors[c]);
		}
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			results: portsInfo[portId],
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'api_bouee' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

const deleteCaptors = async (req, res) => {
	try {
		const captors = req.body.captors;
		const portId = req.body.port_id;

		if (!portsInfo[portId]) {
			throw new Error('Port not found', { cause: { httpCode: 400 }});
		}
		for (let c in captors) {
			if (!portsInfo[portId].captors.includes(captors[c])) {
				continue;
			}
			portsInfo[portId].captors.splice(portsInfo[portId].captors.indexOf(captors[c]), 1);
		}
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			results: portsInfo[portId],
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'api_bouee' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

exports.router = [
	{
		on: true,
		route: '/api-erp/bouee/presence',
		handler: getBoueePresence,
		methode: 'GET'
	},
	{
		on: true,
		route: '/api-erp/bouee/ports/captors',
		handler: addCaptors,
		methode: "POST"
	},
	{
		on: true,
		route: '/api-erp/bouee/ports/captors',
		handler: deleteCaptors,
		methode: "DELETE"
	},
	{
		on: true,
		route: '/api-erp/bouee/ports/:port_id',
		handler: getByPort,
		methode: 'GET'
	},
	{
		on: true,
		route: '/api-erp/bouee/ports',
		handler: addPort,
		methode: "POST"
	},
];