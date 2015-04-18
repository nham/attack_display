var renderGameState = function(state) {
    var phaseName, phaseContent;
    if(state.phase === 0) {
        phaseName = "Determine order";
        phaseContent = "#start_content";
    } else if(state.phase === 1) {
        // hide new player form if the game has started
        $("#add_player").hide();

        phaseName = "Setup";
        phaseContent = "#setup_content";
    } else {

        phaseName = "Round " + state.phase_data.round
                   + ", Turn " + state.phase_data.turn;
        phaseContent = "#turn_content";
    }

    $("#phase_name").text(phaseName);
    $("#phase_content").html( $(phaseContent).html() );

    // remove old players
    $("table tr.player").remove();
    $.each(state.players, function(i, p) {
        $("#players").append('<tr class="player"><td>'+p.name+'</td>'
             +'<td class="pp">'+p.pp+'</td>'
             +'<td class="regions">'+p.regions+'</td></tr>');
    });
};


$("#new_player_name").keyup(function (e) {
    if (e.keyCode == 13) {
        var new_name = $(this).val();
        state.players.push({name: new_name, pp: 30, regions: 4});
        $(this).val('');
        renderGameState(state);
    }
});

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
