/**
 * @description bamI (BaM Internarionalization) module
 * 
 * @requires Papa
 * 
 * @author Ivan Horner
 */
bamI = function(){

    // contains all the keyed text.
    // each element is in the form: bread: {key: "bread", en: "Bread", fr: "Pain", ...}
    const mapping = {};

    // default language
    var language = "fr";

    // bamI object
    const obj = {};

    /**
     * @description: hidden function that update the text content
     * and/or attribute of an HTMLElement DOM (@param dom) according
     * to key and current languange
     * @param dom a HTMLElement DOM element
     */
    updateElement = function(dom) {
        if (dom.bamI) {
            let k = dom.bamI.bamIkey;
            let m = mapping[k]
            let t = "<UNDEFINED>"
            if (m) {
                t = m[language]
            }
            for (let a of dom.bamI.bamIattr) {
                dom.setAttribute(a, t);
            }
            if (dom.bamI.bamItext) dom.innerHTML = t;
            // if (dom.bamI.bamIhtml) dom.innerHTML = t;
        }
    }

    /**
     * @description hidden function that add mapping information from
     * a csv file
     * @param {string} csv path to csv file to read/parse using Papa.parse
     * @param {function} complete callback to call when file reading/parsing
     *          has been completed.
     */
    addMapping = function(csv, complete) {
        Papa.parse(csv, {
            download: true,
            delimiter: "\t",
            header:true,
            complete: function(data) {
                for (let k = 0; k < data.data.length; k++) {
                    mapping[data.data[k].key] = data.data[k];
                }
                complete();
            }
        })
    }

    /**
     * @description Initialize the bamI module with the mapping information between
     * keys and corresponding text in different languages.
     * 
     * @param {Array of strings} csv_files Array of paths to the CSV files 
     *          that contain the language mapping information, i.e. files with
     *          (1) one header row with the first column "key" and the other columns
     *              the language key (e.g. "fr", "en", "it", etc...)
     *          (2) \t (tabulation) as a delimiter between column
     * 
     * @param {function} complete a callback to call when all files have been read.
     */
    obj.initFromCSV = function(csv_files, complete) {
        let all_completed = 0;
        for (let f of csv_files) {
            addMapping(f, function() {
                all_completed += 1;
                if (all_completed === csv_files.length) {
                    complete();
                }
            })
        }
    }

    /**
     * @description Initialize a HTMLElement DOM element for internationalization. 
     * @param {HTMLElement} dom An HTMLElement that we want to apply internationalization to.
     * @returns a domBamI object with methods that can be used to configure the internationalization.
     *          Note: to get the "modified" version of the original HTMLElement, call method dom()
     *          on this object. See below all the methods associated to this domBamI Object.
     * @todo Multiple keys should be possible to use to affect different aspect of the DOM element
     *       For example, we might need to affect the placeholder and the text content differently.
     *       Note that I have not encoutered such a situation yet.
     */
    obj.set = function(dom) {
        dom.setAttribute("bamI", "");
        dom.bamI = {
            dom: dom,
            bamIkey: "",
            bamIattr: [],
            bamItext: false
        };

        /**
         * @description set the key to the domBamI object
         * @param {string} key a mapping key
         * @returns modified domBamI object
         */
        dom.bamI.key = function(key) {
            dom.bamI.bamIkey = key;
            return dom.bamI;
        }
        /**
         * @description set an attribute to be affected by internationalization
         * @param {string} attr an DOM attribute name (e.g. "placeholder")
         * @returns modified domBamI object
         */
        dom.bamI.attr = function(attr) {
            dom.bamI.bamIattr.push(attr);
            return dom.bamI;
        }
        /**
         * @description define whether or note textContent of element should be affected by internationalization
         * @param {boolean} text a boolean, if true, the text content of the DOM element will be affected by internationalization
         * @returns modified domBamI object
         */
        dom.bamI.text = function(text=true) {
            dom.bamI.bamItext = text;
            return dom.bamI;
        }
        /**
         * @description define whether or note innerHTML of element should be affected by internationalization
         * @param {boolean} html a boolean, if true, the innerHTML content of the DOM element will be affected by internationalization
         * @returns modified domBamI object
         */
        // dom.bamI.html = function(html=true) {
        //     dom.bamI.bamIhtml = html;
        //     return dom.bamI;
        // }
        /**
         * @description Apply internationalization right away (i.e. don't wait for a "global apply" of all internationalized DOM elements of the page)
         * @returns domBamI object
         */
        dom.bamI.apply = function() {
            updateElement(dom);
            return dom.bamI;
        }
        /**
         * @description Return the modified HTMLElement (with a property called bamI and a new attribute called bami)
         * @returns modified HTMLElement
         */
        dom.bamI.dom = function() {
            return dom;
        }
        return dom.bamI;
    }

    /**
     * @description set/change the current language according to a key
     * @param {string} key the language key (e.g. "fr", "en")
     * @returns a bamI object
     */
    obj.setLanguage = function(key) {
        language = key;
        return obj;
    }

    /**
     * @description get the current language key
     * @returns language key
     */
    obj.getLanguage = function() {
        return language;
    }

    /**
     * @description update all HTMLElements that have been internationalized using bamI.
     * It uses the bami attribute that has been added to all internationalized DOM element to
     * search the whole page DOM tree.
     * @returns a bamI object
     */
    obj.update = function() {
        const doms = document.querySelectorAll("[bami]")
        for (let d of doms) {
            updateElement(d);
        }
        return obj;
    }

    /**
     * @description get the text associated with a key in the current language.
     * This is usefull for temporary DOM elements that will no live long enough
     * to be affected by a language change.
     * @param {string} key a mapping key
     * @returns the text associated with @param key in the current language
     */
    obj.getText = function(key) {
        return mapping[key][language];
    }

    return obj;
}()

