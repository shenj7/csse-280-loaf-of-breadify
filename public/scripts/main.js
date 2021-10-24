rhit.mainPageController = null;

var rhit = rhit || {};

var spotify = spotify || {};

/* spofity api stuff */

spotify.client_id = '0e95f084d6ea4406b2ac1dae208e4a6a'; // Your client id
spotify.client_secret = ''; // Your secret
spotify.redirect_uri = 'localhost:5000/pages/index.html'; // Your redirect uri

/* end spotify api stuff */

rhit.MainPageController = class {
	constructor() {
		this.initializeButtons();
	}

	initializeButtons() {
		$("#spotifyButton").click((event) => {
			console.log("spotify");
			// 	(req, res) => {
			// 		res.cookie(stateKey, state);

			// 		// your application requests authorization
			// 		var scope = 'user-read-private user-read-email';
			// 		res.redirect('https://accounts.spotify.com/authorize?' +
			// 		querystring.stringify({
			// 		  response_type: 'code',
			// 		  client_id: client_id,
			// 		  scope: scope,
			// 		  redirect_uri: redirect_uri,
			// 		  state: state
			// 		}));
			// }
		});

		$("#homeButton").click((event) => {
			console.log("home");
			window.location.href = "../pages/home.html";
		});

		$("#settingsButton").click((event) => {
			console.log("settings");
			window.location.href = "../pages/settings.html";

		});
		$("#uploadButton").click((event) => {
			console.log("upload");
			window.location.href = "../pages/upload.html";

		});
		$("#fullscreenButton").click((event) => {
			console.log("full");
		});
	}
}

rhit.ListPageController = class {
	constructor() {

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
