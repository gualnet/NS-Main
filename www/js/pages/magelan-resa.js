let G_boatList = []; // keep the fetched boat list
let G_selectedBoat; // keep the selected boat object id within G_boatList like G_boatList[G_selectedBoat] = boat object

window.addEventListener('load', () => {
	console.log('EVENT LOAD');

	const reservationBtnEl = document.querySelector('#reservationBtn');
	reservationBtnEl.addEventListener('click', reservationClickHandler);

	const harbourSelectEl = document.querySelector('#harbourSelect');
	harbourSelectEl.addEventListener('change', harbourSelectChangeHandler);

	const VoilierEl = document.querySelector('#boatTypeVoilierBtn');
	VoilierEl.addEventListener('click', boatTypeBtnClickHandler);
	const MonocoqueEl = document.querySelector('#boatTypeMonocoqueBtn');
	MonocoqueEl.addEventListener('click', boatTypeBtnClickHandler);

	const arrivalDateEl = document.querySelector('#input-date-start');
	arrivalDateEl.addEventListener('change', dateChangeHandler);
	const departureDateEl = document.querySelector('#input-date-end');
	departureDateEl.addEventListener('change', dateChangeHandler);

	const newResaBtnEl = document.querySelector('#newResaBtn');
	newResaBtnEl.addEventListener('click', formSelectorHandler)
	const listResaBtnEl = document.querySelector('#listResaBtn');
	listResaBtnEl.addEventListener('click', formSelectorHandler)

	const arriveeBtnEl = document.querySelector('#arriveeBtn');
	arriveeBtnEl.addEventListener('click', arriveeBtnClickHandler);	
	
	const boatEditBtnEl = document.querySelector('#boatEditBtn');
	boatEditBtnEl.addEventListener('click', boatEditOnClickHandler);

	const departBtnEl = document.querySelector('#departBtn');
	departBtnEl.addEventListener('click', departBtnClickHandler);

	displayBoatData();
	initJqueryElements();
});


// ========
// HANDLERS
// ========
/**
 * @param {PointerEvent} ev 
 */
const reservationClickHandler = async (ev) => {
	console.log('reservationClickHandler', ev);
	const actionBtnCtnEl = document.querySelector('.action-button-ctn');
	if (actionBtnCtnEl.classList.contains('disabled')) {
		console.log('NO OP')
		return;
	}

	const resaOptions = {};
	resaOptions.harbourId = getFormHarbourId();
	resaOptions.startDate = getFormArrivalDate();
	resaOptions.endDate = getFormDepartureDate();
	resaOptions.comments = getFormComments();
	resaOptions.login = localStorage['magelanLogin'];
	resaOptions.token = localStorage['magelanToken'];
	resaOptions.boatId = await getSelectedBoatId();
	
	requestAddReservation(resaOptions)
};

const harbourSelectChangeHandler = () => {
	const harbourSelect = document.querySelector('#harbourSelect');
	harbourSelect.classList.remove('error');
	updateTotalPrice();
};

/**
 * @param {PointerEvent} ev 
 */
const boatTypeBtnClickHandler = (ev) => {
	const target = ev.target;
	const VoilierEl = document.querySelector('#boatTypeVoilierBtn');
	const MonocoqueEl = document.querySelector('#boatTypeMonocoqueBtn');
	if (target.id === VoilierEl.id) {
		VoilierEl.classList.add('active');
		MonocoqueEl.classList.remove('active')
	} else {
		VoilierEl.classList.remove('active');
		MonocoqueEl.classList.add('active')
	}
	const type = target.innerText;
	updateTotalPrice();
	return;
};

const dateChangeHandler = (ev) => {
	console.log('dateChangeHandler');
	const arrivalDateEl = document.querySelector('#input-date-start');
	const arrivalDate = arrivalDateEl.value;
	const departureDateEl = document.querySelector('#input-date-end');
	const departureDate = departureDateEl.value;


	updateNightsCounter();
	updateTotalPrice();
};

const formSelectorHandler = (ev) => {
	const formContentNewEl = document.querySelector('#formNewResa');
	const formContentListEl = document.querySelector('#formListResa');
	const target = ev.target;
	if (target.id === 'newResaBtn') {
		formContentNewEl.classList.remove('hide');
		formContentListEl.classList.add('hide');
	} else if (target.id === 'listResaBtn') {
		getUserReservationList();
		formContentNewEl.classList.add('hide');
		formContentListEl.classList.remove('hide');
	}
};

const arriveeBtnClickHandler = (ev) => {
	$('#input-date-start').datepicker('show');
};


const departBtnClickHandler = (ev) => {
	$('#input-date-end').datepicker('show');
};

/**
 * @param {PointerEvent} ev 
 */
const boatEditOnClickHandler = (ev) => {
	document.querySelector('#boatEditModal').style.display = 'block';
	displayBoatsInEditModal();
};

const boatCloseModalBtnOnClickHandler = (ev) => {
	document.querySelector('#boatEditModal').style.display = 'none';
};

const boatEditRowOnClickHandler = async (index) => {
	G_selectedBoat = index;
	const selectedBoat = G_boatList[G_selectedBoat];
	
	document.querySelector('#boatEditModal').style.display = 'none';
	setFormBoatLongueur(selectedBoat.bateau_longueur)
	setFormBoatLargeur(selectedBoat.bateau_largeur)
	await updateTotalPrice();
};

// ********************
// FORM GETTERS SETTERS
// ********************

const getFormHarbourId = () => {
	/** @type {HTMLSelectElement}  */
	const harbourSelect = document.querySelector('#harbourSelect');
	console.dir(harbourSelect)

	/** @type {HTMLOptionElement}  */
	const selectedOption = harbourSelect.querySelectorAll('option')[harbourSelect.selectedIndex];
	console.log(selectedOption)
	if (selectedOption.value === '') {
		console.error('No Harbour Selected')
		harbourSelect.classList.add('error');
		throw(new Error('Veuillez choisir un port'))
	}
	const harbourId = selectedOption.value;
	return(harbourId);
};

const getFormArrivalDate = () => {
	/** @type {HTMLInputElement} */
	const arrivalDateEl = document.querySelector('#input-date-start');
	const arrivalDate = arrivalDateEl.value;
	if (arrivalDate === '') {
		console.error('No Arrival Date Selected')
		arrivalDateEl.classList.add('error');
		throw(new Error('Veuillez choisir une date d\'arrivée'));
	}
	const DD = arrivalDate.split('/')[0];
	const MM = arrivalDate.split('/')[1];
	const YY = arrivalDate.split('/')[2];
	const arrivalDateFromated = `${YY}${MM}${DD}`;
	return(arrivalDateFromated)
};

const getFormDepartureDate = () => {
	/** @type {HTMLInputElement} */
	const departureDateEl = document.querySelector('#input-date-end');
	console.dir(departureDateEl)
	const departureDate = departureDateEl.value;
	if (departureDate === '') {
		console.error('No Departure Date Selected')
		departureDateEl.classList.add('error');
		throw(new Error('Veuillez choisir une date de départ'));
	}
	const DD = departureDate.split('/')[0];
	const MM = departureDate.split('/')[1];
	const YY = departureDate.split('/')[2];
	const departureDateFromated = `${YY}${MM}${DD}`;
	return(departureDateFromated)
};

const getFormBoatLongueur = () => {
	const longueurEl = document.querySelector('#input-boat-longueur');
	const longueur = longueurEl.value;
	if (!longueur || longueur === '') {
		console.error('Empty longueur value')
		harbourSelect.classList.add('error');
		throw(new Error('Veuillez specifier la longueur du bateau'));
	}
	return(longueur)
};
const setFormBoatLongueur = (value) => {
	if (!value || value === '') {
		console.warn('Empty value not accepted as longueur value')
	}
	const longueurEl = document.querySelector('#input-boat-longueur');
	longueurEl.value = value;
};

const getFormBoatLargeur = () => {
	const largeurEl = document.querySelector('#input-boat-largeur');
	const largeur = largeurEl.value;
	if (!largeur || largeur === '') {
		console.error('Empty largeur value')
		harbourSelect.classList.add('error');
		throw(new Error('Veuillez specifier la largeur du bateau'));
	}
	return(largeur)
};
const setFormBoatLargeur = (value) => {
	if (!value || value === '') {
		console.warn('Empty value not accepted as largeur value')
	}
	const largeurEl = document.querySelector('#input-boat-largeur');
	largeurEl.value = value;
};

const getFormBoatType = () => {
	const VoilierEl = document.querySelector('#boatTypeVoilierBtn');
	if (VoilierEl.classList.contains('active')) {
		const type = VoilierEl.innerText;
		return(type);
	}
	const MonocoqueEl = document.querySelector('#boatTypeMonocoqueBtn');
	if (MonocoqueEl.classList.contains('active')) {
		const type = MonocoqueEl.innerText;
		return(type);
	}
};

const getFormComments = () => {
	const commentsAreaEl = document.querySelector('#commentsArea');
	const comments = commentsAreaEl.value;
	return(comments);
};

// ********
// SERVICES
// ********

const initJqueryElements = () => {
	const todayDate = new Date();
	from = $("#input-date-start")
		.datepicker({
			minDate: todayDate,
			dateFormat: 'dd/mm/yy',
		})
		.on('change', (ev) => {
			console.log('INNER ON CHANGE', this)
			console.log('ev', ev)
			const DD = ev.target.value.split('/')[0];
			const MM = ev.target.value.split('/')[1];
			const YY = ev.target.value.split('/')[2];
			const newDate = new Date(`${MM}/${DD}/${YY}`);
			console.log('NEW DATE', newDate)
			to.datepicker('option', 'minDate', newDate);
			updateNightsCounter();
			updateTotalPrice();
		});
		to = $("#input-date-end")
			.datepicker({
				defaultDate: '+1D',
				dateFormat: 'dd/mm/yy',
			})
			.on('change', () => {
				// console.log('from', from)
				// console.log('to', to)
				updateNightsCounter();
				updateTotalPrice();
			});
};

/**
 * @param {string} dateStart date string yyyy-mm-dd
 * @param {string} dateEnd date string yyyy-mm-dd
 * @returns 
 */
const updateNightsCounter = () => {
	const dateStart = getFormArrivalDate();
	const dateEnd = getFormDepartureDate();

	if (!dateStart || !dateEnd || dateStart === '' || dateEnd === '') {
		console.warn('Abort updateNightsCounter');
		return;
	}

	let YY = dateStart.slice(0, 4);
	let MM = dateStart.slice(4, 6);
	let DD = dateStart.slice(6, 8);
	const start = new Date(`${MM}/${DD}/${YY}`);
	YY = dateEnd.slice(0, 4);
	MM = dateEnd.slice(4, 6);
	DD = dateEnd.slice(6, 8);
	const end = new Date(`${MM}/${DD}/${YY}`);
	const delta = end - start;
	const days = delta / (60*60*24*1000);
	const nightsCountEl = document.querySelector('#input-night-count');
	nightsCountEl.value = days;
};

const updateTotalPrice = async () => {
	try {
		const harbourId = getFormHarbourId();
		const startDate = getFormArrivalDate();
		const endDate = getFormDepartureDate();
		const longueur = getFormBoatLongueur();
		const largeur = getFormBoatLargeur();
		const boatType = getFormBoatType();
		const comments = getFormComments();
		const login = localStorage['magelanLogin'];
		const token = localStorage['magelanToken'];

		document.querySelector('#priceSpinnerCtn').classList.remove('hide');
		document.querySelector('#input-price-count').classList.add('hide');

		const resp = await fetch(`/api/eresa/price/?harbourId=${harbourId}&startDate=${startDate}&endDate=${endDate}&longueur=${longueur}&largeur=${largeur}&boatType=${boatType}&comments=${comments}&login=${login}&token=${token}`, { method: 'GET' });
		const respJson = await resp.json()
		const estimatedPriceArr = Object.values(respJson.data.resaList);
		const price = estimatedPriceArr[0]?.total || '-';
		const priceEl = document.querySelector('#input-price-count');
		priceEl.value = `${price} €`;
		document.querySelector('#priceSpinnerCtn').classList.add('hide');
		document.querySelector('#input-price-count').classList.remove('hide');

		const actionBtnCtnEl = document.querySelector('.action-button-ctn');
		actionBtnCtnEl.classList.remove('disabled');
		updateNightsCounter();
	} catch (error) {
		console.error('ERROR', error);
		// alert(error);
	}
};

const getUserReservationList = async () => {
	try {
		const url = `/api/eresa/list-reservations/?login=${localStorage['magelanLogin']}&token=${localStorage['magelanToken']}`;

		const resp = await fetch(url);
		const respJson = await resp.json();
		console.log('respJson', respJson);
		const reservations = Object.values(respJson.data);
		reservations.sort((a, b) => b.resa_date_debut - a.resa_date_debut);

		const today = new Date().toLocaleDateString().split('/').reverse().join(''); // date of today fotmat: YYYYMMDD

		const htmlRow = [];
		const htmlRowOld = [];
		Object.values(reservations).map(reservation => {
			const harbourName = reservation.resa_port_ville;
				const yyStart = reservation.resa_date_debut.slice(2, 4);
				const mmStart = reservation.resa_date_debut.slice(4, 6);
				const ddStart = reservation.resa_date_debut.slice(6, 8);
				const yyEnd = reservation.resa_date_fin.slice(2, 4);
				const mmEnd = reservation.resa_date_fin.slice(4, 6);
				const ddEnd = reservation.resa_date_fin.slice(6, 8);
	
				const startDate = `${ddStart}/${mmStart}/${yyStart}`;
				const endDate = `${ddEnd}/${mmEnd}/${yyEnd}`;
				const status = reservation.resa_status;
				const statusColor = reservation.resa_status_couleur;
			if (reservation.resa_date_fin > today) {
				htmlRow.push(`
					<div class="resa-card">
						<div class="resa-card-row">
							<div>${harbourName}</div>
							<div>${startDate} - ${endDate}</div>
						</div>
						<div class="resa-card-row">
							<div>Statut</div>
							<div style="color:${statusColor}">${status}</div>
						</div>
					</div>
				`);
			} else {
				// Old Resa
				htmlRowOld.push(`
				<div class="resa-card">
					<div class="resa-card-row">
						<div>${harbourName}</div>
						<div>${startDate} - ${endDate}</div>
					</div>
					<div class="resa-card-row">
						<div>Statut</div>
						<div style="color:${statusColor}">${status}</div>
					</div>
				</div>
			`);
			}
		})

		
		const resaNewSectionTitleCtnEl = document.querySelector('#resaNewSectionTitleCtn');
		const resaOldSectionTitleCtnEl = document.querySelector('#resaOldSectionTitleCtn');
		const resaOldListCtnEl = document.querySelector('#resaOldListCtn');
		const resaListCtnEl = document.querySelector('#resaListCtn');
		resaListCtnEl.innerHTML = htmlRow.join(''); // place new or empty resa list
		if (htmlRowOld.length > 0) {
			// place old resa by dividing the space in 2
			resaOldSectionTitleCtnEl.classList.remove('hide');
			resaOldListCtnEl.innerHTML = htmlRowOld.join('');
		} else {
			// if no old resa allocate full space to display new resa
			resaNewSectionTitleCtnEl.classList.replace('half-height', 'full-height');
			resaOldSectionTitleCtnEl.classList.add('hide');
		}
	} catch (error) {
		console.error('Error', error);
		alert(error);
	}
};

const displayBoatData = async () => {
	const boats = await fetchUserBoatList();
	if (!boats) {
		console.warn('No boats found');
		return;
	}
	const boat = boats[0];
	if (!boat) {
		console.warn('No boat found');
		return;
	}
	G_boatList = boats;
	G_selectedBoat = 0;

	const boatLongueurEl = document.querySelector('#input-boat-longueur');
	boatLongueurEl.value = boat.bateau_longueur;
	const boatLargeurEl = document.querySelector('#input-boat-largeur');
	boatLargeurEl.value = boat.bateau_largeur;
};

const fetchUserBoatList = async () => {
	try {
		const url = `/api/eresa/list-boats/?login=${localStorage['magelanLogin']}&token=${localStorage['magelanToken']}`;

		const resp = await fetch(url);
		const respJson = await resp.json();
		console.log('respJson', respJson);
		if (respJson.success === false) {
			if (respJson.error === "Error: INVALID TOKEN") {
				window.location = '/magelan-login';
			}
			return;
		}

		const boats = respJson.data;
		const boatsArr = Object.values(boats);
		return(boatsArr);
	} catch (error) {
		console.error('Error', error);
		alert(error);
	}
};

const requestAddReservation = async (options) => {
	try {
		const startDate = options.startDate.replaceAll('-', '');
		const endDate = options.endDate.replaceAll('-', '');
		const url = `/api/eresa/add-reservation/?boatId=${options.boatId}&portId=${options.harbourId}&startDate=${startDate}&endDate=${endDate}&comments="${options.comments}"&login=${options.login}&token=${options.token}`;
		console.log('===>url',url)

		const actionBtnCtnEl = document.querySelector('.action-button-ctn');
		const reservationBtnEl = document.querySelector('#reservationBtn');
		reservationBtnEl.innerHTML = 'Demande en cours...';
		const resp = await fetch(url);
		const respJson = await resp.json();
		if (respJson.success === false) {
			throw new Error('Ooops une petite erreur est survenue');
		}

		actionBtnCtnEl.classList.add('success');
		reservationBtnEl.innerText = 'Succes';
	} catch (error) {
		console.error('Error', error);
		const actionBtnCtnEl = document.querySelector('.action-button-ctn');
		const reservationBtnEl = document.querySelector('#reservationBtn');
		actionBtnCtnEl.classList.add('error');
		reservationBtnEl.innerText = 'Erreur';
		alert(error);
	}
};

const displayBoatsInEditModal = async () => {
	const boatRows = [];
	G_boatList = await fetchUserBoatList();
	G_boatList.map((boat, index) => {
		const selectedClass = (index === G_selectedBoat) ? ' active' : '';
		boatRows.push(`
			<div class="boat-row${selectedClass}" id="bemBoatRow_${boat.bateau_id}" onclick="boatEditRowOnClickHandler(${index})">
				<div class="boat-row__name">${boat.bateau_nom}</div>
				<div class="boat-row__longueur">${boat.bateau_longueur}</div>
				<div class="boat-row__largeur">${boat.bateau_largeur}</div>
				<div class="boat-row__tirant">${boat.bateau_tirant}</div>
			</div>
		`);
	});

	const bemBodyCtnEl = document.querySelector('#bemBodyCtn');
	bemBodyCtnEl.innerHTML = '';
	bemBodyCtnEl.insertAdjacentHTML('afterbegin', boatRows.join(''));
};

const getSelectedBoatId = async () => {
	let selectedBoat;
	if (G_boatList?.length > 0 && G_selectedBoat !== undefined) {
		selectedBoat = G_boatList[G_selectedBoat];
	}
	const selectedBoatId = selectedBoat.bateau_id;
	return(selectedBoatId);
};
