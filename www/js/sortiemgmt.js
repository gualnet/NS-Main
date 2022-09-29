/**
 * @typedef T_sortie_owner
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 */
/**
 * @typedef T_sortie
 * @property {string} position
 * @property {number} countOutings
 * @property {number} countOutingsHighSeason
 * @property {number} countOutingsLowSeason
 * @property {number} countOutingsOffSeason
 * @property {object} place
 * @property {number} place.id
 * @property {string} place.code
 * @property {object} boat
 * @property {number} boat.id
 * @property {string} boat.name
 * @property {string} boat.boatType
 * @property {number} boat.draught
 * @property {number} boat.length
 * @property {number} boat.width
 * @property {string} boat.immatriculation
 * @property {string} boat.synoxDeviceId
 * @property {Array<T_sortie_owner>} boat.owners
 * @property {object} harbour
 * @property {number} harbour.id
 * @property {number} countCavalaireChallenge
 */
/**
 * @typedef G_buttons
 * @property {object} pagination
 * @property {HTMLLinkElement} pagination.prev
 * @property {HTMLLinkElement} pagination.A
 * @property {HTMLLinkElement} pagination.B
 * @property {HTMLLinkElement} pagination.C
 * @property {HTMLLinkElement} pagination.next
 */

// *******
// GLOBALS
// *******

/**@type {Array<T_sortie>} */
let G_AllSorties; // contains all fetched sorties should not change
/**@type {Array<T_sortie>} */
let G_sorties; // contains a list of sorties to display
/**@type {G_buttons} */
let G_buttons = {
	pagination: {
		prev: null,
		A: null,
		B: null,
		C: null,
		next: null,
	}
};
let G_currentPagination, G_maxPagination, G_maxRowsByPage;

window.addEventListener('load', async () => {
	G_AllSorties = await fetchSorties();
	G_sorties = G_AllSorties;
	document.querySelector('#searchInput').addEventListener('input', searchOnChangeHandler);
	document.querySelector('#tableTitle1').addEventListener('click', sortHandler);
	document.querySelector('#tableTitle2').addEventListener('click', sortHandler);
	document.querySelector('#tableTitle3').addEventListener('click', sortHandler);
	document.querySelector('#tableTitle5').addEventListener('click', sortHandler);
	document.querySelector('#tableTitle6').addEventListener('click', sortHandler);
	paginationInitialise();
	sortSortiesBy('userName');
	displayRows();
});

const paginationInitialise = () => {
	G_buttons.pagination.prev = document.querySelector('#paginationBtnPrev');
	G_buttons.pagination.A = document.querySelector('#paginationBtnA');
	G_buttons.pagination.B = document.querySelector('#paginationBtnB');
	G_buttons.pagination.C = document.querySelector('#paginationBtnC');
	G_buttons.pagination.next = document.querySelector('#paginationBtnNext');

	G_buttons.pagination.prev.addEventListener('click', paginationPrevClickHandler);
	G_buttons.pagination.next.addEventListener('click', paginationNextClickHandler);

	G_buttons.pagination.A.parentElement.classList.add('active');
	G_currentPagination = 1;
	G_maxRowsByPage = 10;
	G_maxPagination = Math.trunc(G_sorties.length / G_maxRowsByPage) + 1;
};

const paginationUpdateOnSearch = () => {
	G_currentPagination = 1;
	G_maxRowsByPage = 10;
	G_maxPagination = Math.trunc(G_sorties.length / G_maxRowsByPage) + 1;
	updatePaginationButtons();
}

const paginationPrevClickHandler = () => {
	if (G_currentPagination === 1) return;
	G_currentPagination -= 1;
	updatePaginationButtons();
	displayRows();
};

const paginationNextClickHandler = () => {
	if (G_currentPagination === G_maxPagination) return;
	G_currentPagination += 1;
	updatePaginationButtons();
	displayRows();
};

const updatePaginationButtons = () => {
	const sorties = G_sorties;
	if (sorties.length < G_maxRowsByPage) {
		G_buttons.pagination.A.innerText = '.';
		G_buttons.pagination.B.innerText = '1';
		G_buttons.pagination.C.innerText = '.';
		G_buttons.pagination.A.parentElement.classList.remove('active');
		G_buttons.pagination.B.parentElement.classList.add('active');
		G_buttons.pagination.C.parentElement.classList.remove('active');
	} else if (G_currentPagination === 1) {
		G_buttons.pagination.A.innerText = G_currentPagination;
		G_buttons.pagination.B.innerText = G_currentPagination + 1;
		G_buttons.pagination.C.innerText = G_currentPagination + 2;
		G_buttons.pagination.A.parentElement.classList.add('active');
		G_buttons.pagination.B.parentElement.classList.remove('active');
		G_buttons.pagination.C.parentElement.classList.remove('active');
	} else if (G_currentPagination > 1 && G_currentPagination < G_maxPagination) {
		G_buttons.pagination.A.innerText = G_currentPagination - 1;
		G_buttons.pagination.B.innerText = G_currentPagination;
		G_buttons.pagination.C.innerText = G_currentPagination + 1;
		G_buttons.pagination.A.parentElement.classList.remove('active');
		G_buttons.pagination.B.parentElement.classList.add('active');
		G_buttons.pagination.C.parentElement.classList.remove('active');
	} else if (G_currentPagination === G_maxPagination) {
		G_buttons.pagination.A.innerText = G_currentPagination - 2;
		G_buttons.pagination.B.innerText = G_currentPagination - 1;
		G_buttons.pagination.C.innerText = G_currentPagination;
		G_buttons.pagination.A.parentElement.classList.remove('active');
		G_buttons.pagination.B.parentElement.classList.remove('active');
		G_buttons.pagination.C.parentElement.classList.add('active');
	}
}

const fetchSorties = async () => {
	try {
		const url = '/api/ias/sorties';
		const response = await fetch(url, { method: 'GET' });
		const { sorties } = await response.json();
		return (sorties);
	} catch (error) {
		console.error('[ERROR]', error);
	}
};

const updateSortIcon = () => {
	console.log('====updateSortIcon====');
};

let G_sortedBy;
let G_sortIsReversed = false;
const sortHandler = (ev) => {
	const target = ev.target;
	const orderBy = target.innerText;

	// If its the second time the user click on the same sort button,
	// we need to reverse the list
	if (G_sortedBy === orderBy) {
		G_sortIsReversed = !G_sortIsReversed;
	} else {
		G_sortIsReversed = false;
	}

	if (orderBy === 'BATEAU') {
		sortSortiesBy('boatName', G_sortIsReversed);
		G_sortedBy = 'BATEAU';
	} else if (orderBy === 'PLACE') {
		sortSortiesBy('boatPlace', G_sortIsReversed);
		G_sortedBy = 'PLACE';
	} else if (orderBy === 'PLAISANCIER') {
		sortSortiesBy('userName', G_sortIsReversed);
		G_sortedBy = 'PLAISANCIER';
	} else if (orderBy === 'NOMBRE DE SORTIES') {
		sortSortiesBy('sortieCount', G_sortIsReversed);
		G_sortedBy = 'NOMBRE DE SORTIES';
	} else if (orderBy === 'CHALLENGE') {
		sortSortiesBy('challengeCount', G_sortIsReversed);
		G_sortedBy = 'CHALLENGE';
	}
	displayRows();
};

/**
 * @param {string} sortField
 * @param {bool} isReversed
 */
const sortSortiesBy = (sortField, isReversed = false) => {
	const allowedSortFields = ['boatName', 'boatPlace', 'userName', 'sortieCount', 'challengeCount'];
	if (!allowedSortFields.includes(sortField)) {
		alert(`Sort Field ${sortField} not authorized.`); //! DEV
		console.warn(`Sort Field ${sortField} not authorized.`);
		return;
	}

	const sorties = G_sorties;
	if (sortField === 'boatName') {
		sorties.sort((itemA, itemB) => (itemA.boat.name < itemB.boat.name) ? -1 : 1);
	} else if (sortField === 'boatPlace') {
		sorties.sort((itemA, itemB) => (itemA.place?.code < itemB.place?.code) ? -1 : 1);
	} else if (sortField === 'userName') {
		sorties.sort((itemA, itemB) => (itemA.boat.owners[0]?.lastName < itemB.boat.owners[0]?.lastName) ? -1 : 1);
	} else if (sortField === 'sortieCount') {
		sorties.sort((itemA, itemB) => (itemA.countOutings < itemB.countOutings) ? -1 : 1);
	} else if (sortField === 'challengeCount') {
		sorties.sort((itemA, itemB) => (itemA.countCavalaireChallenge < itemB.countCavalaireChallenge) ? -1 : 1);
	}

	if (isReversed) {
		sorties.reverse();
	}
}

/**
 * 
 * @param {T_sortie} sortie 
 * @returns 
 */
const createRow = (sortie) => {
	let ownerNames = [];
	sortie.boat.owners.map(owner => {
		ownerNames.push(`${owner.lastName} ${owner.firstName}`);
	});
	const escapedBoatName = sortie.boat?.name?.replaceAll('\'', '\\\'')
	const row = `
				<tr class="sortie-row" id="" onclick="openSortieModal('${sortie.boat?.id}/${escapedBoatName}')">
					<form method="POST" enctype="multipart/form-data" id="__FORMID__">
						<td>${sortie.boat?.name ?? 'INCONNU'}</td>
						<td>${sortie.place?.code ?? 'INCONNU'}</td>
						<td>${ownerNames?.join('<br>') || 'INCONNU'}</td>
						<td>${sortie.countOutings ?? 'INCONNU'}</td>
						<td>${sortie.countCavalaireChallenge ?? 'INCONNU'}</td>
					</form>
				</tr>
			`;
	return (row);
};

/**
 * 
 * @param {Array<T_sortie>} sorties 
 */
const displayRows = () => {
	const sorties = G_sorties;
	const pagination = G_currentPagination;
	const maxRows = G_maxRowsByPage || 10;

	const htmlRows = [];
	for (let i = 0; i < maxRows; i++) {
		const index = i + (maxRows * (pagination - 1));
		if (index >= sorties.length) break;
		const row = createRow(sorties[index]);
		htmlRows.push(row);
	}
	const sortieRowsCtnEl = document.querySelector('#sortieRowsCtn');
	sortieRowsCtnEl.innerHTML = '';
	sortieRowsCtnEl.innerHTML = htmlRows.join('');
}

const searchOnChangeHandler = (ev) => {
	const searchValue = ev.target.value.toLowerCase();
	if (searchValue.length === 0) {
		G_sorties = G_AllSorties;
		displayRows();
		return;
	}
	const results = G_AllSorties.filter(sortie => {
		/**@type {Array<string>} */
		const ownerList = [];
		sortie.boat?.owners.map(owner => ownerList.push(`${owner.firstName.toLowerCase()} ${owner.lastName.toLowerCase()}`))
		if (sortie.boat?.name.toLowerCase().includes(searchValue)) return true;
		else if (sortie.place?.code.toLowerCase().includes(searchValue)) return true;
		for (const name of ownerList) {
			if (name.includes(searchValue)) {
				return true;
			}
		}
	});
	G_sorties = results;
	displayRows();
	paginationUpdateOnSearch();
};

const fetchBoatOutings = async (boatId) => {
	const url = `/api/ias/challenges/?boatid=${boatId}`;
	const response = await fetch(url, { method: 'GET' });
	const { sorties } = await response.json();
	return(sorties);
};

const openSortieModal = async (param) => {
	/**@type {HTMLDivElement} */
	const modalEl = document.querySelector('#sortieModal');
	modalEl.addEventListener('click', closeSortieModal);

	/**@type {HTMLButtonElement} */
	const modalCloseBtnEl = document.querySelector('#modalCloseBtn');
	modalCloseBtnEl.addEventListener('click', closeSortieModal);

	const listSortiesEl = document.querySelector('#listSortiesCtn');
	listSortiesEl.innerHTML = '';
	
	const modalTitleEl = document.querySelector('#modalTitle');
	const boatName = param.split('/')[1];
	modalTitleEl.innerHTML = boatName;
	
	modalEl.classList.remove('hide');
	
	const boatId = param.split('/')[0];
	const boatOutings = await fetchBoatOutings(boatId);
	
	const modalBodyTitleEl = document.querySelector('#modalBodyTitle');
	modalBodyTitleEl.innerHTML = `Challenge (${boatOutings?.length / 2 || 0})`;

	displayModalSortieList(boatOutings);
};

const closeSortieModal = (ev) => {
	const target = ev.target
	if (target.id !== 'sortieModal' && target.id !== 'modalCloseBtn') return;

	const modalEl = document.querySelector('#sortieModal');
	const modalCloseBtnEl = document.querySelector('#modalCloseBtn');

	modalEl.classList.add('hide');
	modalEl.removeEventListener('click', closeSortieModal);
	modalCloseBtnEl.removeEventListener('click', closeSortieModal);
};

const createModalSortieListRow = (sortieIn, sortieOut) => {
	let formatDateOut = new Date(sortieOut.datetime).toLocaleString();
	formatDateOut = formatDateOut.slice(0, -3);
	let formatDateIn = new Date(sortieIn.datetime).toLocaleString();
	formatDateIn = formatDateIn.slice(0, -3);
	const row = `
		<li class="list-group-item">
			<div>${formatDateOut}</div><div>${formatDateIn}</div>
		</li>
	`;
	return(row);
}

const displayModalSortieList = (sortiesDetails = []) => {
	let rows = [];
	for (let i = 0; i < sortiesDetails.length; i += 2) {
		rows.push(createModalSortieListRow(sortiesDetails[i], sortiesDetails[i + 1]));
	}

	const listSortiesEl = document.querySelector('#listSortiesCtn');
	listSortiesEl.innerHTML = rows.join('');
	return;
};
