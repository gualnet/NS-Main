const TYPES = require('../../types');
const axios = require('axios').default;

const mapInfluxOutputToObject = (influxSeries) => {
    console.log('influxSeries',influxSeries)
    const series = influxSeries[0];
	const obj = {};
	series.values.map(valuesArr => {
		obj[valuesArr[1]] = {
			time: valuesArr[0],
			buoy_num: valuesArr[1],
			devid: valuesArr[2],
			presence: valuesArr[3], // reference value -> presence_CRT2
		}
	});
	return(obj);
};

/**
 * 
 * @param {string} placeId 
 * @returns {string} captorNumber
 */
const getCaptorNumberFromPlaceId = async (placeId) => {
    /**@type {TYPES.T_place[]} */
    const places = await STORE.emplacementmgmt.getPlaces({ id: placeId });
    console.log('places',places)
    if (!places[0]) {
        throw new Error(`No place found for id: ${placeId}`, { cause: { httpCode: 400 }});
    }
    return(places[0].captorNumber);
}

const getInfluxDbDataByCaptorNumber = async (captorNumber) => {
    // * futur: captors.nauticspot.io
    const hostUrl = 'http://umarspot.nauticspot.io:8086';
    const database = 'ponton_pres'
    const query = `SELECT * FROM presence WHERE devid='${captorNumber}' ORDER BY DESC LIMIT 1`;
    const fullRequestUrl = `${hostUrl}/query?db=${database}&q=${query}`;
    const response = await axios({
        url: fullRequestUrl, 
        headers: { 'Authorization': 'Token admin:vanille' }
    });
    const series = response.data.results[0].series;
    const object = mapInfluxOutputToObject(series);
    return object;
};

/**
 * 
 * @param {string} placeId 
 * @returns {bool} presence_state
 */
const getPresenceStateByPlaceId = async (placeId) => {
    const captorNumber = await getCaptorNumberFromPlaceId(placeId);
    if (!captorNumber || captorNumber === '') {
        return(-1); // This spot is not equipped with a sensor
    }
    const data = await getInfluxDbDataByCaptorNumber(captorNumber);
    data[captorNumber].place_id = placeId;
    return(data);
}


// HANDLERS
const getPresenceStateByPlaceIdHandler = async (req, res) => {
    try {
        console.log('req.get', req.get);
        const placeId = req.get.place_id;
        if (!placeId) throw new Error('Place_id parameter is incorrect or missing.', { cause: { httpCode: 400 }});
        const presence = await getPresenceStateByPlaceId(placeId);
        res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			results: presence,
		}));
    } catch (error) {
        console.error('[ERROR]', error);
        const errorHttpCode = error.cause?.httpCode || 500;
        res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
    }
};

exports.handler = async (req, res) => {
    res.end('Hello Snap!');
};

exports.setup = {
    on: true,
    title: 'api presence connector',
    description: 'Get data from ponton influxdb',
    version: '1.0.0',
    api: true,
};

exports.router = [{
    on: true,
    route: '/api/places/presence',
    handler: getPresenceStateByPlaceIdHandler,
}];
