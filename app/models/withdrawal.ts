import { DateTime } from 'luxon'
import { BaseModel, column,belongsTo } from '@adonisjs/lucid/orm'

import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Withdrawal extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare amount: number

  @column()
  declare currency: string

  @column()
  declare status: string // e.g., 'pending', 'completed', 'failed'
  
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
    declare user: BelongsTo<typeof User>
}