var renderGameState = function(state) {
    var statusText;
    if(jQuery.isEmptyObject(state.step)) {
        statusText = "Setup";
    } else {
        // hide new player form if the game has started
        $("#add_player").hide();

        statusText = "Round " + state.step.round
                   + ", Turn " + state.step.turn;
    }

    $("#status_text").text(statusText);

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
    if(jQuery.isEmptyObject(state.step)) {
        state.step = {round: 1, turn: 1};
    } else {
        if(state.step.turn === 3) {
            state.step = {round: state.step.round + 1, turn: 1}
        } else {
            state.step.turn = state.step.turn + 1;
        }
    }

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
    // [] to begin with
    // after setup, step becomes [r, t]
    // r is round number, t is turn number
    step: {},

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
