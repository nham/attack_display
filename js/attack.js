// From http://stackoverflow.com/a/2450976/3109948
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


// We call this whenever the state changes.
// I think this is an ad-hoc, buggy, half-implementation
// of React. Oh well.
var renderGameState = function(state) {
    var phaseName, phaseInfo, phaseUI;
    if(state.phase === 0) {
        phaseName = "Determine order";
        phaseInfo = "#start_info";
        phaseUI = null;
    } else if(state.phase === 1) {
        // hide new player form if the game has started
        $("#add_player").hide();

        phaseName = "Setup";
        phaseInfo = "#setup_info";
        phaseUI = null;
    } else {

        phaseName = "Round " + state.phase_data.round
                   + ", Turn " + state.phase_data.turn;
        phaseInfo = "#turn_info";
        phaseUI = "#turn_ui";
    }

    $("#phase_name").text(phaseName);
    $("#phase_info").html( $(phaseInfo).html() );

    if(phaseUI !== null) {
        $("#phase_ui").hide();
        // remove old players
        $("table#turn_players tr").remove();
        build_turn_ui(phaseUI, state);
        $("#phase_ui").show();
    } else {
        $("#phase_ui").hide();
    }

    // remove old players
    $("table tr.player").remove();
    $.each(state.players, function(i, p) {
        $("#players").append('<tr class="player"><td>'+p.name+'</td>'
             +'<td class="pp">'+p.pp+'</td>'
             +'<td class="regions">'+p.regions+'</td></tr>');
    });
};


/*** Turn UI ***/

// Transition to the next phase of the game via button click
$(document).on("click", "button#det_turn_order", function() {
    // grab everyone's action.
    var actions = [];
    var gotNaN = false;
    $("div#phase_ui select.turn_action_select").each(function(i) {
        var i = parseInt( $(this).val() );
        if(isNaN(i)) { gotNaN = true; }
        actions.push(i);
    });

    if(!gotNaN) {
        for(var i = 0; i < actions.length; i++) {
            actions[i] = [i, actions[i]];
        }

        var tiebreaker = [null];

        for(var i = 0; i < 6; i++) {
            tiebreaker.push([]);
        }

        for(var i = 0; i < actions.length; i++) {
            var current = actions[i];
            var this_action = current[1];
            tiebreaker[this_action].push(current[0]);
        }

        for(var i = 1; i <= 6; i++) {
            shuffle(tiebreaker[i]);
        }

        actions.sort(function(a, b) {
            if(a[1] < b[1]) {
                return -1;
            } else if(a[1] > b[1]) {
                return 1;
            } else {
                var action = a[1];
                var tb = tiebreaker[action];
                console.log("tiebreaker["+action+"] = "+tb);
                var a_index = tb.indexOf(a[0]);
                var b_index = tb.indexOf(b[0]);

                if(a_index < b_index) {
                    return -1;
                } else if(a_index > b_index) {
                    return 1;
                } else {
                    alert("reached tie when sorting players "+a[0]+" and "+b[0]);
                }
                return 0;
            }

        });

        // sorry, this is gross
        var action_names = [null, "Trade", "Strategic Move",
                            "Diplomatic Blitz", "Move and Attack!",
                            "Blitzkrieg Move", "Build New Units"];

        // let j be the index such that xs[j] = [i, <a value>]
        // (if it exists)
        // then find_index(xs, i) returns [j, <the value>]
        var find_index = function(xs, i) {
            for(var j = 0; j < xs.length; j++) {
                if(xs[j][0] === i) {
                    return [j, xs[j][1]];
                }
            }

            return null;
        };

        var find_value = function(xs, i) {
            return find_index(xs, i)[1];
        }

        // replace the selects with text
        $("table#turn_players td.turn_action").each(function(i) {
            var tmp = find_index(actions, i);
            var new_order = tmp[0];
            var player_action = tmp[1];

            // remove select elements
            $(this).children().remove();

            // replace with text of the action taken
            $(this).text(action_names[player_action]);

            // attach order as a data element to parent (tr)
            $(this).parent().data("new_order", new_order);
        });

        // actually re=order the tr elements
        var trs = $("table#turn_players tr");
        trs.sort(function(a, b) {
            var x = $(a).data("new_order");
            var y = $(b).data("new_order");
            if(x < y) {
                return -1;
            } else if (x > y) {
                return 1;
            } else {
                return 0;
            }
        });

        trs.detach().appendTo("table#turn_players");

        // finally, hide the button. dont need it any more.
        $("button#det_turn_order").hide();
    }
});


var build_turn_ui = function(phaseUI, state) {
    // set up initial UI Html
    $("#phase_ui").html( $(phaseUI).html() );

    // add players to the "turn action table"
    $.each(state.players, function(i, p) {
        $("#turn_players").append('<tr class="turn_player"><td>'+p.name+'</td>'
             +'<td class="turn_action"></td></tr>');
    });

    // now put in the drop downs
    var action_sel = $("#action_select_template").clone().removeAttr('id');
    $("#turn_players td.turn_action").html( action_sel );
};


// Submit the New Player Name text input via enter key
$("#new_player_name").keyup(function (e) {
    if (e.keyCode == 13) {
        var new_name = $(this).val();
        state.players.push({name: new_name, pp: 30, regions: 4});
        $(this).val('');
        renderGameState(state);
    }
});

// Transition to the next phase of the game via button click
$("button#step").click(function() {
    if(state.phase === 1) {
        state.phase_data = {round: 1, turn: 1};
    } else {
        if(state.phase_data.turn === 3) {
            state.phase_data = {round: state.phase_data.round + 1, turn: 1}
        } else {
            state.phase_data.turn = state.phase_data.turn + 1;
        }
    }

    state.phase += 1;
    renderGameState(state);
});

$(document).on("dblclick", "td.pp", function() {
    var val = $(this).text();
    $(this).html('<input type="text" class="input_pp" value="'+val+'">');
});

$(document).on("dblclick", "td.regions", function() {
    var val = $(this).text();
    $(this).html('<input type="text" class="input_regions" value="'+val+'">');
});


// For submitting new value by blurring focus
$(document).on("blur", "table input", function() {
    // This sucks
    var i = $(this).parent().parent().prevAll().length - 1;

    if($(this).hasClass("input_pp")) {
        state.players[i].pp = $(this).val();
    } else {
        state.players[i].regions = $(this).val();
    }
    renderGameState(state);
});


// For submitting new value by pressing enter
$(document).on("keyup", "table input", function(e) {
    if (e.keyCode == 13) {
        // This sucks
        var i = $(this).parent().parent().prevAll().length - 1;

        if($(this).hasClass("input_pp")) {
            state.players[i].pp = $(this).val();
        } else {
            state.players[i].regions = $(this).val();
        }
        renderGameState(state);
    }
});

// initial state
var state = {
    // phase 0 = roll for order
    // phase 1 =  claim territories, place initial  units
    // phase 2 and above = turns
    phase: 0,
    phase_data: {},

    // array of players. each player has a name, PP and number of regions
    // owned. this is 30 and 4, respectively, to start out
    /*
    players: [
        {name: 'Nick', pp: 43, regions: 8},
        {name: 'Andy', pp: 53, regions: 12},
        {name: 'Mike', pp: 34, regions: 7},
        {name: 'Kodi', pp: 43, regions: 9}
    ],
    */

    players: [],
};

renderGameState(state);
