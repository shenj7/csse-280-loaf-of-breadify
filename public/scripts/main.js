var rhit = rhit || {};

rhit.FB_COLLECTION_BG = "photos";
rhit.FB_KEY_IMAGEURL = "imageUrl";
rhit.FB_KEY_AUTHOR = "author";
rhit.FB_KEY_LASTUSED = "lastused";
rhit.fbBgManager = null;

var spotify = spotify || {};

var spotifyApi = new SpotifyWebApi();

/* spofity api stuff */

spotify.client_id = '0e95f084d6ea4406b2ac1dae208e4a6a'; // Your client id
spotify.redirect_uri = 'https://csse-280-loaf.web.app'; // Your redirect uri

apiurl = "https://us-central1-csse-280-loaf.cloudfunctions.net/api/"

/* end spotify api stuff */

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

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
		console.log("Finished Main");
	}

	get user() {
		return this.displayName;
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
		// try {
		const uid = sessionStorage.getItem("displayName");
		console.log("display name: " + uid);
		const tok = sessionStorage.getItem("Token");

		rhit.fbBgManager = new rhit.FbBgManager(uid, tok);
		new rhit.ListPageController();
 		// } catch {
		// 	console.log("No login on list page");
		// 	alert("Not logged in - The App will not work until you sign in with Spotify");
		// }
	}
	if (document.querySelector("#usernameSlot")) {
		const uid = sessionStorage.getItem("displayName");
		if (uid != undefined) {
			document.querySelector("#usernameSlot").innerHTML = "Logged In: " + uid;
			$("#signOutButton").click((event) => {
				sessionStorage.removeItem("token");
				sessionStorage.removeItem("displayName");
				sessionStorage.removeItem("currSelected");
				location.reload();
			});
		} else {
			document.querySelector("#signOutButton").style.display = "none";	
		}
	}
	if (document.querySelector("#addon")) {
		const uid = sessionStorage.getItem("displayName");
		if (uid == undefined) {
			document.querySelector("#addon").style.display = "none";
			document.querySelector("#delete").style.display = "none";
		}
	}
};

rhit.ListPageController = class {
	constructor() {
		console.log("created ListPageController");

/* 		if (document.querySelector("#listPage")) {
			window.location.href = `/list.html?displayName=${rhit.fbBgManager.uid}`;
		};
 */
		document.querySelector("#submitAddImage").addEventListener("click", (event) => {
			const imageURL = document.querySelector("#inputImageURL").value;
			rhit.fbBgManager.add(imageURL);
		});

		document.querySelector("#submitRemoveImage").addEventListener("click", (event) => {
			rhit.fbBgManager.deleteLastUsed(0);
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
		return htmlToElement(`<img class="cardImageURL" src="${bg.imageURL}">`);
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
			newCard.onclick = (params) => {
				sessionStorage.setItem("currSelected", rhit.fbBgManager.getBgAtIndex(i).imageURL);
				rhit.fbBgManager.setLastUsed(i);
				alert("This image has been set as your image for Full Screen");
			};
			newList.appendChild(newCard);
		}
		const oldList = document.querySelector("#imageListContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		console.log("oldlist parent: " + oldList.parentElement);
		oldList.parentElement.appendChild(newList);
	}

}

rhit.bg = class {
	constructor(imageURL, author) {
		this.imageURL = imageURL;
		this.author = author;
		this.lastUsed = firebase.firestore.Timestamp.now();
	}
}

rhit.FbBgManager = class {
	constructor(uid, token) {		
		this._uid = uid;
		this._token = token;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_BG);

		this._currentLast;
		this._unsubscribe = null;
		console.log("uid in fbbgmanager: " + this._uid);
	}

	setLastUsed(i) {
		console.log("setting last used on img "+ i);
		console.log(this._documentSnapshots[i]);

		firebase.firestore().collection(rhit.FB_COLLECTION_BG).doc(this._documentSnapshots[i].Ef.path.segments[6]).update({
			[rhit.FB_KEY_LASTUSED]: firebase.firestore.Timestamp.now(),
		})
	}

	deleteLastUsed(i) {
		firebase.firestore().collection(rhit.FB_COLLECTION_BG).doc(this._documentSnapshots[i].Ef.path.segments[6]).delete();
		window.location.reload();
	}

	add(imageURL) { 
		if (this._uid == undefined) {
			alert("Cannot add Image - You are not logged in");
			return;
		}
		this._ref.add({
			//[rhit.FB_KEY_AUTH_TOKEN]: rhit.fc.token,
			[rhit.FB_KEY_IMAGEURL]: imageURL,
			[rhit.FB_KEY_AUTHOR]: this._uid,
			[rhit.FB_KEY_LASTUSED]: false
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
		let query = this._ref.orderBy(rhit.FB_KEY_LASTUSED, "desc").limit(50);
		if (this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}
		this._currentLast = query[0];
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("querySnapshot: " + querySnapshot.docs);
			if (querySnapshot.docs != undefined) {
				this._documentSnapshots = querySnapshot.docs;
			}
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
		try {
			const background = new rhit.bg(
				docSnapshot.get(rhit.FB_KEY_IMAGEURL),
				docSnapshot.get(rhit.FB_KEY_AUTHOR)
			);
			return background;
		} catch {
			console.log("docSnapshot must be empty! Do any images apply to this user?");
			const background = new rhit.bg("ImageURL default", "Wam Salsa");
			return background;
		}
	}

}

rhit.main = function () {
	rhit.initializePage();
	rhit.mainPageController = new rhit.MainPageController();
	console.log("Ready");
};

rhit.main();
