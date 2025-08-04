//dunno how to call these lol
let timeLabels = [
    { name: "day", time: 24 * 60 * 60 * 1000 },
    { name: "hour", time: 60 * 60 * 1000 },
    { name: "minute", time: 60 * 1000 },
    { name: "second", time: 1000 }
];

function methods({ package, req, peopleManager }) {
    return {
        ip: ({ page, replace }) => replace(page, req.ip.startsWith("::ffff:") ? req.ip.replace("::ffff:", "") : req.ip),
        version: ({ page, replace }) => replace(page, package.version),
        info: ({ page, replace }) => {
            return replace(page, `\
<h1>${package.name} info</h1>
<h2>General Information</h2>
<ul>
    <li><b>Version:</b> v${package.version}</li>
    <li><b>Node.js version:</b> ${process.version}</li>
</ul>`);
        },
        query: ({ page, replace, params }) => replace(page, req?.query[params?.toString()]),
        queryDate: ({ page, replace, params }) => replace(page, new Date(parseInt(req?.query[params?.toString()])).toString()),
        username: ({ page, replace, params }) => {
            let user = "";
            let auth = req?.get("Authorization");
            if(auth?.startsWith("Basic")) {
                let data = auth.replace(/^Basic /, "");
                if(!data.includes(":")) {
                    data = Buffer.from(data, "base64").toString();
                }
                user = data.split(":")[0];
            }
            return replace(page, user);
        },
        date: ({ page, replace, params }) => replace(page, (new Date(params)).toString()),
        timeSince: ({ page, replace, params }) => {
            let currentDate = new Date();
            let date = new Date(parseInt(params));
            let label = "";
            let c = 0;
            let currentTime = currentDate.getTime() % (24 * 60 * 60 * 1000);
            let time = date.getTime() % (24 * 60 * 60 * 1000);
            let month = currentDate.getUTCMonth();
            if(month < date.getUTCMonth()) {
                month += 12;
            }
            //oh my god what have i done
            if(currentDate.getUTCFullYear() - date.getUTCFullYear() >= 2 || (currentDate.getUTCFullYear() - date.getUTCFullYear() === 1 && (currentDate.getUTCMonth() > date.getUTCMonth() || (currentDate.getUTCMonth() === date.getUTCMonth() && (currentDate.getUTCDate() > date.getUTCDate() || (currentDate.getUTCDate() === date.getUTCDate() && currentTime >= time)))))) {
                c = currentDate.getUTCFullYear() - date.getUTCFullYear();
                if(currentDate.getUTCMonth() < date.getUTCMonth() || (currentDate.getUTCMonth() === date.getUTCMonth() && (currentDate.getUTCDate() < date.getUTCDate() || (currentDate.getUTCDate() === date.getUTCDate() && currentTime < time)))) {
                    c--;
                }
                label = "year";
            }
            else if(month - date.getUTCMonth() >= 2 || currentDate.getUTCMonth() - date.getUTCMonth() === 1 && (currentDate.getUTCDate() > date.getUTCDate() || (currentDate.getUTCDate() === date.getUTCDate() && currentTime >= time))) {
                c = month - date.getUTCMonth();
                if(currentDate.getUTCDate() < date.getUTCDate() || (currentDate.getUTCDate() === date.getUTCDate() && currentTime < time)) {
                    c--;
                }
                label = "month";
            }
            else {
                let elapsed = Date.now() - parseInt(params);
                for(let l of timeLabels) {
                    if(l.time > elapsed) continue;
                    label = l.name;
                    c = Math.floor(elapsed / l.time);
                    break;
                }
            }
            return replace(page, `${c} ${label}${c == 1 ? "" : "s"}`);
        }
    };
}

module.exports = methods;
