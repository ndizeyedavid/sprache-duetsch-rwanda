# Original coursebooks

`Deutsch_A1_Kursbuch.pdf` is the unchanged 215-page source used for the A1 import.
Keep this directory alongside `dist/` when deploying the API. The authenticated
coursebook endpoints enforce student level access before serving these files.

Add future originals to this directory and register their level code, filename
and page count in `src/modules/content/coursebook.service.ts`.
