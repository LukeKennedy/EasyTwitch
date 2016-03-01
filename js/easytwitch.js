const twitchApiUrl = 'https://api.twitch.tv/kraken/';
const twitchPlayerUrl = 'http://player.twitch.tv/?channel=';
const twitchClientId = 'sxbdsatun8a9nrvm1z79rxho4elyyhv'; // The public part.

var currentChannelName;
var playerActive = false;
var player;

function listChannels(game) {
    $.getJSON(twitchApiUrl + "streams?game=" + game,
        function (data) {
            var channelList = $('#channel-list');
            var cleanGameName = decodeURIComponent(game);
            channelList.html('<h1>Channels broadcasting ' + cleanGameName + '</h1>');
            if (data.streams.length === 0) {
                channelList.append("No results found.");
                return;
            }

            //var gameImg = 'http://static-cdn.jtvnw.net/ttv-boxart/' + game + '-272x380.jpg';
            //channelList.append('<div><img src="' + gameImg + '" class="center-block"/></div>');

            var channels = [];
            $.each(data.streams, function (position, channel) {
                var displayName = channel.channel.display_name;
                var newEntry = "<div id='" + displayName + '\' class="channel-div col-md-6">'
                    + "<div class='channel-title'>"
                    + '<b>' + displayName + '</b> playing ' + channel.channel.game + '<br/>'
                    + channel.channel.status //.substring(0, 30)
                    + '</div>'
                    + '<img class="channel-img" src="' + channel.preview.medium + '" alt="' + displayName + '"/>'
                    + '</div>';
                channels.push(newEntry);
            });

            channelList.append(channels.join(""));

            // Add action listeners
            $('.channel-div').click(function () {
                watchChannel($(this).attr("id"));

            });
        });
}

function watchChannel(channel) {
    if (currentChannelName == channel && playerActive) {
        return;
    }

    currentChannelName = channel;
    if(playerActive && player != null) {
        player.setChannel(channel);
        return;
    }

    var container = $('#player-container');
    container.html("");
    var playerWidth = container.width() * .8;
    var playerHeight = playerWidth * 9 / 16;
    var options = {
        width: playerWidth ,
        height: playerHeight,
        channel: channel
    };
    console.log(options);
    player = new Twitch.Player("player-container", options);
    container.children().attr("id", "player");
    $('#stop-player-button').show();
    container.show();
    playerActive = true;
}

$(document).ready(function () {
    // Add action listeners here
    $("#clear-button").click(function () {
        $("#channel-list").html("");
    });

    $("#search-games-button").click(function () {
        listChannels($("#game-name").val());
    });

    var stopButton = $("#stop-player-button");
    stopButton.click(function () {
        var container = $('#player-container');
        container.hide();
        container.html("");
        $(this).hide();
        playerActive = false;
    });

    $("#game-name").keydown(function (event) {
        var keypressed = event.keyCode || event.which;
        if (keypressed == 13) {
            listChannels($(this).val());
        }
    });

    $("#player-container").hide();
    stopButton.hide();

    var loginButton = $('.twitch-connect');
    loginButton.hide();
    Twitch.init({clientId: twitchClientId}, function (error, status) {
        if (error) {
            // error encountered while loading
            console.log(error);
        }
        // the sdk is now loaded
        if (status.authenticated) {
            // user is currently logged in
            loginButton.hide();
        }
    });

    loginButton.click(function () {
        Twitch.login({
            scope: ['user_read', 'channel_read']
        });
    });

    listChannels('Dark%20Souls');
});