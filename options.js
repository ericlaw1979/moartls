"use strict";

document.addEventListener('DOMContentLoaded', function() {
    const storage = (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);
    storage.get(null, function(prefs) 
    {
        document.getElementById("cbRotateImages").checked = !(prefs && (false === prefs["bRotateNonSecureImages"]));
        document.getElementById("cbWarnOnNonSecureDownloads").checked = (prefs && (true === prefs["bWarnOnNonSecureDownloads"]));
    });

    var checkboxes = document.querySelectorAll("input[type=checkbox]");
    for (let i=0; i<checkboxes.length; i++) {
        checkboxes[i].addEventListener('change', saveChanges, false);
    }

}, false);

function saveChanges() {
    const status = document.getElementById("txtStatus");
    status.textContent = "Saving...";
    const cbRotateImages = document.getElementById("cbRotateImages");
    const cbWarnOnNonSecureDownloads = document.getElementById("cbWarnOnNonSecureDownloads");
    const storage = (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);
    storage.set({"bRotateNonSecureImages": cbRotateImages.checked, 
                             "bWarnOnNonSecureDownloads": cbWarnOnNonSecureDownloads.checked}, null);

    status.textContent = "Saved";

    setTimeout(function() { status.innerHTML = "&nbsp;"; }, 450);
}

//    document.getElementById("btnSave").addEventListener('click', function() {
