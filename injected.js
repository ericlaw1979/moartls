"use strict";

{
    if (typeof chrome === "undefined") var chrome = browser;

    // Remove URI-wrappers added by e.g. hotmail
    function unwrapUri(str) {
        let sl = /https:\/\/\w+\.safelinks.protection.outlook.com.*/
        if (sl.test(str)) {
            return decodeURIComponent(str.substring(str.indexOf('url=')+4));
        }
        return str;
    }

    function isNonsecure(str) {
        str = str.toLowerCase();
        if (str.startsWith("http:") || str.startsWith("ftp:")) return true;
        return false;
    }

    function findUnsecureImages()
    {
        const imgs = document.querySelectorAll("img");
        for (let i = 0; i < imgs.length; i++) {
            if (isNonsecure(unwrapUri(imgs[i].src))) {
                arrNonSecureImages.push(imgs[i]);
            }
        }

        const imginputs = document.querySelectorAll("input[type='image']");
        for (let i = 0; i < imginputs.length; i++) {
            if (isNonsecure(unwrapUri(imginputs[i].src))) {
                arrNonSecureImages.push(imginputs[i]);
            }
        }
    }

    function markUnsecureImages()
    {
        for (let i = 0; i < arrNonSecureImages.length; i++) {
            arrNonSecureImages[i].classList.add("moarTLSUnsecure");
        }
    }

    function markUnsecureDocument()
    {
        // Entire frame is unsecure?
        const sProt = document.location.protocol.toLowerCase();
        if ((document.body) && 
            ((sProt === "http:") || (sProt === "ftp:"))) {
              document.body.classList.add("moarTLSUnsecure");
        }
    }

    const arrUnsecure = [];
    const arrNonSecureImages = [];
    let cLinks = 0;

    findUnsecureImages();

    {
        if (chrome.storage)
        {
            const storage = (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);
            storage.get("bRotateNonSecureImages", function(obj) {
              if (obj && (false === obj.bRotateNonSecureImages)) return;
              markUnsecureImages();
            });

            storage.get("bWarnOnNonSecureDocument", function(obj) {
              if (obj && (false === obj.bWarnOnNonSecureDocument)) return;
              markUnsecureDocument();
            });
        }
        else
        {
            markUnsecureImages();
        }
    }

    {
        let sSelector = "* /deep/ form[action]";
        if (typeof browser !== 'undefined') sSelector = "form[action]";
        const forms = document.querySelectorAll(sSelector);
        for (let i = 0; i < forms.length; i++) {
          const thisForm = forms[i];
          if (thisForm.getAttribute("action")[0] === "#") continue; // Not a cross-page 'action'
          cLinks++;
          const sUri = unwrapUri((typeof thisForm.action === "string") ? 
                                                    thisForm.action.toLowerCase() 
                                                  : thisForm.getAttribute("action").toLowerCase());
          if (isNonsecure(sUri)) {
            arrUnsecure.push(sUri);
            thisForm.title = "Form target is: " + sUri;
            thisForm.classList.add("moarTLSUnsecure");
          }
        }
    }

    {
        let sSelector = "* /deep/ a[href]";
        if (typeof browser !== 'undefined') sSelector = "a[href]";
        const lnks = document.querySelectorAll(sSelector);
        for (let i = 0; i < lnks.length; i++) {
          const thisLink = lnks[i];
          if (thisLink.getAttribute("href")[0] === "#") continue; // Not a cross-page 'link'
          cLinks++;
          const sUnwrapped = unwrapUri(thisLink.href);
          if (isNonsecure(sUnwrapped)) {
            arrUnsecure.push(sUnwrapped);
            const oUnwrapped = document.createElement("a");
            oUnwrapped.href = sUnwrapped;
            thisLink.title = oUnwrapped.protocol + "//" + oUnwrapped.hostname;
            thisLink.classList.add("moarTLSUnsecure");
          }
        }
    }

    // We always need to send a report or else popup.js
    // can't know when analysis is complete.
    const obj = {LinkCount: cLinks, NonSecureImages: arrNonSecureImages.map(o=>{return o.src}), unsecure: arrUnsecure };
    chrome.runtime.sendMessage(obj);
}