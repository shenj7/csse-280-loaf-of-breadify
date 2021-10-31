var rhit = rhit || {};

var spotify = spotify || {};

/* spofity api stuff */

spotify.client_id = '0e95f084d6ea4406b2ac1dae208e4a6a'; // Your client id
// spotify.client_secret = 'd3ea2e92a73a40cabf7698511fc9c9ee'; // Your secret
spotify.redirect_uri = 'https://csse-280-loaf-of-breadify.web.app/pages/home.html'; // Your redirect uri

/* end spotify api stuff */


rhit.mainPageController = null;

rhit.MainPageController = class {
	constructor() {
		this.initializeButtons();
	}

	initializeButtons() {
		$("#spotifyButton").click((event) => {
			console.log("spotify");
			// var scopes = 'user-read-private user-read-email';
			// window.location.replace('https://accounts.spotify.com/authorize' +
			// '?response_type=code' +
			// '&client_id=' + spotify.client_id +
			// (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
			// '&redirect_uri=' + encodeURIComponent(spotify?spotify.redirect_uri:""));
			var app = express();

			app.get('/login', function (req, res) {

				var state = generateRandomString(16);
				var scope = 'user-read-private user-read-email';

				res.redirect('https://accounts.spotify.com/authorize?' +
					querystring.stringify({
						response_type: 'code',
						client_id: spotify.client_id,
						scope: scope,
						redirect_uri: spotify.redirect_uri,
						state: state
					}));
			});
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


rhit.BackgroundManager = class {
	constructor() {

	}
}

rhit.main = function () {
	rhit.mainPageController = new rhit.MainPageController();
	console.log("Ready");
};

rhit.main();
