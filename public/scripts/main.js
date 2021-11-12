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


/**
 * Creates a Firebase account with the given user profile and returns a custom auth token allowing
 * signing-in this account.
 * Also saves the accessToken to the datastore at /spotifyAccessToken/$uid
 *
 * @returns {Promise<string>} The Firebase custom auth token in a promise.
 */
 async function createFirebaseAccount(spotifyID, displayName, email, accessToken) {
	// The UID we'll assign to the user.
	const uid = `spotify:${spotifyID}`;
  
	// Save the access token to the Firebase Realtime Database.
	const databaseTask = admin.database().ref(`/spotifyAccessToken/${uid}`).set(accessToken);
  
	// Create or update the user account.
	const userCreationTask = admin.auth().updateUser(uid, {
	  displayName: displayName,
	  email: email,
	  emailVerified: true,
	}).catch((error) => {
	  // If user does not exists we create it.
	  if (error.code === 'auth/user-not-found') {
		return admin.auth().createUser({
		  uid: uid,
		  displayName: displayName,
		  email: email,
		  emailVerified: true,
		});
	  }
	  throw error;
	});
}

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
			fbBgManager = new FbBgManager(this.displayName);
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
			[rhit.FB_KEY_AUTH_TOKEN]: rhit.fbBgManager.token,
			[rhit.FB_KEY_IMAGEURL]: imageURL,
			[rhit.FB_KEY_AUTHOR]: rhit.fbBgManager.uid,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
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

rhit.BackgroundManager = class {
	constructor() {

	}
}

rhit.main = function () {
	rhit.mainPageController = new rhit.MainPageController();
	console.log("Ready");
};

rhit.main();
