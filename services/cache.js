const keys = require("../config/keys");
const redis = require("redis");
const redisUrl = keys.redisUrl;
const client = redis.createClient(redisUrl);
const { promisify } = require("util");
client.hget = promisify(client.hget);

const mongoose = require("mongoose");

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;

  this.hashKey = JSON.stringify(options.key || "");

  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify({
    ...this.getFilter(),
    collection: this.mongooseCollection.name,
  });

  const cachedValue = await client.hget(this.hashKey, key);

  if (cachedValue) {
    const objOrArr = JSON.parse(cachedValue);

    console.log("Served from cache");
    return Array.isArray(objOrArr)
      ? objOrArr.map((obj) => new this.model(obj))
      : new this.model(objOrArr);
  }

  const result = await exec.apply(this, arguments);

  client.hset(this.hashKey, key, JSON.stringify(result));

  console.log("Served from db");
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
