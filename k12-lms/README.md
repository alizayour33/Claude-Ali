# BrightPath K-12 LMS

A lightweight learning management system (LMS) for a K-12 school curriculum, from Kindergarten to Grade 12. It
plays **SCORM 1.2 and SCORM 2004** packages, saves each learner's progress, score and time, and gives
teachers a results dashboard.

The showcase content is a **Grade 9 Science** SCORM 1.2 lesson, *Atoms, Elements & the Periodic Table*.
It loads automatically the first time the app starts.

## Run it

```bash
cd k12-lms
npm install
npm start            # http://localhost:4000
npm test             # API + SCORM parser tests
```

Requires Node.js 18 or newer. Data is stored in `k12-lms/data/` (`db.json` plus the extracted packages).

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | HTTP port |
| `DATA_DIR` | `./data` | Where courses, extracted packages and learner results are stored |
| `ADMIN_KEY` | *(unset)* | If set, uploading or removing courses needs this teacher key |
| `MAX_UPLOAD_MB` | `500` | Largest SCORM zip accepted |

## Deploy online (Render)

`render.yaml` at the repository root sets everything up.

1. Sign in at https://render.com with GitHub.
2. Choose **New → Blueprint**, select this repository and the branch that holds `k12-lms/`, then click **Apply**.
3. When the build finishes, open the `https://<name>.onrender.com` link Render shows.
4. To upload courses, find the generated **teacher key** under the service's **Environment → `ADMIN_KEY`**. The app asks for it the first time you upload.

The Blueprint uses the **Starter** plan with a 1 GB disk at `/var/data`, so uploaded packages and learner results
survive restarts and redeploys. For a free demo, set `plan: free` and remove the `disk` block. Data then resets
whenever the service restarts or redeploys, and the free service sleeps after 15 minutes without traffic.

## Attach a SCORM package to Grade 9 (or any grade)

1. Open **Grades → Grade 9 → Science**, or open the **Teacher** page.
2. In **Attach SCORM package**, choose or drop a `.zip` that contains `imsmanifest.xml` at its root (or one folder down).
3. Optionally enter a title (otherwise it's read from the manifest), then click **Upload & attach**.
4. Click **▶ Play** to run it. Learner status, score and time show up under **Teacher → Learner results**.

Packages exported from Articulate Storyline/Rise, iSpring, Adobe Captivate, Lectora, H5P and similar tools work
as long as they are exported as SCORM 1.2 or SCORM 2004.

If you need a package to try, `sample/grade9-science-atoms.zip` is ready to upload. You can also download it from inside the app.

## How it works

```
server/
  app.js          Express API: curriculum, courses (upload/patch/delete), SCORM content, attempts, reports
  scorm.js        Safe unzip (blocks ../ paths), imsmanifest.xml parser (default org, xml:base, 1.2 vs 2004)
  curriculum.js   Grade ladder K-12 and subject list — edit to change the catalogue
  store.js        Small JSON file store (swap for Postgres/MySQL in production)
public/
  index.html, css/app.css, js/app.js   Single-page app (grades → subjects → courses → player, teacher view)
  js/scorm-runtime.js                  SCORM run-time API: window.API (1.2) and window.API_1484_11 (2004)
sample/grade9-science-atoms/           Source of the Grade 9 Science SCORM 1.2 sample
tests/api.test.js                      node:test suite
```

- **Playback:** the package's launch file is served same-origin from `/content/<courseId>/...` inside an iframe. The SCO
  finds `window.API` / `window.API_1484_11` on the parent page, as the SCORM specification requires.
- **Tracking:** `lesson_status`, `completion_status`, `success_status`, score (raw/min/max/scaled), `lesson_location`, `suspend_data`,
  `interactions` and accumulated `total_time` are saved per learner each time the content calls `LMSCommit`, `LMSFinish`, `Commit` or `Terminate`.
  When a learner returns, `cmi.core.entry` is set to `resume`, so the content can pick up where they stopped.
- **Learners:** this is a showcase, so learners only type a name (kept in the browser). Add real authentication before
  using it with students.

## The Grade 9 Science sample

*Atoms, Elements & the Periodic Table* has 8 screens:

1. Learning objectives
2. Subatomic particles
3. Atomic and mass number, and isotopes
4. Interactive "build an atom" activity
5. Electron shells
6. Clickable periodic table of the first 20 elements
7. Six-question quiz (pass mark 70%)
8. Summary with references

The lesson reports its score, passed/failed status, each quiz interaction and a bookmark back to the LMS.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/curriculum` | Grades (K-12) with course counts per subject |
| GET | `/api/courses?grade=9&subject=science` | List courses |
| POST | `/api/courses` | Multipart upload: `package` (zip), `grade`, `subject`, `title?`, `description?` |
| PATCH / DELETE | `/api/courses/:id` | Edit or remove a course |
| GET | `/content/:id/<path>` | Files inside the package |
| GET / POST | `/api/courses/:id/attempt?learner=Name` | Read or save a learner's SCORM data |
| GET | `/api/reports[?courseId=]` | Learner results |

## Next steps toward production

- Real accounts and roles (student/teacher/admin), for example via SSO (Google Workspace or Microsoft 365)
- A database instead of the JSON file, and object storage (S3/Azure Blob) for packages
- SCORM 2004 sequencing and navigation for multi-SCO packages (the app currently launches the first SCO)
- xAPI/cmi5 support and an LTI 1.3 tool interface, so other systems can launch these courses

## References

- ADL, *SCORM 1.2 Run-Time Environment* and *Content Aggregation Model*: https://adlnet.gov/projects/scorm/
- ADL, *SCORM 2004 4th Edition Run-Time Environment* (API_1484_11, data model): https://adlnet.gov/projects/scorm/
- Rustici Software, *SCORM Run-Time Reference* and *Content Packaging*: https://scorm.com/scorm-explained/technical-scorm/
- OpenStax, *Chemistry 2e*, Ch. 2 (lesson content): https://openstax.org/books/chemistry-2e
- NGSS HS-PS1-1 (periodic table patterns): https://www.nextgenscience.org/
- IUPAC Periodic Table (standard atomic weights): https://iupac.org/what-we-do/periodic-table-of-elements/
