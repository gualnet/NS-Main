const axios = require('axios').default;

exports.setup = {
	on: true,
  title: 'Magelan eResa Api External',
  description: 'proxy to interface magelan eresa api',
  version: '1.0.0',
  api: true,
}

// ********
// SERVICES
// ********

/**
 * 
 * @returns Promise
 */
const getEResaMarinaList = async () => {
	const keyUser = OPTION.MAGELAN_USER_KEY;
	const url = `https://appli.magelan-eresa.com/appliGetLstMarina/${keyUser}`;
	return axios.get(url);
};

const logAxiosError = (error) => {
	if (error.response) {
		// The request was made and the server responded with a status code
		// that falls out of the range of 2xx
		console.error('error.response.data', error.response.data);
		console.error('error.response.status', error.response.status);
		console.error('error.response.headers', error.response.headers);
	} else if (error.request) {
		// The request was made but no response was received
		// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
		// http.ClientRequest in node.js
		console.error('error.request', error.request);
	} else {
		// Something happened in setting up the request that triggered an Error
		console.error('error.message', error.message);
	}
	console.error('error.config', error.config);
}


// ********
// HANDLERS
// ********

const loginHandler = async (req, res) => {
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

const getPriceResaHandler =  async (req, res) => {
	console.log('====getPriceResaHandler====');

	// ! pas de prise en compte du champs commentaire par eResa
	try {
		console.log('req.get', req.get);

		// 1 pData1 String Date début séjour YYYYMMDD
		// 2 pData2 String Date fin séjour YYYYMMDD
		// 3 pData3 String Coque : Monocoque / Multicoque
		// 4 pData4 String longueur
		// 5 pData5 String largeur
		// 6 pData6 String Id du port
		// 7 pData7 String Type contrat : Passage
		// 8 pLogin String Email login plaisancier
		// 9 pToken String Jeton compte plaisancier
		// 10 key_user String Web service key ID

		const keyUser = OPTION.MAGELAN_USER_KEY;
		const { startDate, endDate, type, longueur,
			largeur, harbourId, login, token } = req.get;

		const contract = 'Passage';
		const boatType = (type === 'voilier') ? 'Multicoque' : 'Monocoque';

		const marinaList = await getEResaMarinaList()
		console.log('marinaList', marinaList.data)

		const startDateFormated = startDate.split('-').join('');
		const endDateFormated = endDate.split('-').join('');

		const url = `https://appli.magelan-eresa.com/appliGetPriceResa/${startDateFormated}/${endDateFormated}/${boatType}/${longueur}/${largeur}/${harbourId}/${contract}/${login}/${token}/${keyUser}`;
		console.log('url', url);

		const response = await axios.get(url);
		console.log('response', response.data);
		if (response.data.CodeErr === '2') {
			throw new Error(response.data?.MessageErr || 'Unknown Internal Error');
		}
		const resData = {
			login: response.data.res_login,
			token: response.data.res_token,
			resaList: response.data.List,
			arrhes: response.data.arrhes,
			total: response.data.total,
		}

		res.writeHead(response.status, response.statusText, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			data: resData,
		}));
	} catch (error) {
		logAxiosError(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

// const FAKE_DATA_1 = {
//   res_login: 'contact@nauticspot.fr',
//   res_token: '',
//   List: {
// 		'328418': {
// 			resa_id: '328418',
// 			resa_numero: 'R002220810235286',
// 			resa_date_debut: '20231204',
// 			resa_date_fin: '20231206',
// 			resa_bateau_nom: 'TEST',
// 			resa_bateau_immat: 'NO',
// 			resa_bateau_pavillon: 'France',
// 			resa_bateau_longueur: '7.60',
// 			resa_bateau_largeur: '2.20',
// 			resa_note: '',
// 			resa_arrhes: '0.00',
// 			resa_port_id: '2',
// 			resa_port_nom: 'Port Charles Ornano',
// 			resa_port_ville: 'Ajaccio',
// 			resa_status: 'Annulée',
// 			resa_status_couleur: '#999999'
// 		},
// 		'328419': {
// 			resa_id: '328419',
// 			resa_numero: 'R002220810235286',
// 			resa_date_debut: '20231204',
// 			resa_date_fin: '20231206',
// 			resa_bateau_nom: 'TEST',
// 			resa_bateau_immat: 'NO',
// 			resa_bateau_pavillon: 'France',
// 			resa_bateau_longueur: '7.60',
// 			resa_bateau_largeur: '2.20',
// 			resa_note: '',
// 			resa_arrhes: '0.00',
// 			resa_port_id: '2',
// 			resa_port_nom: 'Port Charles Ornano',
// 			resa_port_ville: 'Ajaccio',
// 			resa_status: 'Demande à traiter',
// 			resa_status_couleur: '#808000'
// 		}
// 	},
//   CodeErr: '1',
//   MessageErr: ''
// }

const listUserReservations = async (req, res) => {
	console.log('listUserReservations');

	try {
		const { login, token } = req.get;
		const keyUser = OPTION.MAGELAN_USER_KEY;

		const url = `https://appli.magelan-eresa.com/appliGetLstResa/${login}/${token}/${keyUser}`;
		console.log('url', url);
		const response = await axios.get(url);
		console.log('response', response.data);
		if (response.data.CodeErr === '2') {
			throw new Error(response.data?.MessageErr || 'Unknown Internal Error');
		}

		res.writeHead(response.status, response.statusText, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			data: response.data.List,
		}));
	} catch (error) {
		logAxiosError(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const listUserBoats = async (req, res) => {
	console.log('listUserBoats');

	try {
		const { login, token } = req.get;
		const keyUser = OPTION.MAGELAN_USER_KEY;

		const url = `https://appli.magelan-eresa.com/appliGetLstBoat/${login}/${token}/${keyUser}`;
		console.log('url', url);
		const response = await axios.get(url);
		console.log('response', response.data);
		if (response.data.CodeErr === '2') {
			throw new Error(response.data?.MessageErr || 'Unknown Internal Error');
		}

		res.writeHead(response.status, response.statusText, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			data: response.data.List,
		}));
	} catch (error) {
		logAxiosError(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const addReservation = async (req, res) => {
	console.log('addReservation');
	try {
		const { boatId, portId, startDate, endDate,
			comments, login, token } = req.get;
		const keyUser = OPTION.MAGELAN_USER_KEY;
		const url = `https://appli.magelan-eresa.com/appliAddResa/${boatId}/${portId}/${startDate}/${endDate}/${comments}/${login}/${token}/${keyUser}`;
		console.log('url', url);

		const response = await axios.get(url);
		console.log('response', response.data);
		if (response.data.CodeErr === '2') {
			throw new Error(response.data?.MessageErr || 'Unknown Internal Error');
		}

		res.writeHead(response.status, response.statusText, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			data: response.data,
		}));
	} catch (error) {
		logAxiosError(error);
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
    handler: loginHandler,
  },
	{
    on: true,
    route: "/api/eresa/price",
    method: "GET",
    handler: getPriceResaHandler,
  },
	{
    on: true,
    route: "/api/eresa/list-reservations",
    method: "GET",
    handler: listUserReservations,
  },
	{
    on: true,
    route: "/api/eresa/list-boats",
    method: "GET",
    handler: listUserBoats,
  },
	{
    on: true,
    route: "/api/eresa/add-reservation",
    method: "GET",
    handler: addReservation,
  },
];

exports.handler = async(req, res) => { 
 res.end('Hello Snap!'); 
}
