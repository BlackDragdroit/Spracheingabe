function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    document.addEventListener("menubutton", onMenuKeyDown, false);
}

function onPause() {
}

function onResume() {
}

function onMenuKeyDown() {
}

window.addEventListener("cordovacallbackerror", function (event) {
});