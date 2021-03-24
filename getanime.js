//Config
const config = {
    nb_anime: 1,
    timelaps: 3600000 //1h
}

//Imports
const api = require("./lib/api.js");
const fs = require('fs');
const cloudscrapper = require("cloudscraper");
const displayInfo = function(param){console.log("[INFO]  "+param);}
const displayError = function(param){console.log("[ERROR]  "+param);}

//Verification
if(!process.argv[2] || process.argv[2].trim() == "") {
    console.log("\nUSAGE:");
    console.log("--------------------------------------------------------------------------------------------------------------");
    console.log('node getanime.js "hunter x hunter" - to get the anime json file in structured mode');
    console.log('node getanime.js "hunter x hunter" false - to get the anime json file in not structured mode (minimified file)');
    console.log("--------------------------------------------------------------------------------------------------------------");
    return;
}

//starting
displayInfo("Connexion en cours...");
api.loadAnime().then(async function(data){
    let anime = api.searchAnime(data, process.argv[2]);

    if(!anime || anime.length == 0) {
        displayError("Anime not found !");
        return;
    }

    anime = anime[0];

    displayInfo(`Lancement pour l'anime intitulé : \x1b[32m ${anime.title} \x1b[37m`);

    displayInfo("Getting informations...");
    const infos = await api.getMoreInformation(anime.url).catch((error) => displayError(error));
    anime = Object.assign(anime, infos);
    displayInfo("OK.");

    delete anime.url;

    displayInfo("Getting videos...");
    let index = 0;
    if(anime['eps'].length <= 200) for(const episode of anime['eps']){
        index++;

        displayInfo(`Episodes \x1b[31m ${index} \x1b[37m [${anime.title}]`);

        const embed = await api.getEmbed(episode.url).catch((error) => displayError(error));

        delete episode.url;

        episode.embed = embed ? embed : [];
    };
    displayInfo("OK.");

    const fileName = anime.title.replace(/[:,;\/\\!\%\?\.\<\>\~\&\=\+]/gi, "");
    const content = process.argv[3] ? JSON.stringify(anime) : JSON.stringify(anime, undefined, 4);
    fs.writeFile(`./data/${fileName}.json`, content, function(err) {
        if(err) {
            return displayError(err);
        }
        displayInfo("SAVED in data directory");
    }); 

    
}).catch(function(error){
    displayError(error);
});