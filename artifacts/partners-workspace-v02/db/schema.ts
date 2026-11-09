import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const workflowWorkspaces=sqliteTable('workflow_workspaces',{
 owner:text('owner').primaryKey(),revision:integer('revision').notNull().default(0),
 document:text('document').notNull(),updatedAt:text('updated_at').notNull()
});
