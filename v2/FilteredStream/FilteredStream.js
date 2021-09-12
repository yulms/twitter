/* vanilla filtered stream
documentation
https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/integrate/build-a-rule

example
https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/main/Filtered-Stream/filtered_stream.js
*/

import 'dotenv/config';
import needle from 'needle';

class FilteredStream {
  rulesUrl = 'https://api.twitter.com/2/tweets/search/stream/rules';
  filteredStreamUrl = 'https://api.twitter.com/2/tweets/search/stream';

  async getAllRules() {
    const response = await needle('get', this.rulesUrl, {
      headers: {
        authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });
    if (response.statusCode !== 200) {
      console.log('Error:', response.statusMessage, response.statusCode);
      throw new Error(response.body);
    }
    return (response.body);
  }

  async deleteAllRules(rules) {
    if (!Array.isArray(rules.data)) {
      return null;
    }
    const ids = rules.data.map((rule) => rule.id);
    const data = {
      delete: {
        ids,
      },
    };
    const response = await needle('post', this.rulesUrl, data, {
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });
    if (response.statusCode !== 200) {
      throw new Error(response.body);
    }
    return (response.body);
  }

  async setRules(rules) {
    const data = { add: rules };
    const response = await needle('post', this.rulesUrl, data, {
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });
    console.log(response.body);

    if (response.statusCode !== 201) {
      throw new Error(`Статус ответа: ${response.statusCode},\n${response.body.title}\n${response.body.detail}\n${response.body.type}`);
    }
    return (response.body);
  }

  streamConnect(retryAttempt = 0) {
    const stream = needle.get(this.filteredStreamUrl, {
      headers: {
        'User-Agent': 'v2FilterStreamJS',
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
      timeout: 20000,
    });

    stream.on('data', (data) => {
      try {
        const json = JSON.parse(data);
        console.log(json);
        // A successful connection resets retry count.
        retryAttempt = 0; // eslint-disable-line
      } catch (err) {
        // Catches error in case of 401 unauthorized error status.
        if (data.status === 401) {
          console.log(data);
          process.exit(1);
        } else if (data.detail === 'This stream is currently at the maximum allowed connection limit.') {
          console.log(data.detail);
          process.exit(1);
        } else {
          // Keep alive signal received. Do nothing.
        }
      }
    }).on('err', (err) => {
      if (err.code !== 'ECONNRESET') {
        console.log(err.code);
        process.exit(1);
      } else {
        // This reconnection logic will attempt to reconnect when a disconnection is detected.
        // To avoid rate limits, this logic implements exponential backoff, so the wait time
        // will increase if the client cannot reconnect to the stream.
        setTimeout(() => {
          console.warn('A connection error occurred. Reconnecting...');
          this.streamConnect(retryAttempt + 1);
        }, 2 ** retryAttempt);
      }
    });

    return stream;
  }
}

async function streamConnect() {
  const filteredStream = new FilteredStream();
  const rules = [
    {
      value: 'from:Yury73128589',
    },
  ];
  try {
    await filteredStream.deleteAllRules(rules);
    await filteredStream.setRules(rules);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
  filteredStream.streamConnect();
}

streamConnect();
