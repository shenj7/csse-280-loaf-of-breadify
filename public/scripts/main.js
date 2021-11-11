var rhit = rhit || {};

var spotify = spotify || {};

/* spofity api stuff */

spotify.client_id = '0e95f084d6ea4406b2ac1dae208e4a6a'; // Your client id
// spotify.client_secret = 'd3ea2e92a73a40cabf7698511fc9c9ee'; // Your secret
spotify.redirect_uri = 'https://csse-280-loaf-of-breadify.web.app/pages/home.html'; // Your redirect uri

apiurl = "http://localhost:5001/csse-280-loaf/us-central1/api/"

/* end spotify api stuff */


rhit.mainPageController = null;

rhit.MainPageController = class {
	constructor() {
		this.initializeButtons();
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		this.accessToken = urlParams.get("access_token");
	}

	initializeButtons() {
		$("#spotifyButton").click((event) => {
			window.location.href = apiurl + "login";
			// fetch(apiurl + "callback").then(() =>{
			// 	accessToken = new URLSearchParams(url.search).get('access_token');
			// 	window.location.href = 'http://localhost:5000/pages/home.html';
			// 	console.log(accessToken);
			// }
			// );
		});

		$("#homeButton").click((event) => {
			console.log("home");
			window.location.href = "/pages/home.html";
		});

		$("#settingsButton").click((event) => {
			console.log("settings");
			window.location.href = "/pages/settings.html";

		});
		$("#uploadButton").click((event) => {
			console.log("upload");
			window.location.href = "/pages/upload.html";

		});
		$("#fullscreenButton").click((event) => {
			console.log("full");
		});
	}
}


rhit.BackgroundManager = class {
	constructor() {

	}
}

rhit.main = function () {
	rhit.mainPageController = new rhit.MainPageController();
	console.log("Ready");
};

rhit.main();
