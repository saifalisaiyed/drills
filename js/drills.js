
var interval;

var actions;
var intervals;
var workoutLength;

var ROUND_OVER = "Round over.";
var WORKOUT_CANCELLED = "Workout cancelled.";
var ACTIVITY_OVER = "Done";

$("#start").click(function () {
    go();
});

function go(){
  
    actions = getActions();
    intervals = getIntervals();
    workoutLength = +getRoundLength() * 60;

    clearInterval(interval);

    var duration = 5;
    var elapsed = 0;

    say("Starting in " + duration + " seconds.");

    var loop = function () {
        clearInterval(interval);

        if (elapsed > workoutLength || actions.length < 1) {
            endRound();
            return;
        }

        if (elapsed > 0) say(ACTIVITY_OVER);

        duration = +getInterval();
        elapsed += duration;

        say(getCommand(duration));
        interval = setInterval(loop, duration * 1000);
    };

    interval = setInterval(loop, duration * 1000);

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

function getAction() {
    return actions[Math.floor(Math.random() * actions.length)];
}

function getInterval() {
    return intervals[Math.floor(Math.random() * intervals.length)];
}

function getCommand(time) {
    var action = getAction();
    actions.remove(action);
    return time + " seconds of " + action;
}

function endRound() {
    window.speechSynthesis.cancel();
    say(ROUND_OVER);
    window.setTimeout(go, +getBreakLength() * 1000 )
}

function getActions() {
    return $("#actions").val()
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

