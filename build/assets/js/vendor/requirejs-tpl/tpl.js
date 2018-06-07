define({
    load: function (name, req, load, config) {
        req(['text!' + name], function (htmlString) {
            var fileName = name.split('/').pop(),
                templateId = fileName.replace(/\.[^\.]*$/, ''), // Strip extension
                existingScriptElement = document.getElementById(templateId);

            if (existingScriptElement) {
                throw new Error("tpl plugin for require.js: More than one of the loaded templates have the file name " + fileName + ", skipped " + name + ". Please disambiguate by changing at least one of the file names.");
            } else {
                // Translate the template if AssetGraph-builder's bootstrapper script is present and we're not using the default language:
                if (window.TRHTML && (!window.DEFAULTLOCALEID || LOCALEID !== DEFAULTLOCALEID) && window.TRANSLATE !== false) {
                    htmlString = TRHTML(htmlString);
                }
                if (/<script/i.test(htmlString)) {
                    var div = document.createElement('div');
                    div.innerHTML = htmlString;
                    var nestedScriptElements = div.getElementsByTagName('script');
                    while (nestedScriptElements.length > 0) {
                        nestedScriptElement = nestedScriptElements[0];
                        document.body.appendChild(nestedScriptElement);
                    }
                    htmlString = div.innerHTML;
                }
                if (!/^\s*$/.test(htmlString)) {
                    var scriptElement = document.createElement('script');
                    scriptElement.setAttribute('type', 'text/html');
                    scriptElement.setAttribute('id', templateId);
                    if ('textContent' in scriptElement) {
                        scriptElement.textContent = htmlString;
                    } else {
                        // IE8 and below
                        scriptElement.text = htmlString;
                    }
                    document.body.appendChild(scriptElement);
                }
            }
            load(htmlString);
        });
    }
});