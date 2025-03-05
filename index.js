const fs = require("fs");
const pLimit = require("p-limit").default;

const getAnimeList = require("./utils/getAnimeList");
const getInfoAnime = require("./utils/getInfoAnime");
const getLinkDownloads = require("./utils/getLinkDownloads");
const getDetailsEpisode = require("./utils/getDetailsEpisode");

const CONCURRENCY_LIMIT = 5;
const EPISODE_CONCURRENCY_LIMIT = 3;
const OUTPUT_FILE = "./data/result.json";
let animes = [];

// Pastikan folder data ada
if (!fs.existsSync("./data")) fs.mkdirSync("./data", { recursive: true });

// Cek apakah file sudah ada, jika belum, buat array kosong
if (!fs.existsSync(OUTPUT_FILE)) fs.writeFileSync(OUTPUT_FILE, "[]", "utf-8");


/**
 * Simpan data anime ke dalam file JSON
 *
 * @param {object[]} animes Data anime yang akan disimpan
 */
function saveAnimes(animes) {
  try {
    // Baca file JSON yang ada
    let existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));

    // Gabungkan data anime baru
    existingData = existingData.concat(animes);

    // Simpan kembali ke file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existingData, null, 2), "utf-8");
    console.log(`💾 Saved: ${animes.length} animes`);
  } catch (err) {
    console.error("Error saving data:", err);
  }
}

(async () => {
  const limit = pLimit(CONCURRENCY_LIMIT);
  let items = await getAnimeList();

  let animePromises = items.map((item, index) =>
    limit(async () => {
      try {
        console.log(`⏳ [${index + 1}/${items.length}] | ${item.title}`);

        let animeData = await getInfoAnime(item.link);
        let episode_list = animeData.episode_list;
        if (!episode_list) {
          console.log(`⏭️ ${item.title} (No episodes found)`);
          return null;
        }

        const episodeLimit = pLimit(EPISODE_CONCURRENCY_LIMIT);
        await Promise.all(
          episode_list.map((episode, i) =>
            episodeLimit(async () => {
              console.log(`  📥 Downloading episode ${i + 1}/${episode_list.length} of ${item.title}`);
              let [link_downloads, details] = await Promise.all([
                getLinkDownloads(episode.link),
                getDetailsEpisode(episode.link),
              ]);

              episode_list[i].link_downloads = link_downloads;
              episode_list[i].details = details;
            })
          )
        );

        // Simpan anime setelah semua episodenya berhasil diunduh
        animes.push(animeData)
      } catch (error) {
        saveAnimes(animes);
      }
    })
  );

  await Promise.all(animePromises);
  saveAnimes(animes);

  console.log("✅ Fetching complete!");
})();
