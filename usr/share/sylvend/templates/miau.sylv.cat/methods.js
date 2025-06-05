const base = require("../papaproductions.cc/methods");

function methods(options) {
    let m = base(options);
    m.footer = ({ replace, page, params }) => {
        return replace(page, `<div class="sylv-footer">
    ${params[1] ? "" : "<a href=\"/\">Regresar a la p&aacute;gina principal</a>"}<span>${params[1] ? "" : ". "}${params[0]}</span><img class="sylv" src="/umb-small.png" title="bre! (no encontre variante shiny perdon)" alt="Umbreon">
</div>`);
    };

    return m;
}

module.exports = methods;
