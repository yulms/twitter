/*
* Поиск последних твитов (за 7 дней) - задержка ~ 12 сек
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

async function getRecentTwits() {
  const recentSearch = new RecentSearch();
  const params = {
    query: 'from:Yury73128589',
  };
  try {
    const response = await recentSearch.getRequest(params);
    /* response {
      data: [
        { id: '1439473938283773954', text: 'И снова привет!' },
        { id: '1439473183606837249', text: 'Hi!' }
      ],
      meta: {
        newest_id: '1439473938283773954',
        oldest_id: '1439473183606837249',
        result_count: 2
      }
    } */
    console.dir(response, {
      depth: null,
    });
    // const latestTweet = response.data[0].text;
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }
}

getRecentTwits();
