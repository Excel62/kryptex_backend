import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'deposits'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.decimal('amount', 10, 2).notNullable()
      table.string('currency', 10).notNullable()
      table.string('status').notNullable().defaultTo('pending') // e.g., 'pending', 'completed', 'failed'
      // table.boolean('is_active').notNullable().defaultTo(true) // Indicates if the deposit is still active or has been processed
      // table.timestamp('last_growth').nullable() // Last time the deposit was processed for growth
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}