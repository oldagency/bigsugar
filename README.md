# Big Sugar Gravel 2026 — Finish Times

An interactive look at finish times from the 2026 Life Time Big Sugar Gravel in Bentonville, Arkansas: the 50 mile, the 100 mile and the 100 mile elite.

- Finish-time distribution, with 10, 15 or 30 minute bins, as rider counts or share of the group
- Median, middle 50% and fastest-to-slowest by UCI age group, women and men side by side
- A full age-group table, and where riders came from by US state or country
- Filters for race, gender and age group; every view has its own shareable link

## Put it online with GitHub Pages

1. Create a new **public** repository on GitHub (for example `big-sugar-finish-times`).
2. Upload everything in this folder: on the repo page, choose **Add file → Upload files** and drag the folder's contents in (keep the `data` folder), then **Commit changes**.
3. Go to **Settings → Pages**. Under *Build and deployment*, set **Source** to *Deploy from a branch*, pick **main** and **/ (root)**, and **Save**.
4. After a minute the site is live at `https://<your-username>.github.io/big-sugar-finish-times/`.

Anyone with the link can open it; no account needed.

## Sharing a specific view

The filters are kept in the address bar, so you can copy the URL after choosing a view. For example:

- `…/#100-mile` opens the 100 mile tab
- `…/?race=100&gender=F&age_group=40–44` opens women 40–44 in the 100 mile

## Files

| File | What it is |
| --- | --- |
| `index.html` | The dashboard page: layout, charts and the two summary calculations |
| `dash.js` | Loads the data, runs the calculations, and keeps the filters in the URL |
| `style.css` | Colors, type and spacing, with automatic dark mode |
| `data/big_sugar_results.json` | The results the page reads |
| `data/big_sugar_results.csv` | The same results as a spreadsheet-friendly CSV |

d3 (v7.9.0) loads from the jsDelivr CDN and fonts (Inter, Source Serif 4) from Google Fonts; nothing needs building or installing.

## Previewing on your own computer

Browsers block a page opened straight from disk from reading its data file, so start a small local server in this folder and open the address it prints:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## The data

All 1,916 starters from Athlinks event 1144157: 50 mile (980 starters), 100 mile (804) and 100 mile elite (132, men's and women's courses combined). Rider names are not included.

| Column | Meaning |
| --- | --- |
| `race` | `50`, `100` or `100E` (elite) |
| `course_id` | Athlinks course id |
| `bib` | Bib number |
| `place` | Overall place on that course (empty for DNF) |
| `gender` | `M`, `F` or `NB` |
| `age` | Race-day age |
| `age_group` | UCI age group from race-day age |
| `status` | `Finished` or `DNF` |
| `time_sec` | Finish time in seconds (empty for DNF) |
| `origin` | US state, or country for riders outside the US (Puerto Rico counted as US) |
| `origin_type` | `US` or `International` |

Notes: UCI counts age on December 31, while Athlinks gives race-day age, so a rider with a birthday between race day and year-end may sit one group younger here. DNF riders are excluded from every time statistic. Home state or country is what riders entered at registration.
