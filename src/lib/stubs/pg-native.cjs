// Stub for `pg-native`, the optional native binding pg loads only in native
// mode. We never use native mode, and in the demo-deploy (Workers) build the
// whole pg/auth chain is bypassed at runtime — this stub exists solely so
// Nitro's Cloudflare bundler can resolve the `require('pg-native')` it finds in
// `pg/lib/native/client.js` (externals are disallowed on that target).
module.exports = {};
