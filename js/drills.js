
var csvData, interval;

var activities, intervals, workoutLength;

var ROUND_OVER = "Round over.", 
    WORKOUT_CANCELLED = "Workout cancelled.", 
    ACTIVITY_OVER = "Done";

$(function () {

    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        // At least Safari 3+: "[object HTMLElementConstructor]"
    var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
    var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

    if (!isChrome && !isSafari) {
        alert("Sorry, speech synthesis is not supported on your browser... Try using Chrome or Safari for iOS7.");
    }

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
        value: 1.1,
        step: 0.01
    });

    $("#type :radio").change(function () {
        var acts = getActivityBank(csvData);
        loadActivities(acts);
    });

    $("#start").click(function () {
        beginRound();
    });

    $('#wrapper').dialog({
        autoOpen: false,
        width:400
    });
    
    $('#about').click(function() {
        $('#wrapper').dialog('open');
        return false;
    });

    $.ajax({
        type: "GET",
        url: "data/activities.csv",
        dataType: "text",
        success: function (d) { csvData = d; loadActivities(getActivityBank(csvData)); }
    });

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
        say(ROUND_OVER);
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


    function getActivityBank(d) {
        var a = $.csv.toObjects(d);
        var selected = $("#type :radio:checked").val();

        var selected_a = [];
        for (var i = 0; i < a.length; i++) {
            selected_a.push(a[i][selected])
        }

        return selected_a.filter(function (n) { return n != undefined && n != "" });
    }

    function loadActivities(activities) {

        $("#activities").text("");

        for (var i = 0; i < activities.length; i++) {
            $("#activities").append(activities[i] + "\n");
        }

        $("#activities").attr("rows", activities.length + 1);
    }

});
