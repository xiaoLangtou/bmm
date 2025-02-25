import { relations } from 'drizzle-orm'
import {
  alias,
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const publicTags = pgTable('publicTags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  icon: varchar('icon', { length: 255 }),
  color: varchar('color', { length: 255 }),
  isMain: boolean('isMain').default(true),
  pinyin: varchar('pinyin', { length: 255 }).notNull().default(''),
  sortOrder: integer('sortOrder').default(0),
  createdAt: timestamp('createdAt', { mode: 'date' }).$defaultFn(() => new Date()),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).$defaultFn(() => new Date()),
})
// 通过 relations() 让 TS 知道 publicTags 还有个 'relatedTags' 字段
export const publicTagRelations = relations(publicTags, (ctx) => ({
  relatedTagIds: ctx.many(publicTagToTag),
  relatedBookmarkIds: ctx.many(publicBookmarkToTag),
}))

/**
 * Tag : Tag = M : N
 */
export const publicTagToTag = pgTable(
  'publicTagToTag',
  {
    a: serial('a')
      .notNull()
      .references(() => publicTags.id, { onDelete: 'cascade' }),
    b: serial('b')
      .notNull()
      .references(() => publicTags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.a, table.b] })]
)

export const publicTagToTagRelations = relations(publicTagToTag, (ctx) => {
  // 表别名在自连接的场景中很重要
  const aliasPublicTags = alias(publicTags, 'aliasPublicTags')
  return {
    tagA: ctx.one(publicTags, {
      fields: [publicTagToTag.a],
      references: [publicTags.id],
    }),
    tagB: ctx.one(aliasPublicTags, {
      fields: [publicTagToTag.b],
      references: [aliasPublicTags.id],
    }),
  }
})

export const publicBookmarks = pgTable('publicBookmarks', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  url: varchar('url', { length: 255 }).unique().notNull(),
  icon: varchar('icon', { length: 255 }),
  pinyin: varchar('pinyin', { length: 255 }),
  description: varchar('description', { length: 255 }),
  isPinned: boolean('isPinned'),
  createdAt: timestamp('createdAt', { mode: 'date' }).$defaultFn(() => new Date()),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).$defaultFn(() => new Date()),
})
export const publicBookmarkRelations = relations(publicBookmarks, (ctx) => ({
  relatedTagIds: ctx.many(publicBookmarkToTag),
}))

/**
 * Bookmark : Tag = M : N
 */
export const publicBookmarkToTag = pgTable(
  'publicBookmarkToTag',
  {
    bId: serial('bId')
      .notNull()
      .references(() => publicBookmarks.id, { onDelete: 'cascade' }),
    tId: serial('tId')
      .notNull()
      .references(() => publicTags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.bId, table.tId] })]
)

export const publicBookmarkToTagRelations = relations(publicBookmarkToTag, (ctx) => {
  return {
    bookmark: ctx.one(publicBookmarks, {
      fields: [publicBookmarkToTag.bId],
      references: [publicBookmarks.id],
    }),
    tag: ctx.one(publicTags, {
      fields: [publicBookmarkToTag.tId],
      references: [publicTags.id],
    }),
  }
})
