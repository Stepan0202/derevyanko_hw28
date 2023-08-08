'use strict'

let currentData;
//Object with common data (count of pages, nextPage, array of results etc)
const data = {
    characters : [],
    planets : [],
    vehicles : [],
}
//Object with concrete results by types — arrays "result" from data
const dataResults = {
    characters : [],
    planets : [],
    vehicles : [],
}
const cardsPerPage = 10;
const paginations = document.querySelectorAll('[aria-label="Page navigation"]')
function getAll(type, array, url){
    let query;
    if (!url) query = fetch(`https://swapi.dev/api/${type == 'characters' ? 'people' : type}`);
    else query = fetch(url);
    query.then(response => {
        return response.json();
    })
    .then(data => {
            array.push(data);
            if(data.next){  
                getAll(type, array, data.next);
            }
            else{
                const cardContainer = document.querySelector(`#${type}Container`);
                const results = createCards(array, type);
                setNCards(0, cardsPerPage, results, cardContainer);
                createPagination(data.count, cardsPerPage, cardContainer, type)
            }
    })
};

function createCards(array, type) {
    let results = [];
    array.forEach(object => {
         results.push(object.results);
    });
    results = results.flat();
    results.forEach((obj, index) => {
        obj.photo = `https://starwars-visualguide.com/assets/img/${type = type == 'people'? 'characters' : type}/${index+1}.jpg`;
        const card = `
        <div class="card"">
            <div class="py-2"><img src="${obj.photo}" class="card-img-top" onerror="this.onerror=null;this.src='img/image_not_found.png';" alt="${obj.name}"></div>
            <div class="card-body">
                <h5 class="card-title">${obj.name}</h5>
                <a href="#" class="btn btn-primary data-objectInfo="[${index}, ${obj.name}]"">More info</a>
            </div>
        </div>
        `
        obj.card = card;
    })
    dataResults[type] = results;
    return results;
}
function setNCards(start, n, array, cardContainer){
    console.log(arguments)
    cardContainer.innerHTML = "";
    for (let i = start; i < n; i++){
        if(array[i]){
            cardContainer.innerHTML += array[i].card;
        }
    }
}
function createPagination(count, elPerPage, cardContainer, type){
    const paginationNumber = Math.ceil(count/elPerPage);
    const pagination = document.querySelector(`.${type}Container + [aria-label="Page navigation"]`).children[0];
    pagination.setAttribute('data-type', type);
    pagination.innerHTML = `<li class="page-item">
                                    <span class="btn btn-dark disabled" aria-hidden="true" data-currentPage="1" aria-label="previous">&laquo;</span>
                            </li>`
    for(let i = 1; i < paginationNumber+1; i++){
        pagination.innerHTML += `<li class="page-item"><button class='${i != 1 ? 'btn btn-dark' : 'btn btn-dark active'}' aria-label="${i}">${i}</a></button>`
    }
    pagination.innerHTML += `<li class="page-item text-dark">
                                <span class="btn btn-dark" aria-hidden="true" data-currentPage="1" aria-label="next">&raquo;</span>
                            </li>`;
    pagination.addEventListener('click', processPagination);
    
}
function processPagination(e){
    if (e.target){
        const button = e.target;
        const buttonType = button.ariaLabel;
        const buttonContainer = e.target.parentNode.parentNode;
        const type = buttonContainer.dataset.type;
        const buttonPrev = buttonContainer.querySelector("[aria-label='previous']");
        const buttonNext = buttonContainer.querySelector("[aria-label='next']");
        const currentPageNum = buttonPrev.dataset.currentpage;
        const currentButton = buttonContainer.querySelector(`[aria-label='${currentPageNum}']`);
        switch(buttonType){
            case 'previous':
                
                const buttonNumPrev = parseInt(currentButton.ariaLabel)-1;
                const previousButton = buttonContainer.querySelector(`[aria-label='${buttonNumPrev }']`);
                const startPos = buttonNumPrev  * cardsPerPage - cardsPerPage;
                const endPosition = startPos + cardsPerPage;
                const cardContainer = document.querySelector(`#${type}Container`);
                setNCards(startPos, endPosition, dataResults[type], cardContainer);
                currentButton.classList.toggle('active');
                previousButton.classList.toggle('active');
                buttonPrev.dataset.currentpage = buttonNumPrev ;
                if (buttonNumPrev == 1) buttonPrev.classList.toggle('disabled');
                buttonNext.dataset.currentpage = buttonNumPrev ;
                buttonNext.classList.toggle('disabled');
                break;
    
            case 'next':
                const buttonNumNext = parseInt(currentButton.ariaLabel)+1;
                const nextButton = buttonContainer.querySelector(`[aria-label='${buttonNumNext}']`);
                const start = buttonNumNext * cardsPerPage - cardsPerPage;
                const end = start + cardsPerPage;
                const container = document.querySelector(`#${type}Container`);
                setNCards(start, end, dataResults[type], container);
                currentButton.classList.toggle('active');
                nextButton.classList.toggle('active');
                buttonPrev.dataset.currentpage = buttonNumNext;
                if (currentButton.ariaLabel == 1) buttonPrev.classList.toggle('disabled');
                buttonNext.dataset.currentpage = buttonNumNext;
                break;
            
            default:
                if(currentButton.ariaLabel != buttonType){
                    const buttonNum = parseInt(buttonType);
                    const startPos = buttonNum * cardsPerPage - cardsPerPage;
                    const endPosition = startPos + cardsPerPage;
                    const cardContainer = document.querySelector(`#${type}Container`);
                    setNCards(startPos, endPosition, dataResults[type], cardContainer);
                    button.classList.toggle('active');
                    currentButton.classList.toggle('active');
                    buttonPrev.dataset.currentpage = button.ariaLabel;
                    if (buttonNum > 1) buttonPrev.classList.toggle('disabled');
                    buttonNext.dataset.currentpage = button.ariaLabel;
                }

        }
    }


};
getAll('characters', data.characters);
getAll('planets', data.planets);
getAll('vehicles',data.vehicles);



