// API_BOUEE
const axios = require('axios').default;
const TYPES = require('../../types');
const ENUM = require('../lib-js/enums');
const myLogger = require('../lib-js/myLogger');
const erpUsersServices = require('../erpUsers/services');

const CAPTEUR_NUMBER = {
	
};

let portsInfo = {
	"ElzMVUL9DK": { // Cavalaire - Heraclea
		'b000140': 41,'b000151': 42, 'b000141': 44,'b000139': 45,
		'b000134': 46,'b000149': 47, 'b000135': 65, 'b000148': 68,
		'b000138': 69, 'b000142': 73, 'b000132': 75, 'b000133': 76,
		'b000144': 77, 'b000137': 78, 'b000136': 79,
	},
	"rgmlITNzoi": { // Marigot
		"b000160": 01, "b000161": 02, "b000162": 03, "b000163": 04, "b000235": 05, "b000165": 06, "b000166": 07, "b000167": 08, "b000168": 09, "b000169": 10,
		"b000170": 11, "b000171": 12, "b000172": 13, "b000173": 14, "b000174": 15, "b000175": 16, "b000176": 17, "b000177": 18, "b000178": 19, "b000179": 20,
		"b000180": 21, "b000181": 22, "b000182": 23, "b000183": 24, "b000184": 25, "b000185": 26, "b000186": 27, "b000187": 28, "b000188": 29, "b000189": 30,
		"b000190": 31, "b000191": 32, "b000192": 33, "b000193": 34, "b000194": 35, "b000195": 36, "b000196": 37, "b000197": 38, "b000198": 39, "b000199": 40,
		"b000200": 41, "b000201": 42, "b000202": 43, "b000203": 44, "b000204": 45, "b000205": 46, "b000206": 47, "b000207": 48, "b000208": 49, "b000209": 50,
		"b000210": 51, "b000211": 52, "b000212": 53, "b000213": 54, "b000214": 55, "b000215": 56, "b000216": 57, "b000217": 58, "b000218": 59, "b000219": 60,
		"b000220": 61, "b000221": 62, "b000222": 63, "b000223": 64, "b000224": 65, "b000225": 66, "b000226": 67, "b000227": 68, "b000228": 69, "b000229": 70,
		"b000230": 71, "b000231": 72, "b000232": 73, "b000233": 74, "b000234": 75,
		// SPARE
		// "b000164", "b000236", "b000237", "b000238", "b000239", "b000240", "b000241", "b000242", "b000243", "b000244", "b000245", "b000246", "b000247", "b000248", "b000249", "b000250", "b000251", "b000252", "b000253", "b000254", "b000255", "b000256", "b000257", "b000258", "b000259"
	},
}


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
	if (portsInfo[harbourId][devid] === undefined) {
		throw new Error('Invalid \'devid\' parameter.', { cause: { httpCode: 401 }});
	}
};



/**
 * 
 * @param {*} options // limit / timeFrame
 * @returns 
 */
const fetchPresenceFromBuoysServer = async (devid, options) => {
	const limit = options.limit;
	const limitStr = (limit > 0) ? `LIMIT ${limit}` : '';
	const timeFrame = options.timeFrame || '48h'; // h for hours / m for minutes /..
	const devidStr = (devid === '') ? '' : `devid='${devid}' AND`;
	// DATA SOURCE 1
	const influxOpt1 = {
		dbName: 'presence_jadespot_ts_new',
		query: `SELECT * FROM presence WHERE ${devidStr} time >= now() - ${timeFrame} ${limitStr}`,
	}
	const url = `http://buoys.nauticspot.io:8086/query?pretty=false/&db=${influxOpt1.dbName}&q=${influxOpt1.query}`;
	const results = await fetchDataSource(url, devid);
	const objectSource1 = influxResultsToObjectSingleOccurence(results);

	const presenceObj = {
		devid,
		time: objectSource1[devid].time,
		code: objectSource1[devid].CN,
		presence: objectSource1[devid].presence_TS,
	}
	return(presenceObj);
};

const fetchDataSource = async (url) => {
	const resp = await axios({
		url: url,
		headers: { 'Authorization': 'Token admin:vanille' }
	});
	return(resp.data.results);
};

/**
 * ! Not used anymore due to buoys server changes - wait for updates on new implementations
 * @param {*} devid 
 * @param {*} rawResults 
 * @returns 
 */
// const presenceDecisionTable = (obj1, obj2) => {
// 	const total = obj1.presence_new + obj1.presence_new2 + obj2.presence_w_delai;
// 	const presence = (total / 3) > 1 ? true : false;
// 	return(presence);
// }

const normalizeDataSource = (devid, rawResults) => {
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

// Take an influxdb query result object and transform it to an object containing captors data
// where object keys are bouoy devid (captor number0-=)
const influxResultsToObjectSingleOccurence = (influxRaw) => {
	const series = influxRaw[0].series[0];
	const obj = {};
	series.values.map(valuesArr => {
		obj[valuesArr[2]] = {
			time: valuesArr[0],
			buoy_num: valuesArr[1],
			devid: valuesArr[2],
			presence_TS: valuesArr[6],
		}
	});
	return(obj);
};

/**
 * Returns a list of data entries for each captors
 * @param {*} influxRaw 
 * @returns 
 */
const influxResultsToObjectMultipleOccurences = (influxRaw) => {
	const series = influxRaw[0].series[0];
	const obj = {};
	series.values.map(valuesArr => {
		if (obj[valuesArr[2]]) {
			obj[valuesArr[2]].push({
				time: valuesArr[0],
				buoy_num: valuesArr[1],
				devid: valuesArr[2],
				presence_TS: valuesArr[6],
			});
		} else {
			obj[valuesArr[2]] = [{
				time: valuesArr[0],
				buoy_num: valuesArr[1],
				devid: valuesArr[2],
				presence_TS: valuesArr[6],
			}]
		}
	});
	return(obj);
};

// async function getAdminById(_id) {
// 	return new Promise(resolve => {
// 			STORE.db.linkdbfp.FindById(_userCol, _id, null, function (_err, _data) {
// 					if (_data)
// 							resolve(_data);
// 					else
// 							resolve(_err);
// 			});
// 	});
// }

const fetchDataFromBuoysServer = async (options) => {
	const limit = options.limit;
	const limitStr = (limit > 0) ? `LIMIT ${limit}` : '';
	const timeFrame = options.timeFrame || '48h'; // h for hours / m for minutes /..
	const devid = options.devid;
	const devidStr = (devid === '') ? '' : `devid='${devid}' AND`;
	const harbourId = options.harbourId;
	const harbourIdStr = harbourId ? '' : `harbour-id='${harbourId}' AND`;
	// // DATA SOURCE 1
	const influxOpt1 = {
		dbName: 'presence_jadespot_ts_new',
		query: `SELECT * FROM presence WHERE ${devidStr}${harbourIdStr} time >= now() - ${timeFrame} ${limitStr}`,
	}
	const url = `http://buoys.nauticspot.io:8086/query?pretty=false/&db=${influxOpt1.dbName}&q=${influxOpt1.query}`;
	const respData = await fetchDataSource(url);
	return(respData);
};

const getLastKnownPresenceByBuoyHandler = async (req, res) => {
	try {
		const apiAuthToken = req.headers['x-auth-token'];
		if (apiAuthToken) {
			await verifyAccess(apiAuthToken, harbourId, devid); // will throw an error if something is wrong
		} else if (req.cookie.fortpress) {
			// TODO: find a way to do this
			// console.log('req.cookie', req.cookie);
		} else {
			throw new error('Access not authorized !');
		}

		const buoysRawData = await fetchDataFromBuoysServer({
			harbourId: req.get['harbour-id'],
			devid: req.get.devid,
			limit: req.get.limit,
			timeFrame: req.get['time-frame'],
		});
		const buoysData = influxResultsToObjectMultipleOccurences(buoysRawData)

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			results: buoysData,
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


const getPresenceByBuoyHandler = async (req, res) => {
	try {
		const apiAuthToken = req.headers['x-auth-token'];
		const devid = req.get.devid || '';
		const harbourId = req.get["harbour-id"];
		if (apiAuthToken) {
			await verifyAccess(apiAuthToken, harbourId, devid); // will throw an error if something is wrong
		} else if (req.cookie.fortpress) {
			// TODO: find a way to do this
			// console.log('req.cookie', req.cookie);
		} else {
			throw new Error('Access not authorized !');
		}

		// const limit = req.get.limit || 1;
		const presence = await fetchPresenceFromBuoysServer(devid, {
			limit: req.get.limits,
			timeFrame: req.get['time-frame'],
		});

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




const getPresenceByHarbourHandler = async (req, res) => {
	try {
		const harbourId = req.param.port_id;
		const harbourInfo = portsInfo[harbourId];

		if (!harbourInfo) {
			throw new Error('Invalid port id', { cause: { httpCode: 401 }});
		}
		const timeOffset = "7m";
		const dbName = 'presence_jadespot_ts_new';
		const baseUrl = `http://buoys.nauticspot.io:8086/query?pretty=false/&db=${dbName}`;
		// TODO: Add where port_id = xxx -
		const queryUrl = `${baseUrl}&q=SELECT * FROM presence WHERE time >= now() - ${timeOffset}`;
		const resp = await axios({
			url: queryUrl,
			method: 'GET',
			headers: { 'Authorization': 'Token admin:vanille' }
		});
		const results = resp.data.results;
		const buoysObj = influxResultsToObjectSingleOccurence(results);
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			results: buoysObj,
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
		route: '/api-erp/bouee/last-known-presence',
		handler: getLastKnownPresenceByBuoyHandler,
		methode: 'GET'
	},
	{
		on: true,
		route: '/api-erp/bouee/presence',
		handler: getPresenceByBuoyHandler,
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
		handler: getPresenceByHarbourHandler,
		methode: 'GET'
	},
	{
		on: true,
		route: '/api-erp/bouee/ports',
		handler: addPort,
		methode: "POST"
	},
];