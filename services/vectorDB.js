require("dotenv").config({ path: "../.env" });
const { Index, Vector } = require('@upstash/vector');

const VECTOR_DB_URL = process.env.UPSTASH_VECTOR_REST_URL;
const VECTOR_DB_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;

const upstashVector = new Index({
  url: VECTOR_DB_URL,
  token: VECTOR_DB_TOKEN,  // from Upstash console
});

module.exports = upstashVector;
