
'use strict';


function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if(pair[0] == variable){return pair[1];}
	}
	return(false);
}

function loadDeck() {

  var db = firebase.firestore();

  rfidTag = getQueryVariable('attacking_gym');
	//var rfidTag = "48243351209";

  db.collection("gyms").where("rfid", "==", rfidTag)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var query = db.collection('gyms').doc(doc.id).collection('pokemons').orderBy('battle_order', 'asc');

            // Start listening to the query.
            query.onSnapshot(function(snapshot) {
              snapshot.docChanges().forEach(function(change) {
                if (change.type === 'removed') {
                  deleteMessage(change.doc.id);
                } else {

									var pokemon = change.doc.data();

									db.collection("gyms").where("rfid", "==", rfidTag)
										.get()
										.then(function(querySnapshot) {
												querySnapshot.forEach(function(doc) {
														var gym = doc.data();

					                  displayPokemon(change.doc.id, gym, pokemon);
												 });
										})
										.catch(function(error) {
												console.log("Error getting documents: ", error);
										});



                }
              });
            });
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

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

function onOrderFormSubmit(e) {
  e.preventDefault();

  console.log("saving the order");

  var defGymTag;
  var defPokemon1 = new Object();
  var defPokemon2 = new Object();
  var defPokemon3 = new Object();

  var countPokemon = 0;
  var countPokemon1 = 0;

  //getting the defense values
  const defPokemons = deckListElement.children;

  if (defPokemons.length === 0) {
      console.log('leeg');
  } else {

      let defPokemonsListNode = defPokemons[0];

      while (defPokemonsListNode) {

          defGymTag = defPokemonsListNode.getAttribute('gymtag');

          if(countPokemon == 0) {
            defPokemon1.id = defPokemonsListNode.getAttribute('id');
            defPokemon1.name = defPokemonsListNode.getAttribute("name");
            defPokemon1.type = defPokemonsListNode.getAttribute("type");
            defPokemon1.strength = defPokemonsListNode.getAttribute("strength");
            defPokemon1.battleOrder = 2;
          }
          if(countPokemon == 1) {
            defPokemon2.id = defPokemonsListNode.getAttribute('id');
            defPokemon2.name = defPokemonsListNode.getAttribute("name");
            defPokemon2.type = defPokemonsListNode.getAttribute("type");
            defPokemon2.strength = defPokemonsListNode.getAttribute("strength");
            defPokemon2.battleOrder = 3;
          }
          if(countPokemon == 2) {
            defPokemon3.id = defPokemonsListNode.getAttribute('id');
            defPokemon3.name = defPokemonsListNode.getAttribute("name");
            defPokemon3.type = defPokemonsListNode.getAttribute("type");
            defPokemon3.strength = defPokemonsListNode.getAttribute("strength");
            defPokemon3.battleOrder = 1;
          }

          countPokemon += 1;
          defPokemonsListNode = defPokemonsListNode.nextSibling;
      }
    }

    saveDeck(defGymTag, defPokemon1, defPokemon2, defPokemon3);
}

function saveDeck(gymTag, pokemon1, pokemon2, pokemon3) {

  gymTag = document.getElementById('gym_tag').getAttribute('data_value');
  console.log('gym tag' + gymTag);

  var battleOrder = 1;

  firebase.firestore().collection("gyms").where("gym_tag", "==", gymTag)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          firebase.firestore().collection('gyms').doc(doc.id).collection('pokemons').doc(pokemon1.id).update({
              battle_order: pokemon1.battleOrder,
          });
          firebase.firestore().collection('gyms').doc(doc.id).collection('pokemons').doc(pokemon2.id).update({
              battle_order: pokemon2.battleOrder
          });
          firebase.firestore().collection('gyms').doc(doc.id).collection('pokemons').doc(pokemon3.id).update({
              battle_order: pokemon3.battleOrder
          });

        });

    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}



function createAndInsertPokemon(id, gym, pokemon) {

	var imageUrl = '/images/pokemon/'+ pokemon.number +'.png';

	var DECK =
	'<div class="pokemon_container">' +
	  '<div></div><table border=0><tr>' +
		'<td width="240" class="battle_label">Battle round ' + pokemon.battle_order +':</td>' +
		'<td width="200"><img src=' + imageUrl + ' width=125 height=125></td>' +
		'<td width="500"><table><tr>'+
		'<tr><td>name:</td><td class="value">' + pokemon.name + '</td></tr>' +
		'<tr><td>Type:</td><td class="value">' + pokemon.type + '</td></tr>' +
		'<tr><td>Strength:</td><td class="value">' + pokemon.attack +'</td></tr>' +
	'</tr></table></div>';

  const container = document.createElement('div');
  container.innerHTML = DECK;
  const div = container.firstChild;
  div.setAttribute('id', id);

  var timestamp = pokemon.timestamp;

  timestamp = timestamp ? timestamp.toMillis() : Date.now();

  div.setAttribute('timestamp', timestamp);
  div.setAttribute('id', id);
  div.setAttribute('name', pokemon.name);
  div.setAttribute('type', pokemon.type);
  div.setAttribute('strength', pokemon.attack);
  div.setAttribute('battleorder', pokemon.battle_order);

  // figure out where to insert new message
  const existingMessages = deckListElement.children;
  if (existingMessages.length === 0) {
  deckListElement.appendChild(div);
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

    deckListElement.insertBefore(div, messageListNode);
  }

  return div;
}

function displayPokemon(id, gym, pokemon) {
  var div = document.getElementById(id) || createAndInsertPokemon(id, gym, pokemon);

	displayGymName(gym);

  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
}

function displayGymName(gym){


	var refToWelcome = document.getElementById('gym_tag');

	var WELCOME = '<div class="value"><br><br>Welcome ' + gym.name+ ' to the battle area!<br>'+
	'The pokemons of your deck will battle in the following order.</div>'

	refToWelcome.innerHTML = WELCOME;
}

function displayRefToNextPage(gymTag) {
  var refToNextPageElement = document.getElementById('ref_to_next_page');

/*
  var REF_NEXT_PAGE = '<script>'+
											'socket= new WebSocket(\'ws://localhost:9001/\');'+
											'socket.onmessage= function(s) {'+
											'window.location.href=\'pokemon_select_attacking_gym.html?attacking_gym='+ gymTag +
											'&defending_gym=\' +s.data;' +
											'};' +
											'</script>';
*/

		var REF_NEXT_PAGE = '<script>'+
										'alert(\'test met data\');'+
										'</script>';

      refToNextPageElement.innerHTML = REF_NEXT_PAGE;
}


// Shortcuts to DOM Elements.
var deckListElement = document.getElementById('deck');

// We load currently existing chat messages and listen to new ones.
loadDeck();
