/*
import { DB } from "@/db";
import { tag } from "@/db/schema";
import { TagSchemaType } from "@/db/schema/blog/tag";
import { faker } from "@faker-js/faker";

const mock = () => {
	const data: TagSchemaType[] = [];

	for (let i = 0; i < 10; i++) {
		data.push({
			name: faker.lorem.word({ length: 15 }),
		});
	}

	return data;
};

export async function seed(db: DB) {
	await db.insert(tag).values(mock());
}
*/
