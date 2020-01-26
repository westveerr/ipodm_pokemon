
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

function calculateBattleScore(attPokemon, defPokemon) {
  var battleScore;

  //Fire
  if(attPokemon.type == 'Fire' && defPokemon.type == 'Fire'){
    battleScore = attPokemon.strength - defPokemon.strength;
  } else if(attPokemon.type == 'Fire' && defPokemon.type == 'Grass'){
    battleScore = (attPokemon.strength*2) - defPokemon.strength;
  } else if(attPokemon.type == 'Fire' && defPokemon.type == 'Water'){
    battleScore = (attPokemon.strength*0.5) - defPokemon.strength;
  };

  //Water
  if(attPokemon.type == 'Water' && defPokemon.type == 'Water'){
    battleScore = attPokemon.strength - defPokemon.strength;
  } else if(attPokemon.type == 'Water' && defPokemon.type == 'Fire'){
    battleScore = (attPokemon.strength*2) - defPokemon.strength;
  } else if(attPokemon.type == 'Water' && defPokemon.type == 'Grass'){
    battleScore = (attPokemon.strength*0.5) - defPokemon.strength;
  };

  //Grass
  if(attPokemon.type == 'Grass' && defPokemon.type == 'Grass'){
    battleScore = attPokemon.strength - defPokemon.strength;
  } else if(attPokemon.type == 'Grass' && defPokemon.type == 'Water'){
    battleScore = (attPokemon.strength*2) - defPokemon.strength;
  } else if(attPokemon.type == 'Grass' && defPokemon.type == 'Fire'){
    battleScore = (attPokemon.strength*0.5) - defPokemon.strength;
  };

  return battleScore;
}

// Saves a new message to your Cloud Firestore database.
function saveBattle(attGymTag, attGymName, attPokemon1, attPokemon2, attPokemon3, defGymTag, defGymName, defPokemon1, defPokemon2, defPokemon3) {

  console.log('in saveBattle ' + attGymTag + defGymTag );
  //calculating the battles
  //battle 1
  var battleScore1 = calculateBattleScore(attPokemon1, defPokemon1);
  var battleScore2 = calculateBattleScore(attPokemon2, defPokemon2);
  var battleScore3 = calculateBattleScore(attPokemon3, defPokemon3);

  var totalBattleScore = battleScore1 + battleScore2 + battleScore3;

  saveHighScore(attGymTag, defGymTag, totalBattleScore);

  var battleMessage = new Object();
  battleMessage.attGymTag = attGymTag;
  battleMessage.attGymName = attGymName;
  battleMessage.defGymTag = defGymTag;
  battleMessage.defGymName = defGymName;
  battleMessage.battleScore1 = battleScore1;
  battleMessage.battleScore2 = battleScore2;
  battleMessage.battleScore3 = battleScore3;
  battleMessage.totalBattleScore = totalBattleScore;
  battleMessage.attPokemon1 = attPokemon1;
  battleMessage.attPokemon2 = attPokemon2;
  battleMessage.attPokemon3 = attPokemon3;
  battleMessage.defPokemon1 = defPokemon1;
  battleMessage.defPokemon2 = defPokemon2;
  battleMessage.defPokemon3 = defPokemon3;

  displayBatleOutcome(battleMessage);

  // Add a new message entry to the database.
  //    name: getUserName(),

  return firebase.firestore().collection('battles').add({
    attackGymTag: attGymTag,
    defendGymTag: defGymTag,
    attack1name: attPokemon1.name,
    attack1strength: attPokemon1.strength,
    defend1name: defPokemon1.name,
    defend1strength: defPokemon1.strength,
    battle1score: battleScore1,
    attack2name: attPokemon2.name,
    attack2strength: attPokemon2.strength,
    defend2name: defPokemon2.name,
    defend2strength: defPokemon2.strength,
    battle2score: battleScore2,
    attack3name: attPokemon3.name,
    attack3strength: attPokemon3.strength,
    defend3name: defPokemon3.name,
    defend3strength: defPokemon3.strength,
    battle3score: battleScore3,
    totalBattleScore: totalBattleScore,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(error) {
    console.error('Error writing new message to database', error);
  });
}

function saveHighScore(attGymTag, defGymTag, battleScore) {

  var highScore = 0;

  firebase.firestore().collection("gyms").where("gym_tag", "==", attGymTag)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {

              //highScore = doc.data().higscore;
              highScore = doc.data().highscore;
              if(highScore == undefined){
                highScore = battleScore;
              } else{
                highScore = highScore + battleScore;
              }

              firebase.firestore().collection('gyms').doc(doc.id).update({
                  highscore: highScore
              });

        });
    });

    highScore = 0;

    firebase.firestore().collection("gyms").where("gym_tag", "==", defGymTag)
      .get()
      .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {

                //highScore = doc.data().higscore;
                highScore = doc.data().highscore;
                if(highScore == undefined){
                  highScore = -battleScore;
                } else{
                  highScore = highScore + -battleScore;
                }

                firebase.firestore().collection('gyms').doc(doc.id).update({
                    highscore: highScore
                });

          });
      });
}

function displayBatleOutcome(battleMessage) {

  var div = document.getElementById('battle_outcome');

  var battle_outcome_text1 = createBattleMessageText(battleMessage.attPokemon1, battleMessage.defPokemon1, battleMessage.battleScore1 )
  var battle_outcome_text2 = createBattleMessageText(battleMessage.attPokemon2, battleMessage.defPokemon2, battleMessage.battleScore2 )
  var battle_outcome_text3 = createBattleMessageText(battleMessage.attPokemon3, battleMessage.defPokemon3, battleMessage.battleScore3 )

  var battle_outcome_overall;
  var battle_congrats;

  if(battleMessage.totalBattleScore > 0){
    battle_congrats = 'Congratulations! ' + battleMessage.attGymName + '<br><br>';
    battle_outcome_overall = battleMessage.attGymName + ' has won the battle with a score of ' + battleMessage.totalBattleScore;
  } else if(battleMessage.totalBattleScore < 0){
    battle_congrats = 'Congratulations! ' + battleMessage.defGymName + '<br><br>';
    battle_outcome_overall = battleMessage.defGymName + ' has won the battle with a score of ' + battleMessage.totalBattleScore;
  } else{
    battle_congrats = 'Mmmm no winner ... <br><br>';
    battle_outcome_overall = 'No gym has won this battle. The score is ' + battleMessage.totalBattleScore;
  }

  var BATTLE_OUTCOME = battle_congrats + battle_outcome_text1 + '<br><br>' + battle_outcome_text2 + '<br><br>' + battle_outcome_text3 + '<br><br>' + battle_outcome_overall; ;

  div.style.backgroundColor = '#ffca06';
  div.innerHTML = BATTLE_OUTCOME;
}

function createBattleMessageText(attPokemon, defPokemon, battleScore){

    var battleText;

    if(battleScore > 0){
      battleText = attPokemon.name + ' won for the attacking team!<br> The score is ' + battleScore;
    } else if(battleScore < 0){
      battleText = defPokemon.name + ' won for the defending team!<br> The score is ' + battleScore;
    } else{
      battleText = 'There is no winner between ' + attPokemon.name + ' and ' + defPokemon.name + '<br> The score is ' + battleScore;
    };

    setInterval(function(){ window.location.href="http://friendlychat-c6665.firebaseapp.com"; },5000);
    return battleText;

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

function loadAttackingGym() {
  // Create the query to load the last 12 messages and listen for new ones.

  var db = firebase.firestore();

  var rfidTag = getQueryVariable('attacking_gym');
  //var rfidTag ='950265802924';

  db.collection("gyms").where("rfid", "==", rfidTag)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {

            var gym = doc.data();

            var query = db.collection('gyms').doc(doc.id).collection('pokemons').orderBy('battle_order', 'asc');

            // Start listening to the query.
            query.onSnapshot(function(snapshot) {
              snapshot.docChanges().forEach(function(change) {
                if (change.type === 'removed') {
                  deleteMessage(change.doc.id);
                } else {
                  var attackingPokemon = change.doc.data();
                  displayAttackingPokemon(change.doc.id, gym, attackingPokemon);
                }
              });
            });
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

}

function loadDefendingGym() {

  var db = firebase.firestore();

  var rfidTag = getQueryVariable('defending_gym');
  //var rfidTag = '141635257159';

  db.collection("gyms").where("rfid", "==", rfidTag)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {

            var gym = doc.data();

            var query = db.collection('gyms').doc(doc.id).collection('pokemons').orderBy('battle_order', 'asc');

            // Start listening to the query.
            query.onSnapshot(function(snapshot) {
              snapshot.docChanges().forEach(function(change) {
                if (change.type === 'removed') {
                  deleteMessage(change.doc.id);
                } else {
                  var defendingPokemon = change.doc.data();
                  displayDefendingPokemon(change.doc.id, gym, defendingPokemon);
                }
              });
            });
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}


function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (messageInputElement.value && checkSignedInWithMessage()) {
    saveMessage(messageInputElement.value).then(function() {
      // Clear message text field and re-enable the SEND button.
      resetMaterialTextfield(messageInputElement);
      toggleButton();
    });
  }
}

function onBattleFormSubmit(e) {
  e.preventDefault();

  var attGymTag;
  var attGymName;
  var attPokemon1 = new Object();
  var attPokemon2 = new Object();
  var attPokemon3 = new Object();

  var defGymTag;
  var defGymName;
  var defPokemon1 = new Object();
  var defPokemon2 = new Object();
  var defPokemon3 = new Object();

  var countPokemon = 0;

  //getting the defense values
  const defPokemons = defPokemonListElement.children;

  if (defPokemons.length === 0) {
      console.log('leeg');
  } else {

      let defPokemonsListNode = defPokemons[0];

      while (defPokemonsListNode) {

          defGymTag = defPokemonsListNode.getAttribute('gymtag');
          defGymName = defPokemonsListNode.getAttribute('gym_name');

          if(countPokemon == 0) {
            defPokemon1.id = defPokemonsListNode.getAttribute('id');
            defPokemon1.name = defPokemonsListNode.getAttribute("name");
            defPokemon1.type = defPokemonsListNode.getAttribute("type");
            defPokemon1.strength = defPokemonsListNode.getAttribute("strength");
          }
          if(countPokemon == 1) {
            defPokemon2.id = defPokemonsListNode.getAttribute('id');
            defPokemon2.name = defPokemonsListNode.getAttribute("name");
            defPokemon2.type = defPokemonsListNode.getAttribute("type");
            defPokemon2.strength = defPokemonsListNode.getAttribute("strength");
          }
          if(countPokemon == 2) {
            defPokemon3.id = defPokemonsListNode.getAttribute('id');
            defPokemon3.name = defPokemonsListNode.getAttribute("name");
            defPokemon3.type = defPokemonsListNode.getAttribute("type");
            defPokemon3.strength = defPokemonsListNode.getAttribute("strength");
          }

          countPokemon += 1;
          defPokemonsListNode = defPokemonsListNode.nextSibling;
      }
    }

    countPokemon = 0;

      //getting the defense values
      const attPokemons = attPokemonListElement.children;

      if (attPokemons.length === 0) {
          console.log('leeg');
      } else {

          let attPokemonsListNode = attPokemons[0];

          while (attPokemonsListNode) {

              attGymTag = attPokemonsListNode.getAttribute('gymtag');
              attGymName = attPokemonsListNode.getAttribute('gym_name');

              if(countPokemon == 0) {
                attPokemon1.id = attPokemonsListNode.getAttribute('id');
                attPokemon1.name = attPokemonsListNode.getAttribute("name");
                attPokemon1.type = attPokemonsListNode.getAttribute("type");
                attPokemon1.strength = attPokemonsListNode.getAttribute("strength");
              }
              if(countPokemon == 1) {
                attPokemon2.id = attPokemonsListNode.getAttribute('id');
                attPokemon2.name = attPokemonsListNode.getAttribute("name");
                attPokemon2.type = attPokemonsListNode.getAttribute("type");
                attPokemon2.strength = attPokemonsListNode.getAttribute("strength");
              }
              if(countPokemon == 2) {
                attPokemon3.id = attPokemonsListNode.getAttribute('id');
                attPokemon3.name = attPokemonsListNode.getAttribute("name");
                attPokemon3.type = attPokemonsListNode.getAttribute("type");
                attPokemon3.strength = attPokemonsListNode.getAttribute("strength");
              }

              countPokemon += 1;
              attPokemonsListNode = attPokemonsListNode.nextSibling;
          }
      }

      saveBattle(attGymTag, attGymName, attPokemon1, attPokemon2, attPokemon3, defGymTag, defGymName, defPokemon1, defPokemon2, defPokemon3);

      document.getElementById('submit').disabled = true;
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

function createAndInsertAttGym(id, gym, pokemon) {

  const container = document.createElement('div');

  var imageUrl = '/images/pokemon/'+ pokemon.number +'.png';

  var ATT_GYM_TEMPLATE =
      '<div class="att_pokemon_container"><table><tr>' +
        '<td width="200"><img src=' + imageUrl + ' width=125 height=125></td>' +
        '<td width="500"><table><tr>'+
    	  '<tr><td>name:</td><td class="value">' + pokemon.name + '</td></tr>' +
    	  '<tr><td>Type:</td><td class="value">' + pokemon.type + '</td></tr>' +
    	  '<tr><td>Strength:</td><td class="value">' + pokemon.attack +'</td></tr>' +
      '</tr></table></div>';

  container.innerHTML = ATT_GYM_TEMPLATE;
  const div = container.firstChild;
  div.setAttribute('gymtag' , gym.gym_tag);
  div.setAttribute('gym_name' , gym.name);
  div.setAttribute('id', id);

  var timestamp = pokemon.timestamp;

  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute('timestamp', timestamp);
  div.setAttribute('id', id);
  div.setAttribute('name', pokemon.name);
  div.setAttribute('type', pokemon.type);
  div.setAttribute('strength', pokemon.attack);

  // figure out where to insert new message
  const existingMessages = attPokemonListElement.children;
  if (existingMessages.length === 0) {
  attPokemonListElement.appendChild(div);
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

    attPokemonListElement.insertBefore(div, messageListNode);
  }

  return div;
}

function createAndInsertDefGym(id, gym, pokemon) {

  const container = document.createElement('div');

  var imageUrl = '/images/pokemon/'+ pokemon.number +'.png';

  var DEF_GYM_TEMPLATE =
      '<div class="att_pokemon_container"><table><tr>' +
        '<td width="200"><img src=' + imageUrl + ' width=125 height=125></td>' +
        '<td width="500"><table><tr>'+
        '<tr><td>name:</td><td class="value">' + pokemon.name + '</td></tr>' +
        '<tr><td>Type:</td><td class="value">' + pokemon.type + '</td></tr>' +
        '<tr><td>Strength:</td><td class="value">' + pokemon.defense +'</td></tr>' +
      '</tr></table></div>';

  container.innerHTML = DEF_GYM_TEMPLATE;

  const div = container.firstChild;

  div.setAttribute('gymtag' , gym.gym_tag);
  div.setAttribute('gym_name' , gym.name);
  div.setAttribute('id', id);
  div.setAttribute('name', pokemon.name);
  div.setAttribute('type', pokemon.type);
  div.setAttribute('strength', pokemon.defense);

  var timestamp = pokemon.timestamp;

  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute('timestamp', timestamp);

  // figure out where to insert new message
  const existingMessages = defPokemonListElement.children;
  if (existingMessages.length === 0) {
    defPokemonListElement.appendChild(div);
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

    defPokemonListElement.insertBefore(div, messageListNode);
  }

  return div;
}

function displayAttackingPokemon(id, gym, pokemon) {
  var div = document.getElementById(id) || createAndInsertAttGym(id, gym, pokemon);

  displayAttGymName(gym.name);

  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
}

function displayDefendingPokemon(id, gym, pokemon) {
  var div = document.getElementById(id) || createAndInsertDefGym(id, gym, pokemon);

  displayDefGymName(gym.name);
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
}

function displayAttGymName(gymName){
	var refGym = document.getElementById('attacking_gym');

	var WELCOME = 'Attacking Gym: ' + gymName;

	refGym.innerHTML = WELCOME;
}

function displayDefGymName(gymName){
	var refGym = document.getElementById('defending_gym');

	var WELCOME = 'Defending Gym: ' + gymName;

	refGym.innerHTML = WELCOME;
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

// Shortcuts to DOM Elements.
var attPokemonListElement = document.getElementById('att_pokemons');
var defPokemonListElement = document.getElementById('def_pokemons');
var defBattleMessageListElement = document.getElementById('def_battle_messages');
var messageFormElement = document.getElementById('message-form');
var battleFormElement = document.getElementById('battle-form');
var submitButtonElement = document.getElementById('submit');
var imageButtonElement = document.getElementById('submitImage');
var imageFormElement = document.getElementById('image-form');

var mediaCaptureElement = document.getElementById('mediaCapture');
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signOutButtonElement = document.getElementById('sign-out');
var signInSnackbarElement = document.getElementById('must-signin-snackbar');

// Saves message on form submit.
battleFormElement.addEventListener('submit', onBattleFormSubmit);


// initialize Firebase
initFirebaseAuth();

// TODO: Enable Firebase Performance Monitoring.

// We load currently existing chat messages and listen to new ones.
loadAttackingGym();
loadDefendingGym();
