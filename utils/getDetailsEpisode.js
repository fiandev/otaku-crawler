const axios = require("axios");
const cheerio = require("cheerio");

const { baseURL } = require("../constants/env.js");

const getDetailsEpisode = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    let result = {};
    
    result.stream_frame = $("#embed_holder #pembed iframe").attr("src");
    result.mirror_streams = [];
    
    $("#embed_holder .mirrorstream ul").map(function (){
      let url = $(this).find("li a").attr("data-content");
      let mirror = {};
      
      mirror.quality = $(this).attr("class").slice(1, $(this).attr("class").length);
      mirror.items = [];
      
      $(this).find("li").each(function (){
        mirror.items.push({
          vendor: $(this).find("li a").text().trim(),
          url: url ? "https://desustream.me/moedesu/stream/?id=" + url : result.stream_frame
        });
      });
      
      result.mirror_streams.push(mirror);
      
    });
    
    return result;
  } catch (err) {
    console.log({ err });
    return [];
  }
};

module.exports = getDetailsEpisode;