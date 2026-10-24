// All SQL lives here. Route handlers never write queries directly.
import { query } from './db.js';

const one = async (text, params) => (await query(text, params)).rows[0] || null;
const many = async (text, params) => (await query(text, params)).rows;

export const users = {
  byEmail: (email) => one('SELECT * FROM users WHERE lower(email)=lower($1)', [email]),
  byId: (id) => one('SELECT * FROM users WHERE id=$1', [id]),
  create: ({ name, email, passwordHash, role = 'customer', verifyToken = null, verified = false }) =>
    one(
      `INSERT INTO users (name,email,password_hash,role,verify_token,email_verified)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, email, passwordHash, role, verifyToken, verified]
    ),
  verifyEmail: (token) =>
    one('UPDATE users SET email_verified=TRUE, verify_token=NULL WHERE verify_token=$1 RETURNING *', [token]),
  setReset: (id, token, expires) =>
    query('UPDATE users SET reset_token=$2, reset_expires=$3 WHERE id=$1', [id, token, expires]),
  resetPassword: (token, passwordHash) =>
    one(
      `UPDATE users SET password_hash=$2, reset_token=NULL, reset_expires=NULL
       WHERE reset_token=$1 AND reset_expires > NOW() RETURNING *`,
      [token, passwordHash]
    ),
};

export const products = {
  list: (all = false) =>
    many(`SELECT * FROM products ${all ? '' : 'WHERE active'} ORDER BY created_at DESC`),
  create: ({ name, description, size, price, image_url }) =>
    one(
      'INSERT INTO products (name,description,size,price,image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, description, size, price, image_url]
    ),
  update: (id, { name, description, size, price, image_url, active }) =>
    one(
      `UPDATE products SET name=COALESCE($2,name), description=COALESCE($3,description),
       size=COALESCE($4,size), price=COALESCE($5,price), image_url=COALESCE($6,image_url),
       active=COALESCE($7,active) WHERE id=$1 RETURNING *`,
      [id, name, description, size, price, image_url, active]
    ),
  remove: (id) => query('DELETE FROM products WHERE id=$1', [id]),
  byIds: (ids) => many('SELECT * FROM products WHERE id = ANY($1::uuid[]) AND active', [ids]),
};

export const orders = {
  create: (o) =>
    one(
      `INSERT INTO orders (user_id,items,total,phone,address,payment_method,network,momo_number,reference)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [o.userId, JSON.stringify(o.items), o.total, o.phone, o.address,
       o.paymentMethod, o.network, o.momoNumber, o.reference]
    ),
  byId: (id) => one('SELECT * FROM orders WHERE id=$1', [id]),
  submitPayment: (id, { reference, transactionId, paidFrom }) =>
    one(
      `UPDATE orders SET payment_ref_entered=$2, txn_id=$3, paid_from=$4, status='awaiting_confirmation'
       WHERE id=$1 RETURNING *`,
      [id, reference, transactionId, paidFrom]
    ),
  setStatus: (id, status) => one('UPDATE orders SET status=$2 WHERE id=$1 RETURNING *', [id, status]),
  forUser: (userId) => many('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [userId]),
  all: () =>
    many(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o LEFT JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC`
    ),
};

export const team = {
  list: () => many('SELECT * FROM team_members ORDER BY sort_order, name'),
  create: ({ name, title, tagline, photo_url, sort_order }) =>
    one(
      `INSERT INTO team_members (name,title,tagline,photo_url,sort_order)
       VALUES ($1,$2,$3,$4,COALESCE($5,(SELECT COALESCE(MAX(sort_order),0)+1 FROM team_members))) RETURNING *`,
      [name, title, tagline || null, photo_url || null, sort_order ?? null]
    ),
  update: (id, { name, title, tagline, photo_url, sort_order }) =>
    one(
      `UPDATE team_members SET name=COALESCE($2,name), title=COALESCE($3,title), tagline=COALESCE($4,tagline),
       photo_url=COALESCE($5,photo_url), sort_order=COALESCE($6,sort_order) WHERE id=$1 RETURNING *`,
      [id, name ?? null, title ?? null, tagline ?? null, photo_url ?? null, sort_order ?? null]
    ),
  remove: (id) => query('DELETE FROM team_members WHERE id=$1', [id]),
};
