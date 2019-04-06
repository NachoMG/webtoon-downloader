const util = require('util');
const fs = require('fs');

const request = require('request');
const cheerio = require('cheerio');

const promisifiedRequest = util.promisify(request);

const TITLE_URL = 'https://www.webtoons.com/a/b/c/list';
const EPISODE_URL = 'https://www.webtoons.com/a/b/c/d/viewer';
const HEADERS = { Referer: 'https://www.webtoons.com/' };

class WebtoonDownloader {
  constructor(titleNo) {
    if (!Number.isInteger(titleNo)) {
      throw TypeError('Value `titleNo` should be an integer.');
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

  getDir() { return this.dir; }

  async setWebtoonDataFromRequest() {
    const options = {
      url: TITLE_URL,
      headers: HEADERS,
      qs: { title_no: this.titleNo },
    };
    const response = await promisifiedRequest(options);
    if (!response || response.statusCode !== 200) {
      throw Error('Error while getting title data.');
    }
    const $ = cheerio.load(response.body);
    this.totalEpisodes = $('#_listUl li').first().data('episode-no');
    this.title = $('h1').text();
    this.genre = $('h2.genre').text();
    this.author = $('.info .author').contents().get(0).nodeValue;
  }

  downloadEpisodes(dir = './', from, to) {
    const options = {
      url: EPISODE_URL,
      headers: HEADERS,
      qs: {
        title_no: this.titleNo,
      },
    };

    for (let i = from; i <= to; i++) {
      const episodeNumber = i;
      options.qs.episode_no = episodeNumber;
      request(options, (error, response, body) => {
        console.log(`downloading ${episodeNumber}`);
        if (error || !response) {
          throw Error('Error getting title data.');
        } else if (response.statusCode !== 200) { 
          console.log(`episode ${episodeNumber} couldn't be downloaded.`);
        } else {
          const destination = `${dir}${this.title}/${episodeNumber}/`;
          try {
            fs.mkdirSync(destination, { recursive: true });
          } catch (error) {
            if (error.code !== 'EEXIST') {
              throw error;
            }
          }
          const $ = cheerio.load(body);
          $('#_imageList img').each((i, element) => {
            const url = $(element).data('url');
            request({ url, headers: HEADERS }).pipe(fs.createWriteStream(destination + '/' + (i + 1) + '.jpg'));
          });
        }
      });
    }
  }
}

module.exports = WebtoonDownloader;
