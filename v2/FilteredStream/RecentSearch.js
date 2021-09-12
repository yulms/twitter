/*
Поиск последних твитов - задержка ~ 12 сек
documentation
https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference

example
https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/main/Recent-Search/recent_search.js

rate-limits (requests per 15-minute):
Per App - 450
Per user - 180

поиск id по имени
https://codeofaninja.com/tools/find-twitter-id/
*/

import 'dotenv/config';
import needle from 'needle';

class RecentSearch {
  endpointUrl = 'https://api.twitter.com/2/tweets/search/recent';

  async getRequest(params) {
    const res = await needle('get', this.endpointUrl, params, {
      headers: {
        'User-Agent': 'v2RecentSearchJS',
        authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });
    if (res.body) {
      return res.body;
    }
    throw new Error('Unsuccessful request');
  }
}

async function getRecentTwits(count = 1) {
  console.log(count);
  const recentSearch = new RecentSearch();
  const params = {
    query: 'from:Yury73128589',
  };
  try {
    const response = await recentSearch.getRequest(params);
    // console.dir(response, {
    //   depth: null,
    // });
    const latestTweet = response.data[0].text;
    if (latestTweet === 'catch4!') {
      console.log('Попался!', latestTweet);
      return;
    }
    setTimeout(getRecentTwits, 1000, count + 1);
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }
}

getRecentTwits();
