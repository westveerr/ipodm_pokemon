
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


function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if(pair[0] == variable){return pair[1];}
	}
	return(false);
}

function loadPokemons() {
  // Create the query to load the last 12 messages and listen for new ones.

  var db = firebase.firestore();

  var gym_tag = getQueryVariable('gym_tag');
  var pokemon1Name = getQueryVariable('pokemon1');
  var pokemon2Name = getQueryVariable('pokemon2');
  var pokemon3Name = getQueryVariable('pokemon3');

  /////
  db.collection("gyms").where("gym_tag", "==", gym_tag)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
                    console.log('gym gevonden ' + gym_tag);

                    db.collection("pokemons").where("name", "==", pokemon1Name)
                      .get()
                      .then(function(querySnapshot2) {
                          querySnapshot2.forEach(function(doc2) {
                              var pokemon1 = doc2.data();

                              console.log(pokemon1.type);

                              return db.collection('gyms').doc(doc.id).collection('pokemons').add({
                                number: pokemon1.number,
                                name: pokemon1Name,
                                type: pokemon1.type,
                                attack: pokemon1.attack,
                                defense: pokemon1.defense,
                                battle_order: 1,
                                timestamp: firebase.firestore.FieldValue.serverTimestamp()
                          });
                      });
                      });


                        db.collection("pokemons").where("name", "==", pokemon2Name)
                          .get()
                          .then(function(querySnapshot2) {
                              querySnapshot2.forEach(function(doc2) {
                                  var pokemon2 = doc2.data();

                                  return db.collection('gyms').doc(doc.id).collection('pokemons').add({
                                    number: pokemon2.number,
                                    name: pokemon2Name,
                                    type: pokemon2.type,
                                    attack: pokemon2.attack,
                                    defense: pokemon2.defense,
                                    battle_order: 2,
                                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                              });
                          });
                          });

                          db.collection("pokemons").where("name", "==", pokemon3Name)
                            .get()
                            .then(function(querySnapshot2) {
                                querySnapshot2.forEach(function(doc2) {
                                    var pokemon3 = doc2.data();

                                    return db.collection('gyms').doc(doc.id).collection('pokemons').add({
                                      number: pokemon3.number,
                                      name: pokemon3Name,
                                      type: pokemon3.type,
                                      attack: pokemon3.attack,
                                      defense: pokemon3.defense,
                                      battle_order: 3,
                                      timestamp: firebase.firestore.FieldValue.serverTimestamp()
                                });
                            });
                            });

        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

  /////


}


function authStateObserver(user) {
  if (user) { // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();
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

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

// Delete a Message from the UI.
function deleteMessage(id) {
  var div = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (div) {
    div.parentNode.removeChild(div);
  }
}

// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (true) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

function redirect()
{
    document.forms[0].submit;
}



// initialize Firebase
initFirebaseAuth();

// TODO: Enable Firebase Performance Monitoring.

// We load currently existing chat messages and listen to new ones.
loadPokemons();
