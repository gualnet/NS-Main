
console.log('Magelan Login Script');

window.addEventListener('load', () => {
	addEventsListenersOnLoad();
});

const addEventsListenersOnLoad = () => {
	const connexionBtnEl = document.querySelector('#login-btn');
	if (connexionBtnEl) {
		connexionBtnEl.addEventListener('click', clickOnConnexionBtnHandler);
	}
}

const clickOnConnexionBtnHandler = async (ev) => {
	const loginInputEl = document.querySelector('#loginInput');
	const pwdInputEl = document.querySelector('#pwdInput');

	if (!loginInputEl || !pwdInputEl) {
		console.error('input element not found');
		return;
	}

	const login = loginInputEl.value;
	const pwd = pwdInputEl.value;

	await fetchLoginMagelan(login, pwd);
};

const fetchLoginMagelan = async (login, password) => {
	console.log('fetchLoginMagelan')
	try {
		const url = `/api/eresa/login/?login=${login}&password=${password}`
		console.log('url',url)

		const loginBtnEl = document.querySelector('#login-btn');
		loginBtnEl.classList.add('success');
		const loginTextEl = document.querySelector('#loginText');
		loginTextEl.classList.add('hide');
		loginTextEl.innerHTML = 'Success';
		const loginSpinnerEl = document.querySelector('#loginSpinner');
		loginSpinnerEl.classList.remove('hide');

		const res = await fetch(url);
		const jsonResp = await res.json();
		if (!jsonResp.success) {
			// Error do something
		}
		console.log('jsonResp', jsonResp.data);
		const magelanLogin = jsonResp.data.login;
		const magelanToken = jsonResp.data.token;
		if (magelanToken) {
			localStorage['magelanLogin'] = magelanLogin;
			localStorage['magelanToken'] = magelanToken;
			window.location.href = '/magelan-resa';
		} else {
			window.location.href = '/magelan-login';
		}
	} catch (error) {
		console.error(error);
		const loginBtnEl = document.querySelector('#login-btn');
		const loginTextEl = document.querySelector('#loginText');
		const loginSpinnerEl = document.querySelector('#loginSpinner');
		loginBtnEl.classList.add('error');
		loginTextEl.classList.remove('hide');
		loginTextEl.innerHTML = 'Error';
		loginSpinnerEl.classList.add('hide');
	}
};

const changePageLocationTo = (url) => {
	if (url) {
		window.location.href = url;
	} else {
		console.error(`Wrong url '${url}'`);
	}
};
