var first = null,
    second = null,
    key = null;
error = "SOMETHING WENT WRONG! CONTACT SUPPORT.",
    aborted = "PROCEDURE ABORTED!";

$(document).ready(function () {
    chrome.runtime.onMessage.addListener(gotMessage);

    function gotMessage(message, sender, sendResponse) {
        if (!message.key) {
            return false;
        }

        key = message.key;
        if (confirm("Press a title!")) {
            firstClick();
        } else {
            alert(aborted);
        }
    }
});

function firstClick() {
    $("body").on("click.first", function (event) {
        event.preventDefault();
        first = event;
        $("body").off("click.first");

        if (confirm("Press an image")) {
            secondClick();
        } else {
            alert(aborted);
        }
    });
}

function secondClick() {
    $("body").on("click.second", function (event) {
        event.preventDefault();
        second = event;
        $("body").off("click.second");

        if (confirm("Send data?")) {
            Plugin.api.sendNewSite(window.location.href, first, second, key);
        } else {
            alert(aborted);
        }
    });
}

