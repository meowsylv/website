const child_process = require("child_process");

function methods(options) {
    const defaultMethods = require("../../default");
    const { package, req, peopleManager, configManager } = options;

    function thanks({ params, replace, page }) {
        console.log(peopleManager.ready);
        if(!peopleManager.ready) {
            return replace(page, "Page generation was done before peopleManager was done loading. This is a sylvend misconfiguration, please <a href=\"/suggest.html\">let me know</a> so I can fix it.");
        }
        return replace(page, `\
<ul class="list">
${params.map(t => {
    let user = peopleManager.get(t.user);
    return `<li>
    <div class="quote-container">
        <img class="smallpfp" src="${user.avatar}"><div><span>${user.name.replace(/\!\{/g, "\\!{").replace(/\</g, "&lt;").replace(/\>/g, "&gt;")}${t.text ? `, ${t.text}` : ""}</span></div>
    </div>
</li>`
}).join("\n")}
</ul>`);
    }

    return {
        ...(defaultMethods(options)),
        footer: ({ replace, page, params }) => {
            return replace(page, `<hr>
<div class="sylv-footer">
    ${params[1] ? "" : "<a href=\"/\">Go back to main page</a>"}<span>${params[1] ? "" : ". "}${params[0]}</span><img class="sylv" src="/stuff/sylv-small.png" title="nyah!" alt="Sylveon">
</div>`);
        },
        quoteThanks: ({ replace, page }) => {
            return thanks({ params: configManager.config.quotes.map(q => { return { user: q.author } }), replace, page })
        },
        thanks,
        configTest: ({ replace, page }) => replace(page, configManager)
    };
}
module.exports = methods;
