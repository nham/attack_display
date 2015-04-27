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
