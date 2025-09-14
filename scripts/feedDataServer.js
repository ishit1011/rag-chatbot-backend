require("dotenv").config({ path: "../.env" });

const Parser = require("rss-parser");
const cheerio = require("cheerio");
const upstashVector = require("../services/vectorDB");

// const upstashVector = new Index({
//   url: process.env.UPSTASH_VECTOR_URL,
//   token: process.env.UPSTASH_VECTOR_TOKEN,
// });

const JINA_API_URL = process.env.JINA_API_URL;
const JINA_API_KEY = process.env.JINA_API_KEY;

// 1. Injest news articles
const injestNews = async () => {
  const parser = new Parser();
  const feeds = [
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://feeds.nbcnews.com/nbcnews/public/news",
    "https://www.cnbc.com/id/100727362/device/rss/rss.html",
    "https://abcnews.go.com/abcnews/internationalheadlines",
    "https://www.aljazeera.com/xml/rss/all.xml",
    "https://www.cbsnews.com/latest/rss/world",
    "https://www.france24.com/en/rss",
    "https://feeds.washingtonpost.com/rss/world",
    "https://globalnews.ca/world/feed/",
    "https://feeds.feedburner.com/time/world",
    "https://feeds.npr.org/1004/rss.xml",
    "https://www.washingtontimes.com/rss/headlines/news/world",
    "https://www.smh.com.au/rss/world.xml",
    "https://feeds.skynews.com/feeds/rss/world.xml",
    "https://www.latimes.com/world-nation/rss2.0.xml#nt=1col-7030col1",
    "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms",
    "https://www.rt.com/rss/news/",
    "https://feeds.feedburner.com/ndtvnews-world-news",
    "https://www.e-ir.info/feed/",
    "https://www.thesun.co.uk/news/worldnews/feed/",
    "https://www.globalissues.org/news/feed",
    "https://www.mirror.co.uk/news/world-news/?service=rss",
    "https://www.thecipherbrief.com/feed",
    "https://feeds.feedburner.com/daily-express-world-news",
    "https://www.vox.com/rss/world-politics/index.xml",
    "https://www1.cbn.com/app_feeds/rss/news/rss.php?section=world&mobile=false&q=cbnnews/world/feed",
    "https://warontherocks.com/feed/",
    "https://defence-blog.com/feed/",
    "https://ifpnews.com/feed/",
    "https://dailyresearchplot.com/feed/",
    "https://wan-ifra.org/news/feed/",
    "https://feeds.thelocal.com/rss/es",
    "https://easternherald.com/feed/",
    "https://www.watchdoguganda.com/feed",
    "https://www.headlinesoftoday.com/feed",
    "https://quintdaily.com/feed/",
    "https://articleify.com/feed/",
    "https://internewscast.com/feed/",
    "https://newsblaze.com/feed/",
    "https://wowplus.net/feed/",
    "https://www.theunionjournal.com/feed/",
    "https://globalpressjournal.com/feed/",
    "https://radarr.africa/feed/",
    "https://www.thenexthint.com/feed/",
    "https://newslanes.com/feed/",
    "https://www.akinblog.com/feed/",
    "https://publicnewsupdate.com/feed/",
    "https://www.usnn.news/feed/",
    "http://worldunitednews.blogspot.com/feeds/posts/default",
  ];

//     const feeds = [
//     "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
//   ];

  let articles = [];

  for (const feed of feeds) {
    try {
      console.log(`🔗 Fetching feed: ${feed}`);
      const rss = await parser.parseURL(feed);
      console.log(`📑 Found ${rss.items.length} items in feed`);

      for (const entry of rss.items.slice(0, 10)) {
        console.log(`➡️ Processing article: ${entry.title}`);
        const res = await fetch(entry.link);
        const html = await res.text();
        const $ = cheerio.load(html);
        const text = $("p").text();

        articles.push({
          id: entry.link,
          title: entry.title,
          url: entry.link,
          published: entry.pubDate,
          content_raw: text,
        });
      }
    } catch (error) {
      console.error(`⚠️ Failed to fetch feed ${feed}:`, error.message);
      continue; // skip this feed and move to the next
    }
  }

  console.log("✅ Saved articles:", articles.length);
  return articles;
};

// 2. Chunk news articles
const chunkText = (text, chunkSize = 500, overlap = 50) => {
  const words = text.split(" ");
  const chunks = [];
  let start = 0;

  while (start < words.length) {
    const chunk = words.slice(start, start + chunkSize).join(" ");
    chunks.push(chunk);
    start += chunkSize - overlap;
  }

  console.log(`✂️ Chunked into ${chunks.length} parts`);
  return chunks;
};

// 3. Embedd chunks (JINA vector embeddings)
const jinaEmbed = async (text) => {
  console.log("🔄 Creating embedding for chunk...");
  const res = await fetch(JINA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JINA_API_KEY}`,
    },
    body: JSON.stringify({
      model: "jina-embeddings-v2-base-en",
      input: text,
    }),
  });

  const data = await res.json();
  console.log("✅ Got embedding of length:", data.data[0].embedding.length);
  return data.data[0].embedding;
};

const main = async () => {
  console.log("🚀 Starting ingestion pipeline...");
  const articles = await injestNews();

  for (let i = 0; i < articles.length; i++) {
    console.log(`📰 Processing article #${i + 1}: ${articles[i].title}`);
    const text = articles[i].content_raw;

    // 1. break single article into chunks
    const chunks = chunkText(text);

    for (let j = 0; j < chunks.length; j++) {
      const oneChunk = chunks[j];
      console.log(
        `   📦 Chunk ${j + 1}/${chunks.length}, length: ${oneChunk.length}`
      );

      // 2. create JINA vector embedding
      const vectorEmbed = await jinaEmbed(oneChunk);

      // 3. Upsert to Upstash vector DB
      console.log("   ⬆️ Upserting chunk to Upstash...");
      await upstashVector.upsert([
        {
          id: `${i + 1}-${j + 1}`,
          vector: vectorEmbed,
          metadata: {
            articleId: i + 1,
            title: articles[i].title,
            text: oneChunk,
          },
        },
      ]);

      console.log(`   ✅ Chunk ${j + 1} stored`);
    }
  }

  console.log("🎉 All articles ingested into Upstash Vector DB!");
};

// main();

module.exports = {jinaEmbed}
