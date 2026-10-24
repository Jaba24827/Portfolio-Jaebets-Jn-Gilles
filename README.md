# Jaebets Jn Gilles: portfolio v2 (multi-page, EN/FR, light/dark)

Plain HTML, CSS and JavaScript. No build step. Free hosting on GitHub Pages.

## Deploy (about 5 minutes)
1. Sign in at github.com and click **New repository**. Name it `Jaba24827.github.io` (public) for the address https://jaba24827.github.io/ (any other name works too and gives https://jaba24827.github.io/NAME/).
2. Click **uploading an existing file**, drag in the CONTENTS of this folder (including `.github`, `.nojekyll`, `css`, `js`, `assets`), and **Commit changes**.
3. Open **Settings > Pages > Build and deployment > Source** and choose **GitHub Actions**. The included workflow publishes the site on every push to `main`. (Alternative: Source = "Deploy from a branch", `main`, `/ (root)`.)
4. Wait 1 to 2 minutes, then open the address shown under Settings > Pages.

## Custom domain (optional)
Use a subdomain such as `portfolio.jaeka.ca`: add a DNS CNAME record `portfolio` -> `jaba24827.github.io`, put the domain in Settings > Pages > Custom domain, tick Enforce HTTPS, and add a file named `CNAME` containing the domain. Then replace `https://jaba24827.github.io/` with your domain in `sitemap.xml`, `robots.txt` and the `canonical`/`og:url` tags of each page.

## Add your pictures and videos
- Project 2, 3, 4 screenshots: put `shot-1.jpg`, `shot-2.jpg`, `shot-3.jpg` in `assets/projects/student/`, `atm/`, `hangman/` (the page shows them automatically; empty slots stay hidden).
- Project videos: put `sldwp-demo.mp4`, `student.mp4`, `atm.mp4`, `hangman.mp4` in `assets/video/` (keep each under about 50 MB), or edit the page and add `data-youtube="VIDEO_ID"` to the `.video` element to embed a YouTube video.
- Award photos: save `apj-gala-2015.jpg` and `abf-philadelphia.jpg` in `assets/img/awards/` (use only photos you have the right to use; credit lines are on the page).

## Language and theme
The EN/FR and light/dark buttons remember the visitor's choice. French text is in `js/i18n.js`; please have a fluent reader review it.
