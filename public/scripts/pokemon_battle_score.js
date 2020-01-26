
'use strict';

function signIn() {
  // Sign into Firebase using popup auth & Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}

// Returns the signed-in user's profile pic URL.
function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
  return firebase.auth().currentUser.displayName;
}

function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}


function initFirebaseAuth() {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}


function loadBattlescores() {
  /*
  var db = firebase.firestore();

  var query = db.collection('gyms').orderBy('highscore', 'desc');

    // Start listening to the query.
    query.onSnapshot(function(snapshot) {
      snapshot.docChanges().forEach(function(change) {
          var highscore = change.doc.data();
          displayHighscore(change.doc.id, highscore);
      });
    });
*/
}


// Triggers when the auth state change for instance when the user signs-in or signs-out.

function authStateObserver(user) {
  if (user) { // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Set the user's profile pic and name.
    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.removeAttribute('hidden');
    userPicElement.removeAttribute('hidden');
    signOutButtonElement.removeAttribute('hidden');

    // Hide sign-in button.
    //signInButtonElement.setAttribute('hidden', 'true');

  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    userNameElement.setAttribute('hidden', 'true');
    userPicElement.setAttribute('hidden', 'true');
    signOutButtonElement.setAttribute('hidden', 'true');

    // Show sign-in button.
    signInButtonElement.removeAttribute('hidden');
  }
}

// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage() {
  // Return true if the user is signed in Firebase
  if (isUserSignedIn()) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
  return false;
}

var ATT_HIGHSCORE =
    '<div class="att_highscore_container">' +
      '<div class="highscore"></div>' +
      '<div class="gymtag"></div>' +
      '<div class="name"></div>' +
      '<div class="score"></div>' +
    '</div>';

function createAndInsertHighscore(id, highscore) {
  const container = document.createElement('div');
  container.innerHTML = ATT_HIGHSCORE;
  const div = container.firstChild;
  div.setAttribute('id', id);

  var timestamp = highscore.timestamp;

  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute('timestamp', timestamp);
  div.setAttribute('id', id);

  // figure out where to insert new message
  const existingMessages = highscoreListElement.children;
  if (existingMessages.length === 0) {
  highscoreListElement.appendChild(div);
  } else {
    let messageListNode = existingMessages[0];

    while (messageListNode) {
      const messageListNodeTime = messageListNode.getAttribute('timestamp');

      if (!messageListNodeTime) {
        throw new Error(
          `Child ${messageListNode.id} has no 'timestamp' attribute`
        );
      }

      if (messageListNodeTime > timestamp) {
        break;
      }

      messageListNode = messageListNode.nextSibling;
    }

    highscoreListElement.insertBefore(div, messageListNode);
  }

  return div;
}

function displayHighscore(id, highscore) {
  var div = document.getElementById(id) || createAndInsertHighscore(id, highscore);


  var messageElement = div.querySelector('.highscore');

  div.querySelector('.gymtag').textContent = highscore.gym_tag;
  div.querySelector('.name').textContent = highscore.name;
  div.querySelector('.score').textContent = highscore.highscore;

    //messageElement.textContent = pokemon.text;
    // Replace all line breaks by <br>.
    //messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');

    var image = document.createElement('img');

    //var imageUrl = '/images/pokemon/'+ pokemon.number +'.png';

    //image.src = imageUrl;
    //image.height = '75';
    //image.width = '75';

    messageElement.innerHTML = '';
    messageElement.appendChild(image);

  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
}


// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
}

// Checks that Firebase has been imported.
checkSetup();

// Shortcuts to DOM Elements.
var highscoreListElement = document.getElementById('battle_scores');

var mediaCaptureElement = document.getElementById('mediaCapture');
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signOutButtonElement = document.getElementById('sign-out');
var signInSnackbarElement = document.getElementById('must-signin-snackbar');


// initialize Firebase
initFirebaseAuth();

// TODO: Enable Firebase Performance Monitoring.

// We load currently existing chat messages and listen to new ones.
loadBattlescores();
