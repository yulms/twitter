/* vanilla Tweet Lookup
Поиск твита по ID
documentation
https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/introduction

example
https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/main/Tweet-Lookup/get_tweets_with_bearer_token.js
https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/main/Tweet-Lookup/get_tweets_with_user_context.js
*/

import 'dotenv/config';
import needle from 'needle';

// авторизация через bearer_token
class TweetLookup {
  endpointURL = 'https://api.twitter.com/2/tweets?ids=';

  async getRequest(params) {
    const res = await needle('get', this.endpointURL, params, {
      headers: {
        'User-Agent': 'v2TweetLookupJS',
        authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });
    if (res.body) {
      return res.body;
    }
    throw new Error('Unsuccessful request');
  }
}

async function makeRequest() {
  const tweetLookup = new TweetLookup();
  const params = {
    ids: '1437070873366773765',
    // поля, которые будут добавлены к ответу
    'tweet.fields': 'lang,author_id',
    'user.fields': 'created_at',
  };
  try {
    const response = await tweetLookup.getRequest(params);
    console.dir(response, {
      depth: null,
    });
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }
  process.exit();
}

makeRequest();
