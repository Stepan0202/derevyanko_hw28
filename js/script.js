
let currentData;
let characters = [];
let planets = [];
let vehicles = [];
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
                setNCards(0, 10, results, cardContainer);
                createPagination(data.count, 10, cardContainer, type)
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
    return results;
}
function setNCards(start, n, array, cardContainer){
    for (let i = start; i < n; i++){
        if(array[i]){
            cardContainer.innerHTML += array[i].card;
        }
    }
}
function createPagination(count, elPerPage, cardContainer, type){
    const paginationNumber = Math.ceil(count/elPerPage);
    const pagination = document.querySelector(`.${type}Container + [aria-label="Page navigation"]`).children[0];
    pagination.innerHTML = `<li class="page-item">
                                <a class="btn btn-dark" href="#" aria-label="Previous">
                                    <span aria-hidden="true">&laquo;</span>
                                </a>
                            </li>`
    for(let i = 1; i < paginationNumber+1; i++){
        pagination.innerHTML += `<li class="page-item"><button class='${i != 1 ? 'btn btn-dark' : 'btn btn-dark active'}'>${i}</a></button>`
    }
    pagination.innerHTML += `<li class="page-item text-dark">
    <a class="btn btn-dark" href="#" aria-label="Next">
      <span aria-hidden="true">&raquo;</span>
    </a>
    </li>`
    console.log(pagination)
}
getAll('characters', characters);
getAll('planets', planets);
getAll('vehicles', vehicles);



