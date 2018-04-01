exports.up = function(knex, Promise) {
  return Promise.all([
    knex.raw("alter table tweets add fulltext(tweet)"),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.raw("alter table tweets drop index tweet"),
  ]);
};
