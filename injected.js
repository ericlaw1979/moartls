"use strict";

{
    if (typeof chrome === "undefined") var chrome = browser;

    function findUnsecureImages()
    {
        const imgs = document.querySelectorAll("img");
        for (let i = 0; i < imgs.length; i++) {
            if (imgs[i].src.substring(0,5) === "http:") {
                arrNonSecureImages.push(imgs[i]);
            }
        }

        const imginputs = document.querySelectorAll("input[type='image']");
        for (let i = 0; i < imginputs.length; i++) {
            if (imginputs[i].src.substring(0,5) === "http:") {
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

    {
        if (!window.isSecureContext)
        {
            let cSensitiveFields = 0;

            // Count Password fields
            let oSensitiveFields = document.querySelectorAll("* /deep/ input[type='password']");
            cSensitiveFields += oSensitiveFields.length;
            for (let i = 0; i < oSensitiveFields.length; i++) {
                console.log("moarTLS Analyzer: Password field in non-secure context; name=" + oSensitiveFields[i].name + "; id=" + oSensitiveFields[i].id);
                oSensitiveFields[i].classList.add("moarTLSSensitive");
                oSensitiveFields[i].title = "WARNING: Password Field in a Non-Secure Context";
            }

            // Count Creditcard fields
            let ccRegEx = "(add)?(?:card|cc|acct).?(?:number|#|no|num|field)|nummer|credito|numero|número|numéro|カード番号|Номер.*карты|信用卡号|信用卡号码|信用卡卡號|카드";
            oSensitiveFields = document.querySelectorAll("* /deep/ input[type='text'],input[type='number'],input[type='tel']");
            if (oSensitiveFields.length > 0)
            {
                const oRegEx = new RegExp(ccRegEx, "gi");
                for (let i = 0; i < oSensitiveFields.length; i++) {
                    let sName = oSensitiveFields[i].name;
                    if ((sName && oRegEx.test(sName)) || oSensitiveFields[i].getAttribute("autocomplete")=="cc-number" ) {
                        console.log("moarTLS Analyzer: Credit Card field in non-secure context; name=" + oSensitiveFields[i].name + "; id=" + oSensitiveFields[i].id);
                        cSensitiveFields++;
                        oSensitiveFields[i].classList.add("moarTLSSensitive");
                        oSensitiveFields[i].title = "WARNING: Credit Card Field in a Non-Secure Context";
                    }
                }
            }

            // If any fields, show the "future" origin chip warning
            // TODO: Log field names
            if (cSensitiveFields > 0)
            {
                let uiNotSecure = document.getElementById("uiNotSecure");
                if (uiNotSecure)
                {
                    document.getElementById('uiNotSecure').style.visibility = "visible";
                }
                else
                {
                    uiNotSecure = document.createElement("img");
                    uiNotSecure.src = chrome.extension.getURL("/images/SensitiveForm.png");
                    uiNotSecure.classList.add("moarTLSFieldWarning");
                    uiNotSecure.id="uiNotSecure";
                    document.body.appendChild(uiNotSecure);

                    uiNotSecure.addEventListener("click", () => { document.getElementById('uiNotSecure').style.visibility = "hidden"; }, null);
                }
            }

        }
    }

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
    const obj = {LinkCount: cLinks, NonSecureImages: arrNonSecureImages.map(o=>{return o.src}), unsecure: arrUnsecure };
    chrome.runtime.sendMessage(obj);
}