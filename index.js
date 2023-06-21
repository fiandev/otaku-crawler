const fs = require("fs");

const getAnimeList = require("./utils/getAnimeList");
const getInfoAnime = require("./utils/getInfoAnime");
const getLinkDownloads = require("./utils/getLinkDownloads");

function save (data) {
  let content = JSON.stringify(data, null, 2);
  let path_output = "./data";
  let pathFile = "./data/result.json";
  
  if (!fs.existsSync(path_output)) fs.mkdirSync(path_output, { recursive: true });
  fs.writeFileSync(pathFile, JSON.stringify(data, null, 2));
}

( async () => {
  let result = [];
  let items = await getAnimeList();
  let counter = 1;
  for (let item of items) {
    console.log(`⏳ [${ counter }/${ items.length }] | ${item.title} `);
    let information = await getInfoAnime(item.link);
    let episode_list = information.episode_list;
    if (!episode_list) {
      console.log(`⏭️ ${ item.title }`);
      continue;
    };
    for (let i = 0; i < episode_list.length; i++) {
      let episode = episode_list[i];
      information.episode_list[i].link_downloads = await getLinkDownloads(episode.link);
    }
    
    result.push(information);
    
    save(result);
    counter++;
  }
  
  
})();