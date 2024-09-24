"use strict"

// Background serviceworker
// https://developer.chrome.com/extensions/event_pages

// Our background sw isn't persistent.
chrome.runtime.onStartup.addListener(()=> { init(); });
// onInstalled when user uses chrome://extensions page to reload
chrome.runtime.onInstalled.addListener(() => { init(); });

function init()
{
  // Add Badge notification if this is a dev-install
  chrome.management.getSelf( (o)=>{
        if (o.installType === "development") {
          chrome.action.setBadgeText( {text: "dev"} );
        } 
  });
}

chrome.downloads.onCreated.addListener(function(item) {
    // https://developer.chrome.com/extensions/downloads#type-DownloadItem

    // Note: The download manager "creates" downloads for previously-downloaded items
    // So we need to look for "in_progress" downloads only.
    //
    // TODO: Can we do anything useful with the item.mime property?
    //
    if (item.state == "in_progress") {
        const storage = (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);
        storage.get(["bWarnOnNonSecureDownloads"], function(bWarnOnNonSecureDownloads) {
            if (!bWarnOnNonSecureDownloads) return;

            if ((item.url.substring(0, 5) == "http:") || 
                (item.referrer && item.referrer.substring(0, 5) == "http:"))
            {
                var sReferer = (item.referrer) ? ("\nvia\n" + item.referrer) : "";
                
                // Manifest v3 does not support alert(), so we need to use a notification.
                var options = {
        			type: 'basic',
        			title: 'Non-Secure Download was detected',
        			message: `Download of:\n${item.url}${sReferer}`,
        			iconUrl: 'images/icon128.png'
        		};
		        chrome.notifications.create(options);
            }
        });
    }
});