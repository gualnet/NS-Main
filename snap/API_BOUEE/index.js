// API_BOUEE
const axios = require('axios').default;
const TYPES = require('../../types');
const ENUM = require('../lib-js/enums');
const myLogger = require('../lib-js/myLogger');

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
	const lastPeriodAmount = 15;
	const lastPeriodUnit = 'm'; // h for hours / m for minutes /..
	const devidStr = (devid === '') ? '' : `devid='${devid}' AND`;
	const influxOpt = {
		dbName: 'presence_jadespot_ts_new',
		query: `SELECT * FROM presence WHERE ${devidStr} time >= now() - ${lastPeriodAmount}${lastPeriodUnit} ${limitStr}`,
	}
	const url = `http://buoys.nauticspot.io:8086/query?pretty=false/&db=${influxOpt.dbName}&q=${influxOpt.query}`;
	console.log('url', url);
	const headers = {}
	const resp = await axios({
		url: url,
		headers: { 'Authorization': 'Token admin:vanille' }
	});
	return(resp.data.results);
};


const getBoueePresence = async (req, res) => {
	try {
		const devid = req.get.devid || '';
		const limit = req.get.limit || 0;
		const results = await fetchPresencesTest(devid, limit);
		const serie = results[0].series[0];

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

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			results: obj,
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


exports.router = [
	{
		on: true,
		route: '/api/ext/bouee/presence',
		handler: getBoueePresence,
		methode: 'GET'
	}
];