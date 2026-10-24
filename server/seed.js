import 'dotenv/config';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';
import { pool, query } from './db.js';
import { users } from './store.js';

const dir = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  await query(fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8'));
  console.log('Schema applied.');

  const { ADMIN_NAME = 'Abpure Admin', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');

  if (await users.byEmail(ADMIN_EMAIL)) {
    console.log(`Admin ${ADMIN_EMAIL} already exists.`);
  } else {
    await users.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: 'admin',
      verified: true,
    });
    console.log(`Admin ${ADMIN_EMAIL} created.`);
  }
}

run()
  .catch((e) => { console.error(e.message); process.exitCode = 1; })
  .finally(() => pool.end());
