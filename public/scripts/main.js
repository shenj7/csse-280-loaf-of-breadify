var rhit = rhit || {};

rhit.FB_COLLECTION_BG = "photos";
rhit.FB_KEY_AUTH_TOKEN = "authToken";
rhit.FB_KEY_IMAGEURL = "imageUrl";
rhit.FB_KEY_AUTHOR = "author";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.fbBgManager = null;

var spotify = spotify || {};

var spotifyApi = new SpotifyWebApi();

/* spofity api stuff */

spotify.client_id = '0e95f084d6ea4406b2ac1dae208e4a6a'; // Your client id
// spotify.client_secret = 'd3ea2e92a73a40cabf7698511fc9c9ee'; // Your secret
spotify.redirect_uri = 'https://csse-280-loaf-of-breadify.web.app/pages/home.html'; // Your redirect uri

apiurl = "http://localhost:5001/csse-280-loaf/us-central1/api/"

/* end spotify api stuff */


rhit.mainPageController = null;


rhit.MainPageController = class {
	constructor() {
		console.log("made new main page controller");
		this.initializeButtons();
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		this.accessToken = urlParams.get("access_token");
		this.displayName;
		if (this.accessToken != undefined) {
			spotifyApi.setAccessToken(this.accessToken);
			spotifyApi.getMe()
				.then((data) => {
					//using data.display_name for Firebase collection userID
					// console.log(data);
					// console.log(data.display_name);
					sessionStorage.setItem("token", this.accessToken);
					sessionStorage.setItem("displayName", data.display_name);
					this.displayName = data.display_name;
					// console.log(this.accessToken);
					// firebase.auth().signInWithCustomToken(this.accessToken)
					// 	.catch(function (error) {
					// 		const errorCode = error.code;
					// 		const errorMessage = error.message;
					// 		if (errorCode === 'auth/invalid-custom-token') {
					// 			alert("token not valid");
					// 		} else {
					// 			console.log("custom auth error", errorCode, errorMessage);
					// 		}
					// 	});
				});
/* 			spotifyApi.getMyCurrentPlayingTrack()
				.then((data) => {
					console.log(data);
					console.log(data.item.id);
					spotifyApi.getAudioFeaturesForTrack(data.item.id)
						.then((data) => {
							console.log(data.tempo); //Gives the BPM if the visualizer uses it like that.
						});
				});
			console.log("Test"); */
			// spotifyApi = new SpotifyWebApi(accessToken);
			// this.tokenToDatabase();
		}
		else {
			if (sessionStorage.getItem("token") != null) {
				this.accessToken = sessionStorage.getItem("token");
				this.displayName = sessionStorage.getItem("displayName");
			};
		}
		if (this.displayName != null) {
			//rhit.fbBgManager = new rhit.FbBgManager(this.displayName, this.accessToken);
		}
	}

	get user() {
		return this.displayName;
	}

	tokenToDatabase() {
		// upload token to firestore
	}

	initializeButtons() {
		$("#spotifyButton").click((event) => {
			window.location.href = apiurl + "login";
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

rhit.initializePage = () => {
	const urlParams = new URLSearchParams(window.location.search);
	if (document.querySelector("#listPage")) {
		console.log("You are on the list page.");
		try {
		const uid = sessionStorage.getItem("displayName");
		const tok = sessionStorage.getItem("Token");

		rhit.fbPicsManager = new rhit.FbPicsManager(uid, tok);
		new rhit.ListPageController();
		} catch {
			console.log("No login on list page");
		}
	}
};

rhit.ListPageController = class {
	constructor() {
		console.log("created ListPageController");

		if (document.querySelector("listPage")) {
			window.location.href = `/list.html?displayName=${rhit.fbBgManager.uid}`;
		};

		document.querySelector("#submitAddImage").addEventListener("click", (event) => {
			const imageURL = document.querySelector("#inputImageURL").value;
			rhit.fbBgManager.add(imageURL);
		});

		$("#addImageDialog").on("show.bs.modal", (event) => {
			document.querySelector("#inputImageURL").value = "";
		});
		$("#addImageDialog").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#inputImageURL").focus();
		});

		// Start Listening!
		rhit.fbBgManager.beginListening(this.updateList.bind(this));
	}

	_createCard(bg) {
		return htmlToElement(`      
		<div class="pin">
			<img class="cardImageURL" src="${bg.imageURL}">
		</div>`);
	}

	updateList() {
		console.log("I need to update the list on the page!");
		console.log(`Num image = ${rhit.fbBgManager.length}`);
		console.log(`Example image = `, rhit.fbBgManager.getBgAtIndex(0));

		const newList = htmlToElement('<div id="imageListContainer"></div>');

		for (let i = 0; i < rhit.fbBgManager.length; i++) {
			const bg = rhit.fbBgManager.getBgAtIndex(i);
			console.log(bg);
			const newCard = this._createCard(bg);

			// newCard.onclick = (params) => {
			// 	window.location.href = `/pic.html?id=${pc.id}`;
			// };
			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#imageListContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);
	}

}

rhit.bg = class {
	constructor(imageURL, author) {
		this.imageURL = imageURL;
		this.author = author;
	}
}

rhit.FbBgManager = class {
	constructor(uid, token) {		
		this._uid = uid;
		this._token = token;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_BG);
		this._unsubscribe = null;
	}
	add(imageURL) { 
		this._ref.add({
			//[rhit.FB_KEY_AUTH_TOKEN]: rhit.fbBgManager.token,
			[rhit.FB_KEY_IMAGEURL]: imageURL,
			[rhit.FB_KEY_AUTHOR]: rhit.fbBgManager.uid,
			//[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		})
		.then(function (docRef) {
			console.log("Document written with ID: ", docRef.id);
		})
		.catch(function (error) {
			console.log("Error adding document: ", error);
		})
	}
	beginListening(changeListener) { 

		let query = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50);
		if (this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}

		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			// querySnapsnot.forEach((doc) => {
			// 	console.log(doc.data());
			// });
			changeListener();
		});
	}
	stopListening() {
		this._unsubscribe();
	}
	get length() { 
		return this._documentSnapshots.length;
	}
	getBgAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const background = new rhit.bg(
			docSnapshot.get(rhit.FB_KEY_IMAGEURL),
			docSnapshot.get(rhit.FB_KEY_AUTHOR)
		);
		return background;
	}

}

rhit.main = function () {
	hit.initializePage();
	rhit.mainPageController = new rhit.MainPageController();
	console.log("Ready");
};

rhit.main();
