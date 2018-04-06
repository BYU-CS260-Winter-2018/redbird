exports.up = function(knex, Promise) {
    return Promise.all([
    knex.schema.createTable('followers', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users');
      table.integer('follows_id').unsigned().notNullable().references('id').inTable('users');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('followers'),
  ]);
};
