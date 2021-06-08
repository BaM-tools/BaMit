// Object containing all the keyed text used to translate app content
var TXT_UI = {};

// Object containing the available lanquages and corresponding images used
// to pick/change language in the app
const LANGUAGES = {
    en: {name: "English", image: "united-kingdom-flag-square-xs.png"},
    fr: {name: "Français", image: "france-flag-square-xs.png"}
}

// Current languages (default to fr, French, Français)
var LANGUAGE = "fr";

/** 
 * Event listener when the DOM tree is ready to load the differe CSV files containing the 
 * the keyed translations
 */
document.addEventListener("DOMContentLoaded", function() {
    Papa.parse("./internationalization/txtUI.csv", {download: true, delimiter: "\t", header:true, complete: function(data) {
        for (let k = 0; k < data.data.length; k++) {
            TXT_UI[data.data[k].key] = data.data[k];
        }
        document.dispatchEvent(new CustomEvent("LoadingState", {detail: "txt_ui"}));
    }})

    Papa.parse("./internationalization/txtMSG.csv", {download: true, delimiter: "\t", header:true, complete: function(data) {
        for (let k = 0; k < data.data.length; k++) {
            TXT_UI[data.data[k].key] = data.data[k];
        }
        document.dispatchEvent(new CustomEvent("LoadingState", {detail: "txt_msg"}));
    }})

    Papa.parse("./internationalization/txtRBaM.csv", {download: true, delimiter: "\t", header:true, complete: function(data) {
        for (let k = 0; k < data.data.length; k++) {
            TXT_UI[data.data[k].key] = data.data[k];
        }
        document.dispatchEvent(new CustomEvent("LoadingState", {detail: "txt_rbam"}));
    }})
})


/**
 * @description 
 * set a text according to the current language (@global @var LANGUAGE)
 * and a key (@argument msg_id). This is only for temporary messages since any
 * change of languages (using @function _IchangeDOMlang) will not change the text
 * that this function spits out.
 * @returns a string containing the text associated with the key specified and the 
 * current language.
 * 
 * @author Ivan Horner
 */
_I = function(msg_id) { // type will no longer be used
    let msg;
    msg = TXT_UI[msg_id];

    if (msg) {
        let tmp = msg[LANGUAGE];
        if (tmp) {
            msg = tmp;
        } else {
            msg = msg["en"];
        }
    } else {
        msg = "<undefined text>";
    }
    return msg;
}

/**
 * @description 
 * given a key (@argument key) and an array of DOM element attributes (@argument attr),
 * this function add an attribut to the specified HTMLElement / DOM element (@argument dom) called
 * "bam-internationalization" with a value that store all the information needed to identify the 
 * which attribute (or the textContent of innerHTML, etc...), as specified with the Array of @argument attr
 * should have its value change according to the current language and which key should be used
 * (using @argument key) to retrieve content (from object in @global @var TXT_UI).
 * 
 * This function create the value that is attributed to attribute "bam-internationalization".
 * It also makes a call to @function setTimeout with 0ms to add to the browser task stack
 * a call to the @function _IupdateDOMtext which update the App content for all DOM element with an
 * attribute named "bam-internationalization".
 * 
 * @author Ivan Horner
 */
_IsetLangAttr = function(dom, key, attr = ["textContent"]) {
    let value = "";
    for (let k = 0; k < attr.length; k++) {
        value += attr[k];
        if ((k+1) < attr.length) value += ","
    }
    value = key + ";" + value;
    dom.setAttribute("bam-internationalization", value);
    setTimeout(_IupdateDOMtext, 0);
}

/** 
 * @description
 * Given a DOM element (@argument dom) and a value (@argument value, retrieved from 
 * DOM attribute "bam-internationalization"), this function parse the @argument value
 * and set to all the parsed DOM attributes found the text associated with the parsed
 * key found and current language  (@global @var LANGUAGE).
 * 
 * @author Ivan Horner
 */
_IchangeDOMlang = function(dom, value) {
    value = value.split(";");
    let key = value[0];
    let attrs = value[1].split(",");
    let text = _I(key);
    for (let k = 0; k < attrs.length; k++) {
        dom[attrs[k]] = text;
    }
}

/** 
 * @description
 * Look for all the DOM element that have an attribute called "bam-internationalization"
 * and apply the @function _IchangeDOMlang to each of them.
 * 
 * @author Ivan Horner
 */
_IupdateDOMtext = function(language_key=LANGUAGE) {
    LANGUAGE = language_key;
    let doms = document.body.querySelectorAll("[bam-internationalization]");
    for (let k = 0; k < doms.length; k++) {
        _IchangeDOMlang(doms[k], doms[k].getAttribute("bam-internationalization"));
    }
}
