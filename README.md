# Nam Hoang portfolio — GitHub Pages package

This folder is the complete working static website. No build, npm install, API key or backend is required.

## Upload using GitHub Desktop (recommended for this many files)
1. Clone `hphnam/hphnam.github.io` in GitHub Desktop.
2. Back up your existing checkout. Replace its website files with the CONTENTS of this extracted folder. Keep the repository's `.git` folder.
3. Make sure `index.html`, `.nojekyll`, `assets/` and `media/` are at the repository root, not inside another folder.
4. Commit with “Update optimized portfolio” and push to origin.
5. In repository Settings → Pages, select “Deploy from a branch”, branch `main`, folder `/ (root)` and Save.
6. Wait for the Pages deployment to finish. Open https://hphnam.github.io/ and refresh once. Test on your phone too.

Alternatively, use GitHub's Add file → Upload files. Upload the extracted files/folders, not the ZIP. Because there are more than 100 files, split uploads into several batches while retaining folder paths. A GitHub Desktop upload is easier.

Internal routes use URL hashes, so opening and refreshing case links works on GitHub Pages without server redirects. All local file paths are relative, so the package also works in a repository subfolder.

The package preserves the current case studies, controls, contact links, animations and existing public report/source downloads. Third-party video/social services still need an internet connection.

## Implemented performance changes
- WebP artwork, retaining the opening screen's original 1536 × 1024 resolution and fixed 3:2 proportions.
- Smaller latch/decorative artwork sized for their actual display dimensions.
- First entrance image preloaded with high priority.
- One compact stylesheet in the original cascade order.
- Font files are separate and use font-display: swap. Only required font faces are downloaded.
- Case controllers load on opening each case, once per session.
- Images and posters from other routes wait until those routes open.
- Native videos use preload=none; homepage previews and case hero films still start muted when visible.
- Supporting MV/social embeds load near their own sections; players are removed when their routes close.
- The five-second decorative video uses 1080p H.264 with fast-start metadata and no unused audio track.
- Unused artwork versions and superseded media are omitted from the upload folder.

Do not add a service worker just to cache this site: stale versions can confuse recruiters after updates. Do not preload all case images/videos. Keep new images in WebP and supply thumbnails for videos.

## Verify real loading time after deployment
Use Chrome DevTools → Lighthouse → Mobile, or https://pagespeed.web.dev/ with https://hphnam.github.io/. Test in a private window and with mobile throttling. Check both homepage and a video case. Target LCP ≤ 2.5s and CLS ≤ 0.1; results depend on device, network and third-party players. No Lighthouse score or measured loading-time claim was made for this export.

References: https://web.dev/articles/optimize-lcp ; https://web.dev/articles/embed-best-practices ; https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

Measured file sizes (decimal MB, before HTTP compression):
- Opening screen + latch: 4.49 MB → 0.63 MB.
- Render-blocking font CSS: 1.30 MB → 0.015 MB (font bytes now loaded separately as needed).
- Decorative video: 13.38 MB → 0.77 MB.
