const WebtoonDownloader = require('./WebtoonDownloader');

(async () => {
    const webtoonDownloader = new WebtoonDownloader(1102);
    await webtoonDownloader.setWebtoonDataFromRequest();
    webtoonDownloader.downloadEpisodes('./', 1, 50);
})();
