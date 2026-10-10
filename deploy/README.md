# Hubfly deployment

The frontend runs in Nginx and proxies `/api` to the private Express API. PostgreSQL and the API do not require public endpoints. The API and PostgreSQL must stay awake for reminders and email delivery.

## Current project

- Project: `deutsch-sprache-rwanda`
- ID: `prj_3ab27652-f90f-4dd1-8a19-86ddade0b63d`
- Region: `eu-central`
- Public app: https://deutsch-sprache-rwanda.eu1.hubfly.app
- API container: `cont_b79ce9a8-1304-4683-b7a3-c9aee303db8e`
- Frontend container: `cont_10143c56-0ed1-4cfa-bb3f-facaaadd273b`
- Database container: `cont_1975f728-0cd2-4814-a9f2-1bc0d1d6dbd1`
- PostgreSQL uses a dedicated persistent volume; `/app/uploads` uses a separate volume.
- Runtime manifests are `backend/hubfly.build.json` and `frontend/hubfly.build.json`. They contain secrets and are gitignored. Preserve their project and container bindings.

## Release commands

From the repository root, inspect the changes before deploying:

```sh
hubfly deploy plan --config backend/hubfly.build.json --mode smart --json
hubfly deploy --config backend/hubfly.build.json --mode smart --yes
hubfly deploy plan --config frontend/hubfly.build.json --mode smart --json
hubfly deploy --config frontend/hubfly.build.json --mode smart --yes
```

The backend applies existing Prisma migrations on startup. Never run the ordinary demo seed against the hosted database: it resets passwords and creates unrelated demo records.

## Launch data

The local database was copied into an isolated release database. Operational data and original users were removed from that copy. The prepared A1 curriculum retains its IDs, content, prerequisites, and publication states. Other levels retain their configuration without generic demo lessons. Five new role accounts were created, and the demo student was enrolled in a waived A1 demo class assigned to the demo teacher.

Private backups, account credentials, deployment logs, and verification results are under `.deployment-private/`. This folder is gitignored and must not be included in images or Git commits.

## Operations

- Verify `/api/health` after every release; it checks database connectivity.
- Configure `PUBLIC_APP_URL` and `CORS_ORIGINS` for the actual frontend hostname. When updating the environment through the API, send the complete variable list: the current platform replaces that list rather than merging individual entries.
- Configure SMTP or the HTTPS email relay for password reset and email notifications.
- Keep API responses and authenticated resources out of any public edge cache.
- Verify the volume backup destination and perform a restore test before using real student data. A requested daily backup schedule alone is not proof of a working backup.
- Use `hubfly deploy status <buildId>` and `hubfly deploy events <buildId>` to confirm terminal deployment success.
