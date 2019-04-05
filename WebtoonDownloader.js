const util = require('util');
const request = util.promisify(require('request'));
const cheerio = require('cheerio');

const TITLE_URL = 'https://www.webtoons.com/a/b/c/list';
const EPISODE_URL = 'https://www.webtoons.com/a/b/c/d/viewer';
const HEADERS = { Referer: 'https://www.webtoons.com/' };

class WebtoonDownloader {
  constructor(titleNo) {
    if (!Number.isInteger(titleNo)) {
      throw Error('Value `titleNo` should be an integer.');
    }
    this.titleNo = titleNo;
    this.totalEpisodes = 0;
    this.title = '';
    this.genre = '';
    this.author = '';
  }

  getTitleNo() { return this.titleNo; }

  getTotalEpisodes() { return this.totalEpisodes; }

  getTitle() { return this.title; }

  getGenre() { return this.genre; }

  getAuthor() { return this.author; }

  async setWebtoonDataFromRequest() {
    const options = {
      url: TITLE_URL,
      headers: HEADERS,
      qs: { title_no: this.titleNo },
    };
    const response = await request(options);
    if (!response || response.statusCode !== 200) {
      throw Error('Error getting title data.');
    }
    const $ = cheerio.load(response.body);
    this.totalEpisodes = $('#_listUl li').first().data('episode-no');
    this.title = $('h1').text();
    this.genre = $('h2.genre').text();
    this.author = $('.info .author').contents().get(0).nodeValue;
  }
}

module.exports = WebtoonDownloader;
