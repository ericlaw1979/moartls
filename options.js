"use strict";

document.addEventListener('DOMContentLoaded', function() {
    const storage = (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);
    storage.get(null, function(prefs) 
    {
        document.getElementById("cbRotateImages").checked = !(prefs && (false === prefs["bRotateNonSecureImages"]));
        document.getElementById("cbWarnOnNonSecureDownloads").checked = (prefs && (true === prefs["bWarnOnNonSecureDownloads"]));
        document.getElementById("cbWarnOnNonSecureDocument").checked = !(prefs && (false === prefs["bWarnOnNonSecureDocument"]));
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
    const cbWarnOnNonSecureDocument = document.getElementById("cbWarnOnNonSecureDocument");
    const storage = (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);
    const oSettings =
                {"bRotateNonSecureImages": cbRotateImages.checked,
                 "bWarnOnNonSecureDownloads": cbWarnOnNonSecureDownloads.checked,
                 "bWarnOnNonSecureDocument": cbWarnOnNonSecureDocument.checked
                };
    console.log(JSON.stringify(oSettings));
    storage.set(oSettings, null);

    status.textContent = "Saved";

    setTimeout(function() { status.innerHTML = "&nbsp;"; }, 450);
}

//    document.getElementById("btnSave").addEventListener('click', function() {
