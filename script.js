let allFilters = document.querySelectorAll(".filter");
let openModal = document.querySelector(".open-modal");
let closeModal = document.querySelector(".close-modal");
let allFilterClasses = ["red", "blue", "green", "yellow", "black"];
let ticketsContainer = document.querySelector(".tickets-container");

let myDB = window.localStorage;


let ticketModalOpen = false;
let isTextTyped = false;

closeModal.addEventListener("click", closeTicketModal);

openModal.addEventListener("click", openTicket);

for(let i = 0; i < allFilters.length; i++){
    allFilters[i].addEventListener("click", selectFilter);
}

function selectFilter(e){
    if(e.target.classList.contains("active-filter")){
        e.target.classList.remove("active-filter");
        ticketsContainer.innerHTML = "";
        loadTickets();
    } else {
        if(document.querySelector(".active-filter")){
            document.querySelector(".active-filter").classList.remove(".active-filter");
        }
        e.target.classList.add("active-filter");
        ticketsContainer.innerHTML = "";
        let filterClicked = e.target.classList[1];
        loadSelectedTickets(filterClicked);
    }
}

function loadSelectedTickets(filter){
    let allTickets = myDB.getItem("allTickets");
    if(allTickets){
        allTickets = JSON.parse(allTickets);
        for(let i = 0; i < allTickets.length; i++){
            let ticketobj = allTickets[i];
            if(ticketobj.ticketFilter == filter){
                appendTicket(ticketobj);
            }
        }
    }
}

function loadTickets(){
    let allTickets = localStorage.getItem("allTickets");
    if(allTickets){
        allTickets = JSON.parse(allTickets);
        for(let i = 0; i < allTickets.length; i++){
            let ticketObj = allTickets[i];
            appendTicket(ticketObj);
        }
    }
}

loadTickets();

function openTicket(e){
    if(ticketModalOpen){
        return;
    }
    if(e.length > 0){
        openTicketModal(e);
    } else {
        openTicketModal(null);
    }
}

function openTicketModal(e){

    let ticketText = "Enter your text";
    let ticketColor = "";
    if(e){
        e = JSON.parse(e);
        ticketText = e.ticketValue;
        ticketColor = e.ticketFilter;
    }

    let ticketModal = document.createElement("div");
    ticketModal.classList.add("ticket-modal");
    ticketModal.innerHTML = `
        <div class="ticket-text" contenteditable="true">${ticketText}</div>

        <div class="ticket-filters">
            <div class="ticket-filter2 red selected-filter"></div>
            <div class="ticket-filter2 blue"></div>
            <div class="ticket-filter2 green"></div>
            <div class="ticket-filter2 yellow"></div>
            <div class="ticket-filter2 black"></div>
        </div>
    `;

    let ticketFilter2 = ticketModal.querySelectorAll(".ticket-filter2");
    if (ticketColor != "") {
        ticketFilter2[0].classList.remove("selected-filter");
        for (let index = 0; index < ticketFilter2.length; index++) {
            if (ticketFilter2[index].classList.contains(ticketColor)) {
                ticketFilter2[index].classList.add("selected-filter");
                break;
            }
        }
    }
    document.querySelector("body").append(ticketModal);
    ticketModalOpen = true;
    isTextTyped = false;
    let tickettextDiv = ticketModal.querySelector(".ticket-text");
    if (e) {
        tickettextDiv.addEventListener("keypress", (args) => {
            if (args.keyCode == 13) {
                let ticketObj = {
                    ticketFilter: document.querySelector(".selected-filter").classList[1],
                    ticketValue: tickettextDiv.innerHTML,
                    ticketId: e.ticketId
                };
                let allTickets = myDB.getItem("allTickets");
                if (allTickets) {
                    allTickets = JSON.parse(allTickets);
                    let newAllTickets = allTickets.map((obj) =>
                        obj.ticketId == e.ticketId ? (obj = ticketObj) : obj
                    );
                    myDB.setItem("allTickets", JSON.stringify(newAllTickets));
                } else {
                    let allTickets = [ticketInfoObject];
                    myDB.setItem("allTickets", JSON.stringify(allTickets));
                }
                closeModal.click();
                if (!isTextTyped) {
                    isTextTyped = true;
                    args.target.textContent = "";
                }
                window.location.reload();
            }
        });
    } else {
        tickettextDiv.addEventListener("keypress", handleKeyPress);
    }
    

    for(let i = 0; i < ticketFilter2.length; i++){
        ticketFilter2[i].addEventListener("click", function(e){
            if(e.target.classList.contains("selected-filter")){
                return;
            }
            document.querySelector(".selected-filter").classList.remove("selected-filter");
            e.target.classList.add("selected-filter");
        })
    }
}

function closeTicketModal(e){
    if(ticketModalOpen){
        document.querySelector(".ticket-modal").remove();
        ticketModalOpen = false;
    }
}

function handleKeyPress(e){
    if(e.key == "Enter" && isTextTyped && e.target.textContent){
        let filterSelected = document.querySelector(".selected-filter").classList[1];
        let ticketId = uuid();
        let ticketInfoObject = {
            ticketFilter: filterSelected,
            ticketValue: e.target.textContent,
            ticketId: ticketId
        };
        appendTicket(ticketInfoObject);
        closeModal.click();
        saveTicketToDB(ticketInfoObject);
    }
    if(!isTextTyped) {
        isTextTyped = true;
        e.target.textContent = "";
    }
}

function saveTicketToDB(ticketInfoObject){
    let allTickets = myDB.getItem("allTickets");
    if(allTickets){
        allTickets = JSON.parse(allTickets);
        allTickets.push(ticketInfoObject);
        myDB.setItem("allTickets", JSON.stringify(allTickets));
    } else {
        let allTickets = [ticketInfoObject];
        myDB.setItem("allTickets", JSON.stringify(allTickets));
    }
}

function appendTicket(ticketInfoObject){

    let {ticketFilter, ticketValue, ticketId} = ticketInfoObject;
    let ticketDiv = document.createElement("div");
    ticketDiv.classList.add("ticket");
    ticketDiv.innerHTML = `
            <div class="ticket-header ${ticketFilter}">
            </div>
            <div class="ticket-content">
                <div class="ticket-info">
                    <div class="ticket-id">${ticketId}</div>
                    <div class="ticket-delete"><i class="fa-solid fa-trash"></i></div>
                    <div class="ticket-edit" onClick="ticketEdit('${ticketId}')"><i class="fa-solid fa-pen"></i></div>
                </div>
                <div class="ticket-value">
                    ${ticketValue}
                </div>
            </div>
    `;

    let ticketHeader = ticketDiv.querySelector(".ticket-header");

    ticketHeader.addEventListener("click", function(e){
        let currentFilter = e.target.classList[1];  // yellow
        let indexOfCurrFilter = allFilterClasses.indexOf(currentFilter);  // 3
        let newIndex = (indexOfCurrFilter+1)%allFilterClasses.length;
        let newFilter = allFilterClasses[newIndex];
        ticketHeader.style.backgroundColor = newFilter;
        ticketHeader.classList.remove(currentFilter);
        ticketHeader.classList.add(newFilter);

        let allTickets = JSON.parse(myDB.getItem("allTickets"));

        for(let i = 0; i < allTickets.length; i++){
            if(allTickets[i].ticketId == ticketId){
                allTickets[i].ticketFilter = newFilter;
            }
        }

        myDB.setItem("allTickets", JSON.stringify(allTickets));
    })

    let deleteTicketBtn = ticketDiv.querySelector(".ticket-delete");

    deleteTicketBtn.addEventListener("click", function(e){
        ticketDiv.remove();
        let allTickets = JSON.parse(myDB.getItem("allTickets"));

        let updatedTicket = allTickets.filter(function(ticketObject){
            if(ticketObject.ticketId == ticketId){
                return false;
            }
            return true;
        })

        myDB.setItem("allTickets", JSON.stringify(updatedTicket));
    })

    ticketsContainer.append(ticketDiv);

}

function ticketEdit(ticketId) {
    let allTickets = myDB.getItem("allTickets");
    if (allTickets) {
        allTickets = JSON.parse(allTickets);
        let ticketInfo;
        for (let i = 0; i < allTickets.length; i++) {
            if (allTickets[i].ticketId == ticketId) {
                ticketInfo = allTickets[i];
                break;
            }
        }
        openTicket(JSON.stringify(ticketInfo));
    }
}