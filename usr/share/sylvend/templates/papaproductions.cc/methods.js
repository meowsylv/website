function methods(options) {
    let timeLockIndex = -1;
    const defaultMethods = require("../../default");
    const { package, req, peopleManager, configManager, resetSearch } = options;
    
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
        migration: ({ params, replace, page }) => {
            if(["1", "true"].includes(req.query["sylvend-migration"]?.toLowerCase())) {
                return replace(page, "<address>(You were redirected to this page from papaproductions.cc. Welcome to meow.sylv.cat!)</address>");
            }
            return replace(page, "");
        },
        footer: ({ replace, page, params }) => {
            return replace(page, `<div class="sylv-footer">
    ${params[1] ? "" : "<a href=\"/\">Go back to main page</a>"}<span>${params[1] ? "" : ". "}${params[0]}</span><img class="sylv" src="/stuff/sylv-small.png" title="nyah!" alt="Sylveon">
</div>`);
        },
        quoteThanks: ({ replace, page }) => {
            return thanks({ params: configManager.config.quotes.map(q => { return { user: q.author } }), replace, page })
        },
        thanks,
        timeLockStart: ({ start, replace, page, params }) => {  
            timeLockIndex = start;
            return replace(page, "");
        },
        timeLockEnd: ({ params, start, length, page }) => {
            let remaining = params.timestamp - Date.now();
            if(remaining <= 0) {
                return replace(page, "");
            }
            let seconds = Math.floor(remaining / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);
            let days = Math.floor(hours / 24);
            resetSearch();
            return page.slice(0, timeLockIndex) + `${params.message}
<p><b>Time remaining:</b></p>
<h1><code class="timelock" id="${params.timestamp}">${zero(days)}:${zero(hours % 24)}:${zero(minutes % 60)}:${zero(seconds % 60)}</code></h1>` + page.slice(start + length);
        }
    };
}

//how many times have i implemented this method across all of my projects? this thing is like, part of my muscular memory at this point.
function zero(n, c = 2) {
    return "0".repeat(c - n.toString().length) + n.toString();
}

module.exports = methods;
