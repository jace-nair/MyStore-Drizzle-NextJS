import { sql, Table } from "drizzle-orm";

import { db, DB } from "@/db";
import * as schema from "@/db/schema";
import * as seeds from "@/db/seeds";

async function resetTable(db: DB, table: Table) {
  return db.execute(sql`truncate table ${table} restart identity cascade`);
}

async function main() {
  for (const table of [
    //schema.category,
    //schema.user,
    //schema.tag,
    //schema.post,
    //schema.postTags,
    //schema.comment,
    //schema.navLinks,
    schema.product,
    //schema.shopNavLinks,
    //schema.lmsNavLinks,
    //schema.contactNavLinks,
  ]) {
    await resetTable(db, table);
  }
  //await seeds.category(db);
  //await seeds.user(db);
  //await seeds.tag(db);
  //await seeds.post(db);
  //await seeds.postTags(db);
  //await seeds.comment(db);
  //await seeds.navLinks(db);
  await seeds.product(db);
  //await seeds.shopNavLinks(db);
  //await seeds.lmsNavLinks(db);
  //await seeds.contactNavLinks(db);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Seeding done!");
    process.exit(0);
  });
