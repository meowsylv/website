function methods(options) {
    let newMethods = require("../papaproductions.cc/methods");
    newMethods.footer = ({ replace, page, params }) => {
        return replace(page, `<hr>
${params[1] ? "" : "<a href=\"/\">Go back to main page</a>"}<span>${params[1] ? "" : ". "}${params[0]}</span><img class="sylv" src="/stuff/sylv-small.png" title="nyah!" alt="Sylveon">`);
    }
    return newMethods;
}

module.exports = methods;
