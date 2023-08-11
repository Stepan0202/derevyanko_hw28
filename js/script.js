'use strict'
//Classes
class DetailsObj {
    constructor() {
            this.container = document.querySelector("#detailsContainer");
            this.header = this.container.querySelector('.modal-header .modal-title');
            this.body = this.container.querySelector('.modal-body');
            this.btnClose = this.container.querySelector('.btn-close');
            this.btnClose.addEventListener('click', this.setHidden.bind(this));
        }
        setHeader(string) {
            this.header.innerHTML = string;
        }
        clearBody() {
            this.body.innerHTML = '';
        }
        addToBody() {
            for (let i = 0; i < arguments.length; i++) {
                this.body.appendChild(arguments[i]);
            }
        }
        setVisible() {
            this.container.style = "display: block";
            this.container.classList.add('show');
        }
        setHidden() {

            this.container.style = "display: none";
        }
    
}
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
const detailsObj = new DetailsObj();
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
        const films = processArrayVariable(unit.films, 'films');
        const species = processArrayVariable(unit.species, 'species');
        const vehicles = processArrayVariable(unit.vehicles, 'vehicles');
        const starships = processArrayVariable(unit.starships, 'starships');
        const characters = processArrayVariable(unit.characters, 'characters');
        const planets = processArrayVariable(unit.planets, 'planets');

        const photo = document.createElement('img');
        const photoContainer = document.createElement('div');
        const container = document.createElement('div');
        const row = document.createElement('div');
        const row2 = document.createElement('div');
        const row3 = document.createElement('div'); 
        const row4 = document.createElement('div');
        const row5 = document.createElement('div');
        const row6 = document.createElement('div');
        const row7 = document.createElement('div'); 
        const infoBlock = document.createElement('div');
        const homeworld =  unit.homeworld ? [document.createElement('p'), document.createElement('div'), unit.homeworld.match(/(\d+)/gm)] : false;

        container.classList.add('container');
        container.appendChild(row);

        row.classList.add('row-column-1', 'row-column-md-2', 'row');
        row.appendChild(photoContainer);
        row.appendChild(infoBlock);

        row2.classList.add('row');
        row3.classList.add('row');
        row4.classList.add('row');
        row5.classList.add('row');
        row6.classList.add('row');
        row7.classList.add('row');

        infoBlock.classList.add('col-5');

        photo.setAttribute('src', photoSrc);
        photo.setAttribute('width', "100%");
        photo.onerror = "this.onerror=null;this.src='img/image_not_found.png';";
        photo.classList.add('object-fit-contain');

        photoContainer.classList.add('col-7');
        photoContainer.appendChild(photo);
        
        detailsObj.setHeader(name);
        detailsObj.clearBody();
        detailsObj.addToBody(container);
        detailsObj.setVisible();

        if(homeworld){
            homeworld[1].innerHTML = dataResults['planets'][homeworld[2]].card;
            homeworld[1].classList.add('col-6');
            homeworld[1].addEventListener('click', processContainerClick);
            homeworld[0].textContent = "Homeworld:"
        }


        films ? row2.appendChild(films) : false;
        species ? row3.appendChild(species) : false;
        vehicles ? row4.appendChild(vehicles) : false;
        starships ? row5.appendChild(starships) : false;
        planets ?  row6.appendChild(planets) : false;
        characters ? row7.appendChild(characters) : false;
        appendChilds(container, [row2, row3, row4, row5, row6, row7]);
        console.log(targetType)
        switch (targetType){
            case "characters":
                const height =  document.createElement('p');
                const mass =  document.createElement('p');
                const hair_color = document.createElement('p'); 
                const skin_color = document.createElement('p'); 
                const eye_color =  document.createElement('p');
                const birth_year = document.createElement('p'); 
                const gender =  document.createElement('p');

                height.textContent = "Height: " + unit.height;        
                mass.textContent = "Mass: " + unit.mass;
                hair_color.textContent = "Hair color: " + unit.hair_color;
                skin_color.textContent = "Skin color: " + unit.skin_color;
                eye_color.textContent = "Eye color: " + unit.eye_color;
                birth_year.textContent = "Birth year: " + unit.birth_year;
                gender.textContent = "Gender: " + unit.gender;
                
                appendChilds(infoBlock, [height, mass, hair_color, skin_color, eye_color, birth_year, gender]);
                
                break;
            case "vehicles":
            case "starships":
                const model =  document.createElement('p');
                const manufacturer =  document.createElement('p');
                const cost_in_credits = document.createElement('p'); 
                const length = document.createElement('p'); 
                const max_atmosphering_speed =  document.createElement('p');
                const crew = document.createElement('p'); 
                const passengers =  document.createElement('p');
                const cargo_capacity = document.createElement('p'); 
                const consumables =  document.createElement('p');
                const hyperdrive_rating = document.createElement('p'); 
                const MGLT =  document.createElement('p');
                const starship_class =  document.createElement('p');

                model.innerHTML = "<span class='fw-bold'>Model:</span> " + unit.model;
                manufacturer.innerHTML = "<span class='fw-bold'>Manufacturer:</span> " + unit.manufacturer;
                cost_in_credits.innerHTML = "<span class='fw-bold'>Cost in credits:</span> " + unit.cost_in_credits;
                length.innerHTML = "<span class='fw-bold'>Length:</span> " + unit.length;
                max_atmosphering_speed.innerHTML = "<span class='fw-bold'>Max atmosphering</span> speed: " + unit.max_atmosphering_speed;
                crew.innerHTML = "<span class='fw-bold'>Crew:</span> " + unit.crew;
                passengers.innerHTML = "<span class='fw-bold'>Passengers:</span> " + unit.passengers;
                cargo_capacity.innerHTML = "<span class='fw-bold'>Cargo capacity</span>: " + unit.cargo_capacity;
                consumables.innerHTML = "<span class='fw-bold'>Consumables:</span> " + unit.consumables;
                hyperdrive_rating.innerHTML = "<span class='fw-bold'>Hyperdrive rating:</span> " + unit.hyperdrive_rating;
                MGLT.innerHTML = "<span class='fw-bold'>MGLT:</span> " + unit.MGLT;
                starship_class.innerHTML = "<span class='fw-bold'>Starship class:</span> " + unit.starship_class;

                const pilots = processArrayVariable(unit.pilots, 'characters', "Pilots")
                pilots ? row3.appendChild(pilots) : false;
                appendChilds(infoBlock, [model, manufacturer, cost_in_credits, length, max_atmosphering_speed, crew, passengers, cargo_capacity, consumables, hyperdrive_rating, MGLT, starship_class])
                break;
            case "planets":
                
                const rotation_period = document.createElement('p');
                const orbital_period = document.createElement('p');
                const diameter = document.createElement('p');
                const climate = document.createElement('p');
                const gravity = document.createElement('p');
                const terrain = document.createElement('p');
                const surface_water = document.createElement('p');
                const population = document.createElement('p');
                const residents = processArrayVariable(unit.residents, "characters", "RESIDENTS");

                rotation_period.textContent = "Rotation period: " + unit.rotation_period;
                orbital_period.textContent = "Orbital period: " + unit.orbital_period;
                diameter.textContent = "Diameter: " + unit.diameter;
                climate.textContent = "Climate: " + unit.climate;
                gravity.textContent = "Gravity: " + unit.gravity;
                terrain.textContent = "Terrain: " + unit.terrain;
                surface_water.textContent = "Surface water: " + unit.surface_water;
                population.textContent = "Population: " + unit.population;
            
                appendChilds(infoBlock, [rotation_period, orbital_period, diameter, climate, gravity, terrain, surface_water, population]);
                row3.appendChild(residents);
                break;
            
            case "films":
                const opening_crawl = document.createElement('p');
                const director = document.createElement('p');
                const producer = document.createElement('p');
                const release_date = document.createElement('p');

                opening_crawl.innerHTML = "<span class='fw-bold'>Opening crawl</span>: " + unit.opening_crawl;
                director.innerHTML = "<span class='fw-bold'>Director</span>: " + unit.director;
                producer.innerHTML = "<span class='fw-bold'>Producer</span>: " + unit.producer;
                release_date.innerHTML = "<span class='fw-bold'>Release date</span>: " + unit.release_date;

                appendChilds(infoBlock, [opening_crawl, director, producer, release_date]);
                break;
            case "species":
                const classification = document.createElement('div');
                const designation = document.createElement('div');
                const average_height = document.createElement('div');
                const skin_colors = document.createElement('div');
                const hair_colors = document.createElement('div');
                const eye_colors = document.createElement('div');
                const average_lifespan = document.createElement('div');
                const language = document.createElement('div');
                
                classification.innerHTML = "<span class='fw-bold'>Classification</span>: " + unit.classification;
                designation.innerHTML = "<span class='fw-bold'>Designation</span>: " + unit.designation;
                average_height.innerHTML = "<span class='fw-bold'>Average height</span>: " + unit.average_height;
                skin_colors.innerHTML = "<span class='fw-bold'>Skin colors</span>: " + unit.skin_colors;
                hair_colors.innerHTML = "<span class='fw-bold'>Hair colors</span>: " + unit.hair_colors;
                eye_colors.innerHTML = "<span class='fw-bold'>Eye colors</span>: " + unit.eye_colors;
                average_lifespan.innerHTML = "<span class='fw-bold'>Average lifespan</span>: " + unit.average_lifespan;
                language.innerHTML = "<span class='fw-bold'>Language</span>: " + unit.language;

                appendChilds(infoBlock, [classification, designation, average_height, skin_colors, hair_colors, eye_colors, average_lifespan, language]);
                break;
        }
        homeworld ? appendChilds(container, [homeworld[0], homeworld[1]]) : false;
    }
    function processArrayVariable(array, type, head){
        if(array && array.length > 0){
            const containerElement = document.createElement('div');
            const header = document.createElement('h2');
            header.textContent = head ? head : type.toUpperCase();
    
            containerElement.classList.add('row', 'mt-2');
            containerElement.appendChild(header);
            
            array.forEach(el => {
                const ind = parseInt(el.match(/(\d+)/gm)[0]);
                const object = dataResults[type].filter(el => el.index == ind)[0];
                const photoSrc = object.photo;
                const name = object.name ? object.name : object.title;
                const image = document.createElement('img');
                const imgContainer = document.createElement('div');
                const htmlName = document.createElement('p');
    
                image.setAttribute('width', '100em');
                image.setAttribute('height', '100em');
                image.setAttribute('src', photoSrc);
                image.style = "border-radius: 50%";
                
                imgContainer.classList.add('col-2', 'd-flex', 'flex-column', 'justify-content-between');
    
                htmlName.textContent = name;
                appendChilds(imgContainer, [htmlName, image]);
                containerElement.appendChild(imgContainer);
            })
            return containerElement;
        }

    }
}
