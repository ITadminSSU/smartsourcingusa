# Deploying to Hostinger + using the Admin Portal

This site is a Next.js (Node.js) app. It needs a plan that runs Node.js, which means
**Hostinger Business** or any **Cloud** plan (the Premium/Single shared plans do NOT run Node.js).

---

## 1. Create the MySQL database (in Hostinger)

1. hPanel → **Databases** → **MySQL Databases**.
2. Create a new database. Note the **database name, username, password, and host**.
3. Open **phpMyAdmin** for that database → **SQL** tab.
4. Paste the contents of `database/schema.sql` from this project and run it.
   - This creates the `admin_users` and `case_study_stats` tables and seeds the current numbers.

## 2. Deploy the website (Node.js app)

1. hPanel → **Websites / Node.js app** → create a new Node.js app.
2. Connect this **GitHub repository** (or upload a ZIP of the project — without `node_modules` and `.next`).
3. Build command: `npm run build` — Start command: `npm run start` — Node version: 20.x or newer.

## 3. Set environment variables

In the Node.js app settings, add these (see `.env.example`):

| Variable | Value |
|----------|-------|
| `MYSQL_HOST` | from step 1 (often `localhost`) |
| `MYSQL_PORT` | `3306` |
| `MYSQL_USER` | from step 1 |
| `MYSQL_PASSWORD` | from step 1 |
| `MYSQL_DATABASE` | from step 1 |
| `SESSION_SECRET` | a long random string (32+ characters) |
| `SMTP_*` / `CONTACT_EMAIL_*` | your contact-form email settings |

Redeploy after saving the variables.

---

## 4. Create the first admin account

1. Visit **`https://yourdomain.com/admin/setup`**.
2. Enter your name, email, and a password (8+ characters). This is a **one-time** setup —
   once the first account exists, this page automatically sends everyone to the login page.

## 5. Everyday use

- **Log in:** `https://yourdomain.com/admin/login` (the password field has a **Show** button
  so you can confirm what you typed).
- **Update the numbers:** edit the 5 fields → **Save numbers**. The public
  **Case Studies** page updates immediately.
- **Add teammates (Admins only):** in the dashboard, use **Team access → Add team member**
  and choose a role:
  - **Admin** — can edit numbers AND manage the team.
  - **Editor** — can edit numbers only (cannot add/remove users). Use this for most people
    so they can't accidentally remove others.
- **Recent activity:** the dashboard shows a log of who changed the numbers, who added/removed
  team members, and recent logins — with timestamps.

> Safety: the system won't let you remove the **last** admin or delete your own account while
> logged in. The first account created at `/admin/setup` is always an Admin.

## Already set up an older version?

If you created the database before roles/activity log existed, run
`database/migration-roles-and-log.sql` once in phpMyAdmin (it adds the `role` column and the
`activity_log` table), then set your main account to admin with the UPDATE line inside that file.

The 5 numbers shown publicly are:
Total number of bids, Bids for exterior, Bids for drywall, Exterior bid amount, Drywall amount.

---

## Notes

- The public Case Studies page shows animated counters that count up when scrolled into view.
- If the database isn't connected yet, the page shows safe default numbers and `/admin`
  explains what's missing — nothing crashes.
- `/admin` is hidden from search engines (no-index).
