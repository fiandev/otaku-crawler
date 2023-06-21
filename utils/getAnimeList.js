const axios = require("axios");
const cheerio = require("cheerio");
const { baseURL } = require("../constants/env.js");

let counter = 0;
module.exports = async function getAnimeList() {
  try {
    let response = await axios.get(`${ baseURL }/anime-list`);
    let html = response.data;
    let $ = cheerio.load(html);
    let items = [];
    
    $(".jdlbar li a").each(function () {
      items.push({
        title: $(this).text().trim(),
        link: $(this).attr("href"),
        status: !$(this).find("span").text() ? "completed" : "on-going",
      });
    });
    
   return items;
    
  } catch (e) {
    if (counter > 1000) throw new Error ("max thread reached!");
    else console.log(`[${ counter++ }] error: ${ e.message } ⏳`);
    
    let items = await getAnimeList();
    return items;
  }
};