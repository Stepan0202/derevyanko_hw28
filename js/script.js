'use strict'
//VARIABLES AND OBJECTS
let currentData;
//Object with common data (count of pages, nextPage, array of results etc)
const data = {
    characters : [],
    planets : [],
    vehicles : [],
    films: [],
    starships: [],
    species: [],
}
//Object with concrete results by types — arrays "result" from data. Fullfills in createCards function
const dataResults = {
}
const details = document.querySelector("#detailsContainer");
const detailsHeader = details.querySelector('.modal-header .modal-title');
const detailsBody = details.querySelector('.modal-body');
const detailsClose = details.querySelector('.btn-close');
const detailsObj = {
    container: details,
    header: detailsHeader,
    body: detailsBody,
    btnClose: detailsClose,
    setHeader(string){
        this.header.innerHTML = string;
    },
    clearBody(){
        this.body.innerHTML = '';
    },
    addToBody(){
        for(let i = 0; i < arguments.length; i++){
            this.body.appendChild(arguments[i]);
        }
    },
    setVisible(){
        this.container.style = "display: block";

        this.btnClose.addEventListener('click', this.setHidden);

    },
    setHidden(){
        this.container.style = "display: none";
    }
}
const cardsPerPage = 10;
const paginations = document.querySelectorAll('[aria-label="Page navigation"]')

//Start
for (const unit in data) {
    if (Object.hasOwnProperty.call(data, unit)) {
        const element = data[unit];
        getAll(unit, element);
    }
}





//Functions
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
                createPagination(data.count, cardsPerPage, cardContainer, type);
                cardContainer.addEventListener('click', processContainerClick);
            }
    })
}
function createCards(array, type) {
    let results = [];
    array.forEach(object => {
         results.push(object.results);
    });
    results = results.flat();
    results.forEach((obj, index) => {
        const photoIndex = obj.url.match(/(\d+)/gm);
        const name = obj.name ? obj.name : obj.title;
        obj.photo = `https://starwars-visualguide.com/assets/img/${type = type == 'people'? 'characters' : type}/${photoIndex}.jpg`;
        const card = `
        <div class="card"">
            <div class="py-2"><img src="${obj.photo}" class="card-img-top" onerror="this.onerror=null;this.src='img/image_not_found.png';" alt="${name}"></div>
            <div class="card-body">
                <h5 class="card-title">${name}</h5>
                <a href="#" type="button" data-id="moreInfoButton" data-type="${type}" data-index="${index}" class="btn btn-primary" data-objectInfo="[${index}, ${name}]" data-bs-target="#detailsContainer">More info</a>
            </div>
        </div>
        `
        obj.card = card;
        obj.index = photoIndex;
    })
    dataResults[type] = results;
    return results;
}
function setNCards(start, n, array, cardContainer){
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
    
    cardContainer.dataset.pagecount = paginationNumber;
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

function createUnitPhoto(type, index){
    const unit = dataResults[type][index]
}
function appendChilds(container, elements){
    elements.forEach(el => container.appendChild(el));
}

//Callbacks for event listeners
function processPagination(e){
    if (e.target && !(e.target.querySelector('.disabled'))){
        const button = e.target;
        const buttonType = button.ariaLabel;
        const buttonContainer = e.target.parentNode.parentNode;
        const type = buttonContainer.dataset.type;
        const buttonPrev = buttonContainer.querySelector("[aria-label='previous']");
        const buttonNext = buttonContainer.querySelector("[aria-label='next']");
        const currentPageNum = buttonPrev.dataset.currentpage;
        const currentButton = buttonContainer.querySelector(`[aria-label='${currentPageNum}']`);
        const cardContainer = document.querySelector(`#${type}Container`);
        const pagesCount = cardContainer.dataset.pagecount;
        switch(buttonType){
            case 'previous':
                const buttonNumPrev = parseInt(currentButton.ariaLabel)-1;
                const previousButton = buttonContainer.querySelector(`[aria-label='${buttonNumPrev }']`);
                const startPos = buttonNumPrev  * cardsPerPage - cardsPerPage;
                const endPosition = startPos + cardsPerPage;
                setNCards(startPos, endPosition, dataResults[type], cardContainer);
                currentButton.classList.toggle('active');
                previousButton.classList.toggle('active');
                buttonPrev.dataset.currentpage = buttonNumPrev ;
                if (buttonNumPrev == 1) buttonPrev.classList.toggle('disabled');
                buttonNext.dataset.currentpage = buttonNumPrev ;
                buttonNext.classList.remove('disabled');
                break;
    
            case 'next':
                const buttonNumNext = parseInt(currentButton.ariaLabel)+1;
                const nextButton = buttonContainer.querySelector(`[aria-label='${buttonNumNext}']`);
                const start = buttonNumNext * cardsPerPage - cardsPerPage;
                const end = start + cardsPerPage;
                setNCards(start, end, dataResults[type], cardContainer);
                currentButton.classList.toggle('active');
                nextButton.classList.toggle('active');
                buttonPrev.dataset.currentpage = buttonNumNext;
                buttonPrev.classList.remove('disabled');
                if (buttonNumNext == pagesCount) buttonNext.classList.add('disabled')
                buttonNext.dataset.currentpage = buttonNumNext;
                break;
            
            default:
                if(currentButton.ariaLabel != buttonType){
                    const buttonNum = parseInt(buttonType);
                    const startPos = buttonNum * cardsPerPage - cardsPerPage;
                    const endPosition = startPos + cardsPerPage;
                    setNCards(startPos, endPosition, dataResults[type], cardContainer);
                    button.classList.toggle('active');
                    currentButton.classList.toggle('active');
                    buttonPrev.dataset.currentpage = button.ariaLabel;
                    if (buttonNum > 1) buttonPrev.classList.remove('disabled');
                    if (buttonNum == 1) buttonPrev.classList.add('disabled');
                    if (buttonNum == pagesCount) buttonNext.classList.add('disabled');
                    if (buttonNum < pagesCount) buttonNext.classList.remove('disabled');
                    buttonNext.dataset.currentpage = button.ariaLabel;
                }

        }
    }


}
function processContainerClick(e){
    if (e.target.dataset.id == "moreInfoButton"){
        const targetData = e.target.dataset;
        const targetType = targetData.type;
        const targetIndex = targetData.index;
        const unit = dataResults[targetType][targetIndex];

        //regardless of type info: name, photo, etc
        const name = unit.name ? unit.name : unit.title;
        const photoSrc = unit.photo;
        const photo = document.createElement('img');
        const container = document.createElement('div');
        const row = document.createElement('div');
        const row2 = document.createElement('div');
        const row3 = document.createElement('div'); 
        const infoBlock = document.createElement('div');

        container.classList.add('container');
        container.appendChild(row);

        row.classList.add('row-column-1', 'row-column-md-2', 'row');
        row.appendChild(photo);
        row.appendChild(infoBlock);
        
        infoBlock.classList.add('col-5');

        photo.setAttribute('src', photoSrc);
        photo.classList.add('col-7');
        
        detailsObj.setHeader(name);
        detailsObj.clearBody();
        detailsObj.addToBody(container);
        detailsObj.setVisible();
        

        switch (targetType){
            case "characters":
                
                const height =  document.createElement('p');
                const mass =  document.createElement('p');
                const hair_color = document.createElement('p'); 
                const skin_color = document.createElement('p'); 
                const eye_color =  document.createElement('p');
                const birth_year = document.createElement('p'); 
                const gender =  document.createElement('p');
                const homeworld =  [document.createElement('p'), document.createElement('div'), unit.homeworld.match(/(\d+)/gm)];
                
                height.textContent = "Height: " + unit.height;        
                mass.textContent = "Mass: " + unit.mass;
                hair_color.textContent = "Hair color: " + unit.hair_color;
                skin_color.textContent = "Skin color: " + unit.skin_color;
                eye_color.textContent = "Eye color: " + unit.eye_color;
                birth_year.textContent = "Birth year: " + unit.birth_year;
                gender.textContent = "Gender: " + unit.gender;
                homeworld[1].innerHTML = dataResults['planets'][homeworld[2]].card;
                homeworld[1].classList.add('col-4');
                homeworld[1].addEventListener('click', processContainerClick);
                homeworld[0].textContent = "Homeworld:"
                
                
                row2.classList.add('row-column-1', 'row-column-md-2', 'row');
                row3.classList.add('row-column-1', 'row-column-md-2', 'row');

                
                appendChilds(infoBlock, [height, mass, hair_color, skin_color, eye_color, birth_year, gender, homeworld[0], homeworld[1]]);
                appendChilds(container, [row2, row3]);


                break;
            case "vehicles":


                break;
            case "planets":

                break;
            
            case "films":

                break;
            case "starships":

                break;
            case "species":

                break;

        }
    }
}


    // <div class="modal fade" id="detailsContainer" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="detailsContainerLabel" aria-hidden="true">
    //     <div class="modal-dialog modal-dialog-centered modal-lg">
    //     <div class="modal-content">
    //         <div class="modal-header">
    //         <h1 class="modal-title fs-5" id="staticBackdropLabel">Modal title</h1>
    //         <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    //         </div>
    //         <div class="modal-body" id="moreInfo">
    //         ...
    //         </div>
    //     </div>
    //     </div>
    // </div>

//     <div class="modal fade show" id="detailsContainer" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="detailsContainerLabel" style="display: block;" aria-modal="true" role="dialog">
//     <div class="modal-dialog modal-dialog-centered modal-lg">
//       <div class="modal-content">
//         <div class="modal-header">
//           <h1 class="modal-title fs-5" id="staticBackdropLabel">Return of the Jedi</h1>
//           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//         </div>
//         <div class="modal-body" id="moreInfo"><div class="container"><div class="row-column-1 row-column-md-2 row"><img src="https://starwars-visualguide.com/assets/img/films/3.jpg" class="col-7"><div class="col-5"></div></div></div></div>
//       </div>
//     </div>
//   </div>