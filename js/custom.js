Plugin.dbs.open();

var keyForm = $("#keyForm"),
    keyInput = $("#apiKey"),
    startForm = $("#startForm"),
    authKey = null;

function hideKeyForm() {
    if (keyInput.val() !== null) {
        keyForm.hide();
        startForm.show();
    }
}

function sendMsg(tabs) {
    let msg = {
        key: keyInput.val()
    };
    chrome.tabs.sendMessage(tabs[0].id, msg);
}

$(document).ready(function () {

    Plugin.dbs.getKeys(); // get keys from db
    keyInput.change(function () { // set key is any saved
        hideKeyForm();
    });

    keyForm.submit(function (e) { // save key form
        e.preventDefault();
        Plugin.dbs.addKey($("#key").val());
    });

    startForm.submit(function (e) {
        e.preventDefault();
        chrome.tabs.query({active: true, currentWindow: true}, sendMsg);
    })
});

