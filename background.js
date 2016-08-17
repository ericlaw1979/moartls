"use strict"

// Background
// https://developer.chrome.com/extensions/event_pages

chrome.downloads.onCreated.addListener(function(item) {
    // https://developer.chrome.com/extensions/downloads#type-DownloadItem
    // https://src.chromium.org/viewvc/chrome/trunk/src/chrome/common/extensions/docs/examples/api/downloads/download_manager/background.js

    // Note: The download manager "creates" downloads for previously-downloaded items
    // So we need to look for "in_progress" downloads only.
    //
    // TODO: Can we do anything useful with the item.mime property?
    //
    if (item.state == "in_progress") {
        chrome.storage.sync.get("bWarnOnNonSecureDownloads", function(obj) {
            if (!(obj && (true === obj.bWarnOnNonSecureDownloads))) return;
            if ((item.url.substring(0, 5) == "http:") || 
                (item.referrer && item.referrer.substring(0, 5) == "http:"))
            {
                var sReferer = (item.referrer) ? ("\n\nvia\n\n  " + item.referrer) : "";
                alert("Non-secure download of: \n\n  " + item.url + sReferer + "\n");
            }
        });
    }
});