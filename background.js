"use strict"

// Background page
// https://developer.chrome.com/extensions/event_pages

// Our background page isn't persistent.
chrome.runtime.onStartup.addListener(()=> { init(); });
// onInstalled when user uses chrome://extensions page to reload
chrome.runtime.onInstalled.addListener(() => { init(); });

function init()
{
  // Add Badge notification if this is a dev-install
  chrome.management.getSelf( (o)=>{
        if (o.installType === "development") {
          chrome.browserAction.setBadgeText( {text: "dev"} );
        } 
  });
}

// TODO: It feels like this should live in the init function above
// but somehow it works even without that...
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