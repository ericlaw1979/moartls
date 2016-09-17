"use strict";

{
    if (typeof chrome === "undefined") var chrome = browser;

    function markUnsecureImages()
    {
        const imgs = document.querySelectorAll("img");
        for (let i = 0; i < imgs.length; i++)
        {
            if (imgs[i].src.substring(0,5) === "http:") {
                imgs[i].classList.add("moarTLSUnsecure");
            }
        }
    }

    const arrUnsecure = [];
    let cLinks = 0;

    {
        // Entire frame is insecure?
        const sProt = document.location.protocol.toLowerCase();
        if ((document.body) && 
            ((sProt === "http:") || (sProt === "ftp:"))) {

              document.body.classList.add("moarTLSUnsecure");
              let oSensitiveFields = document.querySelectorAll("* /deep/ input[type='password']");
              if (oSensitiveFields.length > 0)
              {
                // TODO: Log field names
                const uiNotSecure = document.createElement("img");
                uiNotSecure.src = chrome.extension.getURL("/images/SensitiveForm.png");
                uiNotSecure.classList.add("moarTLSFieldWarning");
                document.body.appendChild(uiNotSecure);

                for (let i = 0; i < oSensitiveFields.length; i++) {
                    oSensitiveFields[i].classList.add("moarTLSSensitive");
                }
              }
        }
    }

    {
        if (chrome.storage)
        {
            const storage = (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);
            storage.get("bRotateNonSecureImages", function(obj) {
              if (obj && (false === obj.bRotateNonSecureImages)) return;
              markUnsecureImages();
            });
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
          const sUri = (typeof thisForm.action === "string") ? 
                                                    thisForm.action.toLowerCase() 
                                                  : thisForm.getAttribute("action").toLowerCase();
          if (sUri.startsWith("http:"))
          {
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
          const sProtocol = thisLink.protocol.toLowerCase();
          if ((sProtocol == "http:") || (sProtocol == "ftp:")) {
            arrUnsecure.push(thisLink.href);
            thisLink.title = lnks[i].protocol + "//" + lnks[i].hostname;
            thisLink.classList.add("moarTLSUnsecure");
          }
        }

    }
    
    // We always need to send a report or else popup.js
    // can't know when analysis is complete.
    const obj = {cLinks: cLinks, unsecure: arrUnsecure };
    chrome.runtime.sendMessage(obj);
}