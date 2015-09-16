
var jsonData, interval;

var activities, intervals, workoutLength;

var ROUND_OVER = "Round over.",
    WORKOUT_CANCELLED = "Workout cancelled.",
    ACTIVITY_OVER = "Done";

$(function () {

    $("#round, #break, #intervals, #type").buttonset();

    $("button")
        .button()
        .click(function (event) {
            event.preventDefault();
        });

    $("#rate").slider({
        range: "max",
        min: 0,
        max: 2,
        value: 1.2,
        step: 0.01
    });

    $("#type :radio").change(function () {
        var acts = getSelectedActivities(jsonData);
        renameActivities(acts);
    });

    $("#start").click(function () {
        beginRound();
    });

    $('#aboutDialog').dialog({
        modal: true,
        autoOpen: false,
        width: 400,
        buttons: {
            Ok: function () {
                $(this).dialog("close");
            }
        }
    });

    $('#about').click(function () {
        $('#aboutDialog').dialog('open');
        return false;
    });

    $('#sorry').dialog({
        modal: true,
        autoOpen: false,
        width: 400,
        buttons: {
            Ok: function () {
                $(this).dialog("close");
            }
        }
    });

    $.ajax({
        type: "GET",
        url: "activities.json",
        dataType: "json",
        success: function (d) { jsonData = d; renameActivities(getSelectedActivities(jsonData)); }
    });


    if (window.SpeechSynthesisUtterance === undefined) {
        $('#sorry').dialog('open');
    }


    function beginRound() {

        // defined here so that the user can change them on the fly
        activities = getActivities();
        intervals = getIntervals();
        workoutLength = +getRoundLength() * 60;

        clearInterval(interval);

        var activityDuration = 5;
        var timeElapsed = 0;

        say("Starting in " + activityDuration + " seconds.");

        var loop = function () {
            clearInterval(interval);


            if (timeElapsed >= workoutLength || activities.length < 1) {
                beginBreak();
                return;
            }

            if (timeElapsed > 0) say(ACTIVITY_OVER);

            activityDuration = +getInterval();
            timeElapsed += activityDuration;

            say(getCommand(activityDuration));
            interval = setInterval(loop, activityDuration * 1000);
        };

        interval = setInterval(loop, activityDuration * 1000);

    }

    $("#end").click(function () {
        window.speechSynthesis.cancel();
        clearInterval(interval);
        say(WORKOUT_CANCELLED);
    });

    function say(text) {
        var msg = new SpeechSynthesisUtterance();
        var voices = window.speechSynthesis.getVoices();
        msg.voiceURI = 'native';
        msg.volume = 1;
        msg.rate = getSpeechRate();
        msg.text = text;
        msg.lang = 'en-US';

        console.log('"' + text + '"');
        speechSynthesis.speak(msg);
    }

    function getActivity() {
        return activities[Math.floor(Math.random() * activities.length)];
    }

    function getInterval() {
        return intervals[Math.floor(Math.random() * intervals.length)];
    }

    function getCommand(time) {
        var activity = getActivity();
        activities.remove(activity);
        return time + " seconds of " + activity;
    }

    function beginBreak() {
        window.speechSynthesis.cancel();
        say(ROUND_OVER + " " + getBreakLength.toString() + " second break.");
        window.setTimeout(beginRound, +getBreakLength() * 1000)
    }

    function getActivities() {
        return $("#activities").val()
            .split("\n")
        // remove empty/null/undefined components
            .filter(function (e) { return e === 0 || e });
    }

    function getIntervals() {
        return $('#intervals input:checkbox:checked').map(function () {
            return +this.value;
        }).get();
    }

    function getRoundLength() {
        return +$("#round input:radio:checked").val();
    }

    function getBreakLength() {
        return +$("#break input:radio:checked").val();
    }

    function getSpeechRate() {
        return +$("#rate").slider("values", 0);
    }

    Array.prototype.remove = function () {
        var what, a = arguments,
            L = a.length,
            ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };


    function getSelectedActivities(activities) {
        var selected = $("#type :radio:checked").val();
        return activities[selected];
    }

    function renameActivities(activities) {

        $("#activities").text("");

        for (var i = 0; i < activities.length; i++) {
            $("#activities").append(activities[i] + "\n");
        }

        $("#activities").attr("rows", activities.length + 1);
    }

});
