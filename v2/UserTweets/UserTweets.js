/*
Поиск твита юзера. Задержка - около 8 сек.
documentation
https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/introduction

example
https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/main/User-Tweet-Timeline/user_tweets.js

rate-limits (requests per 15-minute):
Per App - 1500
Per user - 900

поиск id по имени
https://codeofaninja.com/tools/find-twitter-id/
*/

import 'dotenv/config';
import needle from 'needle';

class UserTweets {
  constructor({ userId, userName }) {
    this.userId = userId;
    this.userName = userName;
    this.url = `https://api.twitter.com/2/users/${userId}/tweets`;
    // для поиска по имени аккаунта - почему то возвращает 404, проблема твиттера?
    // this.url = `https://api.twitter.com/2/users/by/username/${userName}/tweets`;
    console.log(this.url);
  }

  async getUserTweets(startTime) {
    const userTweets = [];
    // we request the author_id expansion so that we can print out the user name later
    const params = {
      max_results: 100,
      'tweet.fields': 'created_at',
      expansions: 'author_id',
      start_time: startTime,
    };

    const options = {
      headers: {
        'User-Agent': 'v2UserTweetsJS',
        authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    };

    let hasNextPage = true;
    let nextToken = null;
    let userName;
    console.log('Retrieving Tweets...');

    while (hasNextPage) {
      const resp = await this.#getPage(params, options, nextToken); // eslint-disable-line
      if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
        userName = resp.includes.users[0].username;
        if (resp.data) {
          userTweets.push.apply(userTweets, resp.data); // eslint-disable-line
        }
        if (resp.meta.next_token) {
          nextToken = resp.meta.next_token;
        } else {
          hasNextPage = false;
        }
      } else {
        hasNextPage = false;
      }
    }

    console.log(`Got ${userTweets.length} Tweets from ${userName} (user ID ${this.userId})!`);
    return userTweets;
  }

  async #getPage(params, options, nextToken) {
    if (nextToken) {
      params.pagination_token = nextToken;
    }
    try {
      const resp = await needle('get', this.url, params, options);
      if (resp.statusCode !== 200) {
        console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
        return null;
      }
      return resp.body;
    } catch (err) {
      throw new Error(`Request failed: ${err}`);
    }
  }
}

// async function startRecursion(count = 1) {
//   const userId = '1392380359342444545'; // Yury73128589
//   const userTweets = new UserTweets(userId);
//   const tweets = await userTweets.getUserTweets();
//   const latestTweet = tweets[0].text;
//   if (latestTweet === 'catch2!') {
//     console.log('Попался!', latestTweet);
//     return;
//   }
//   setTimeout(startRecursion, 300, count + 1);
// }
// startRecursion();

// const userTweets = new UserTweets({ userId: '574032254' }); // coinbase
// const relevanceKeyword = 'launching on';
const userTweets = new UserTweets({ userId: '720487892670410753' }); // coinbasePro
const relevanceKeyword = 'are now available in the regions';
const tweets = await userTweets.getUserTweets('2021-03-19T00:00:00Z'); // ISO
const relevanceTweets = tweets.filter((tweet) => tweet.text.includes(relevanceKeyword));
console.log(`Всего релевантных твитов: ${relevanceTweets.length}`);
// console.log(relevanceTweets);

// const relevanceTweetsText = relevanceTweets.map((tweet) => tweet.text);
const relevanceTweetsDayOfWeek = relevanceTweets.map((tweet) => new Date(tweet.created_at).getDay());
console.log(relevanceTweetsDayOfWeek);

// console.log(relevanceTweetsText.length);
// console.log(relevanceTweetsText);
