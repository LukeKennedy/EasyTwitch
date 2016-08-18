const twitchApiUrl = 'https://api.twitch.tv/kraken/';
const twitchClientId = '6bxshimxrq0f8o431ez89aos2fx9c39';

var currentChannelName;
var playerActive = false;
var player;

function showChannelList(data) {
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
    return channels;
}

function listFollowedChannels() {
    Twitch.api({method: 'streams/followed'}, function (error, data) {
        var channelList = $('#channel-list');
        channelList.html('<h1>Followed Channels</h1>');
        if (data.streams.length === 0) {
            channelList.append("No results found.");
            return;
        }
        channelList.append(showChannelList(data).join(""));
        // Add action listeners
        $('.channel-div').click(function () {
            watchChannel($(this).attr("id"));
        });
    });
}


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

            channelList.append(showChannelList(data).join(""));
            // Add action listeners
            $('.channel-div').click(function () {
                watchChannel($(this).attr("id"));
            });
        });
}

function watchChannel(channel) {
    if (currentChannelName == channel && playerActive) {
        goToPlayer();
        return;
    }

    currentChannelName = channel;
    if (playerActive && player != null) {
        player.setChannel(channel);
        goToPlayer();
        return;
    }

    var container = $('#player-container');
    container.removeClass('hidden');
    container.html("");
    var playerWidth = container.width() * .9;
    var playerHeight = playerWidth * 9 / 16;
    var options = {
        width: playerWidth,
        height: playerHeight,
        channel: channel
    };
    console.log(options);
    player = new Twitch.Player("player-container", options);
    player.setQuality("chunked"); // Set to Source quality.
    container.children().attr("id", "player");
    $('#stop-player-button').removeClass('hidden');
    playerActive = true;
    //window.location.hash = '#player-container';
    goToPlayer();
}

function goToPlayer() {
    scroll("player-container");
}

function scroll(element) {
    var ele = document.getElementById(element);
    window.scrollTo(0, ele.offsetTop);
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
        container.addClass('hidden');
        container.html("");
        $(this).addClass('hidden');
        playerActive = false;
    });

    $("#game-name").keydown(function (event) {
        var keypressed = event.keyCode || event.which;
        if (keypressed == 13) {
            listChannels($(this).val());
        }
    });

    $("#player-container").addClass('hidden');
    stopButton.addClass('hidden');

    $('#login-button').click(function () {
        Twitch.login({
            scope: ['user_read', 'user_subscriptions']
        });
    });

    $('#logout-button').click(function () {
        Twitch.logout(function (error) {
            // the user is now logged out
        });
        showLoginStatus(false);
        $("#channel-list").html("");
    });

    $('#following-button').click(function () {
        listFollowedChannels();
    });

    // Initialize the Twitch SDK
    Twitch.init({clientId: twitchClientId}, function (error, status) {
        if (error) {
            // error encountered while loading
            console.log(error);
        }
        // the sdk is now loaded
        showLoginStatus(status.authenticated);
    });
});

function showLoginStatus(isLoggedIn) {
    if (isLoggedIn) {
        // user is currently logged in
        $('#login-menu').addClass('hidden');
        $('#user-status-dropdown').removeClass('hidden');

        Twitch.api({method: 'user'}, function (error, user) {
            $('#login-status').text(user.display_name);
            listFollowedChannels();
        });

    } else {
        $('#login-menu').removeClass('hidden');
        $('#user-status-dropdown').addClass('hidden');
        $('#login-status').text("");
    }
}