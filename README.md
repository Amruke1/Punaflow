# PunaFlow

PunaFlow is a React + Supabase web application for connecting clients with independent workers and businesses.

## Main idea

The project helps:

- clients search for workers or businesses
- independent workers create a public mini-site
- workers manage clients, payments and busy dates
- businesses manage workers, payroll, job contests and a public business mini-site

## Main users

- **Clients**: search for workers and open public profiles.
- **Independent workers**: create a profile, mini-site, client list and planner.
- **Businesses**: add multiple workers, manage payroll, publish contests and create a business mini-site.

## Demo flow

Recommended live demo:

1. Open the app.
2. Go to **Punoj i Pavarur**.
3. Log in or sign up as an independent worker.
4. Create a worker profile.
5. Edit and publish the mini-site.
6. Add a client with dates and hours.
7. Show the planner with busy dates.
8. Open the public mini-site link.

Optional business demo:

1. Go to **Kam Biznes**.
2. Log in or sign up as a business.
3. Add workers.
4. Manage payroll.
5. Publish a business mini-site.
6. Publish a job contest.

## Tech stack

- React
- Vite
- React Router
- Supabase Auth
- Supabase workers table
- LocalStorage for local dashboard data

## Run locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:5173
```

## Documentation

Demo plan:

```txt
docs/demo-plan.md
```

Supabase setup:

```txt
supabase_setup.sql
```

## Current limitations

Some dashboard data is stored in `localStorage`. For a production version, clients, planner dates, payroll, contests and business mini-site data should be moved into Supabase tables with row-level security.

