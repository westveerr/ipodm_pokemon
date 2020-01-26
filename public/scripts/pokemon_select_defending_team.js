
'use strict';

var defOrderPosition = 0;

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

	var defRfidTag = getQueryVariable('defending_gym');
  var attRfidTag = getQueryVariable('attacking_gym');
	//var defRfidTag = "765973474269";
  //var attRfidTag = "895034544849";

  var divAttRfidTag = document.getElementById('att_rfid_tag');
  divAttRfidTag.setAttribute('data_value', attRfidTag);


	db.collection("gyms").where("rfid", "==", defRfidTag)
		.get()
		.then(function(querySnapshot) {
				querySnapshot.docChanges().forEach(function(doc) {
						var gym = doc.doc.data();
						console.log("bij load " + gym.order_position);

					  db.collection("gyms").where("rfid", "==", defRfidTag)
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

					                    displayPokemon(change.doc.id, gym, pokemon);
					                }
					              });
					            });
					        });
					    })
					    .catch(function(error) {
					        console.log("Error getting documents: ", error);
					    });
						});
	 })
	 .catch(function(error) {
	 	console.log("Error getting documents: ", error);
	 });

}

function onOrderFormSubmit(e) {
	e.preventDefault();

	console.log('hier dan');

  var defGymTag;
  var defPokemon1 = new Object();
  var defPokemon2 = new Object();
  var defPokemon3 = new Object();

  var countPokemon = 0;

  //getting the defense values
  const defPokemons = deckListElement.children;

  if (defPokemons.length === 0) {
      console.log('leeg');
  } else {

      let defPokemonsListNode = defPokemons[0];

			defOrderPosition = (defOrderPosition+1) % 6;

			defPokemonsListNode.setAttribute('order_position', defOrderPosition);


			var testOrder = defPokemonsListNode.getAttribute('order_position')-0;

      while (defPokemonsListNode) {

          defGymTag = defPokemonsListNode.getAttribute('gymtag');


          if(countPokemon == 0) {
            defPokemon1.id = defPokemonsListNode.getAttribute('id');
          }
          if(countPokemon == 1) {
            defPokemon2.id = defPokemonsListNode.getAttribute('id');
          }
          if(countPokemon == 2) {
            defPokemon3.id = defPokemonsListNode.getAttribute('id');
          }

          countPokemon += 1;
          defPokemonsListNode = defPokemonsListNode.nextSibling;
      }
    }

    saveDeck(defGymTag, defOrderPosition, defPokemon1, defPokemon2, defPokemon3);
}

function saveDeck(gymTag, defOrderPosition, pokemon1, pokemon2, pokemon3) {

	switch(defOrderPosition){
			case 0:
				pokemon1.battleOrder = 1
				pokemon2.battleOrder = 2
				pokemon3.battleOrder = 3
				break;
			case 1:
				pokemon1.battleOrder = 2
				pokemon2.battleOrder = 3
				pokemon3.battleOrder = 1
				break;
			case 2:
				pokemon1.battleOrder = 3
				pokemon2.battleOrder = 1
				pokemon3.battleOrder = 2
				break;
			case 3:
				pokemon1.battleOrder = 2
				pokemon2.battleOrder = 1
				pokemon3.battleOrder = 3
				break;
			case 4:
				pokemon1.battleOrder = 1
				pokemon2.battleOrder = 3
				pokemon3.battleOrder = 2
				break;
			case 5:
				pokemon1.battleOrder = 3
				pokemon2.battleOrder = 2
				pokemon3.battleOrder = 1
				break;
	}

  firebase.firestore().collection("gyms").where("gym_tag", "==", gymTag)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {

					firebase.firestore().collection("gyms").doc(doc.id).update({order_position: defOrderPosition});

          firebase.firestore().collection('gyms').doc(doc.id).collection('pokemons').doc(pokemon1.id).update({
              battle_order: pokemon1.battleOrder
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
  const container = document.createElement('div');

	var imageUrl = '/images/pokemon/'+ pokemon.number +'.png';

	var DECK =
	'<div class="pokemon_container">' +
	  '<div></div><table border=0><tr>' +
		'<td width="200"><img src=' + imageUrl + ' width=125 height=125></td>' +
		'<td width="500"><table border=0><tr>'+
		'<tr><td>name:</td><td class="value">' + pokemon.name + '</td></tr>' +
		'<tr><td>Type:</td><td class="value">' + pokemon.type + '</td></tr>' +
		'<tr><td>Strength:</td><td class="value">' + pokemon.defense +'</td></tr></table>' +
		'<td width="340" valign="center" align="center" class="battle_label">Will appear in battle round </br>' + pokemon.battle_order +'</td>' +
	'</tr></table></div>';

  container.innerHTML = DECK;
  const div = container.firstChild;
  div.setAttribute('id', id);

  var timestamp = pokemon.timestamp;

  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute('gymTag', gym.gym_tag);
  div.setAttribute('timestamp', timestamp);
  div.setAttribute('id', id);
  div.setAttribute('name', pokemon.name);
  div.setAttribute('type', pokemon.type);
  div.setAttribute('strength', pokemon.defense);

  const existingMessages = deckListElement.children;

	if (existingMessages.length === 0) {
  	deckListElement.appendChild(div);

  } else {

    let messageListNode = existingMessages[0];


    while (messageListNode) {


      messageListNode = messageListNode.nextSibling;
    }
    deckListElement.insertBefore(div, messageListNode);
	}

  return div;
}

function removeOldPokemon(id){

	var div = document.getElementById(id);
	if (div) {
		div.parentNode.removeChild(div);
	}
}

function displayPokemon(id, gym, pokemon) {
	removeOldPokemon(id);

	var div = createAndInsertPokemon(id, gym, pokemon);

  var messageElement = div.querySelector('.pokemon');

	displayGymName(gym);

	displayRefToNextPage(gym)

  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
}

function displayGymName(gym){


	var refToWelcome = document.getElementById('gym_tag');

	var WELCOME = '<div class="value"><br><br>Welcome ' + gym.name+ ' to the battle area!<br>'+
	'The pokemons of your deck will battle in the following order.</div>'

	refToWelcome.innerHTML = WELCOME;
}

function displayRefToNextPage(gym) {
  var refToNextPageElement = document.getElementById('ref_to_next_page');

  //var attRfidTag = document.getElementById('att_rfid_tag').getAttribute('data_value', attRfidTag);
	var attRfidTag = getQueryVariable('attacking_gym');

  var REF_NEXT_PAGE = '<a href="pokemon_battle.html?attacking_gym='+
      attRfidTag +
      '&defending_gym=' + gym.rfid +
      '">' +
      '<img src="images/FriendlyBattleButton.png"></a>';

      refToNextPageElement.innerHTML = REF_NEXT_PAGE;
}

function redirect()
{
	  document.forms[0].submit;
}

// Shortcuts to DOM Elements.
var deckListElement = document.getElementById('deck');
var orderFormElement = document.getElementById('order-form');
//var orderButtonElement = document.getElementById('submit');

// Saves message on form submit.
orderFormElement.addEventListener('submit', onOrderFormSubmit);

// We load currently existing chat messages and listen to new ones.
loadDeck();
