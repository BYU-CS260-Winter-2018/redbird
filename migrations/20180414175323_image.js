exports.up = function(knex, Promise) {
  return knex.schema.table('tweets', function(table) {
    table.string('image').notNull().defaultTo("");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('tweets', function(table) {
    table.dropColumn('image');
  });
};
