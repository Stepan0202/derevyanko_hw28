
let currentData;
let people = [];
let planets = [];
let vehicles = [];
function getAll(type, array, url){
    let query;
    if (!url) query = fetch(`https://swapi.dev/api/${type}`);
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
                createCards(array, type)
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
    })
}
getAll('people', people);
getAll('planets', planets);
getAll('vehicles', vehicles);
setTimeout(()=>{
    console.log(people[0].results);
    console.log(planets);
    console.log(vehicles);
}, 5000)




