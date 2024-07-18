const statsList = document.getElementById("stats");
const quotesDiv = document.getElementById("quotes");
const peopleTable = document.getElementById("people");
const authorSelect = document.getElementById("author");
const newQuoteForm = document.getElementById("newquote");
const newQuoteInput = document.getElementById("quote");
const newUserForm = document.getElementById("newuser");
const userInput = document.getElementById("name");
const idInput = document.getElementById("id");
const reloadAllButton = document.getElementById("reloadall");
const restart = document.getElementById("restart");

createDeleteButton(null, async () => {
    if(confirm("Are you actually sure you want to fully restart sylvend?")) {
        let key = (await api("/management/restart", "GET")).key;
        if(key === prompt(`Are you actually actually sure? If you are, enter the following key:\n${key}`)) {
            await api("/management/restart/confirm", "POST", { key });
            let pingInterval = setInterval(async () => {
                try {
                    await api("/ping");
                    alert("sylvend has been sucessfully restarted.");
                    clearInterval(pingInterval);
                    window.location.reload();
                }
                catch {}
            }, 1000);
        }
        else {
            alert("Incorrect key.");
        }        
    }
}, restart);

newQuoteForm.addEventListener("submit", async ev => {
    ev.preventDefault();
    if(newQuoteForm.selectedIndex === 0) return;
    await api(`/management/quotes/${authorSelect.selectedOptions[0].value}`, "PUT", { quote: newQuoteInput.value });
    loadManagementQuotes();
});

newUserForm.addEventListener("submit", async ev => {
    ev.preventDefault();
    await api(`/management/people/${userInput.value}`, "PUT", { id: idInput.value });
    loadPeople();
});

loadPeople();

async function loadPeople() {
    let people = await api("/management/people", "GET");
    
    while(peopleTable.firstChild) peopleTable.removeChild(peopleTable.lastChild);
    while(authorSelect.firstChild) authorSelect.removeChild(authorSelect.lastChild);
    
    let defaultOption = document.createElement("option");

    defaultOption.innerText = "Select a user...";
    defaultOption.value = "";
    
    authorSelect.appendChild(defaultOption);

    for(let name of Object.keys(people)) {
        let option = document.createElement("option");
        let row = document.createElement("tr");
        let nameField = document.createElement("td");
        let idField = document.createElement("td");
        let actionsField = document.createElement("td");
        let deleteButton = createDeleteButton("Remove", async () => {
            let quotes = await fetchQuotes();
            if(quotes.find(q => q.author === name)) {
                if(!confirm(`The user you have attempted to delete wrote a quote on /whoami.html. Proceeding WILL break the page, and might even crash the API. Do you still want to continue?`)) return;
            }
            await api(`/management/people/${name}`, "DELETE");
            loadPeople();
        });
        
        nameField.innerHTML = `<code>${name}</code>`;
        idField.innerText = people[name];
        actionsField.appendChild(deleteButton);
        
        row.appendChild(nameField);
        row.appendChild(idField);
        row.appendChild(actionsField);
        peopleTable.appendChild(row);
        
        option.value = name;
        option.innerText = name;
        authorSelect.appendChild(option);
    }
}

function createDeleteButton(label, click, btn) {
    let confirmed = false;
    let resetTimeout;
    let button = btn || document.createElement("button");
    
    if(label) button.innerText = label;
    
    button.addEventListener("click", ev => {
        if(confirmed) {
            clearTimeout(resetTimeout);
            click(ev);
        }
        else {
            button.innerText = "Are you sure?";
            confirmed = true;
            resetTimeout = setTimeout(() => {
                confirmed = false;
                button.innerText = label;
            }, 5000);
        }
    });
    return button;
}

api("/management/stats", "GET").then(stats => {
    console.log(stats);
    while(statsList.lastChild) statsList.removeChild(statsList.firstChild);
    let lsbLi = document.createElement("li");
    let uptimeLi = document.createElement("li");
    
    lsbLi.innerText = `This server is running on ${stats.lsb}!`;
    uptimeLi.innerText = `Server uptime: ${stats.uptime}`;
    
    statsList.appendChild(lsbLi);
    statsList.appendChild(uptimeLi);
});

loadManagementQuotes();

async function loadManagementQuotes() {
    while(quotesDiv.firstChild) quotesDiv.removeChild(quotesDiv.lastChild);
    let quotes = await fetchQuotes();
    for(let quote of quotes) {
        let li = document.createElement("li");
        let quoteContainer = createQuote(quote);
        let authorText = quoteContainer.getElementsByClassName("author")[0]
        let deletionConfirmed = false;
        
        authorText.innerHTML += ` (Internal name: <code>${quote.author}</code>)&nbsp;`;
        
        let deleteButton = createDeleteButton("Delete", async ev => {
            await api(`/management/quotes/${quote.author}`, "DELETE");
            loadManagementQuotes();
        });
        
        authorText.appendChild(deleteButton);
        li.appendChild(quoteContainer);
        quotesDiv.appendChild(li);
    }
}

async function api(endpoint, method, body) {
    let reqData = { method };
    if(body) {
        reqData.body = JSON.stringify(body);
        reqData.headers = { "Content-Type": "application/json" };
    }
    let res = await fetch(`/api${endpoint}`, reqData);
    if(res.status === 204) return;
    let data = await res.json();
    
    if(!res.ok) {
        let message = `API Error ${data.errorCode}: ${data.errorMessage}`;
        alert(message);
        throw new Error(message);
    }
    return data;
}
