# GitHub Repository Cleanup Guide

## 📊 Current Status

### Repository 1: `rendr-platform` (ACTIVE)
**URL:** https://github.com/BrianJamesWY/rendr-platform
**Purpose:** Your live website (rendrtruth.com)
**Status:** ✅ This is your main repo - KEEP THIS

### Repository 2: `Rendr_Project` (NOT FOUND)
**URL:** https://github.com/BrianJamesWY/Rendr_Project
**Status:** ❌ Returns 404 - either deleted, private, or doesn't exist

---

## 🗑️ FILES TO DELETE FROM `rendr-platform`

Your `rendr-platform` repository has many unnecessary files. Here's what to keep vs delete:

### ✅ KEEP (Essential Files)

**For Website to Work:**
```
✓ index.html              (your homepage)
✓ platform.html           (platform page)
✓ mobile-app.html         (mobile app page)
✓ Profile.html            (profile page)
✓ CNAME                   (tells GitHub your custom domain)
✓ README.md               (repository description)
✓ .gitignore              (tells Git what to ignore)
```

**GitHub Actions (if using):**
```
✓ .github/workflows/      (folder for automated deployments)
```

---

### ❌ DELETE (Unnecessary/Duplicate Files)

**Configuration Files (Don't need these for GitHub Pages):**
```
❌ deploy.yml                    (duplicate, should be in .github/workflows/)
❌ package_json.json             (not needed for static site)
❌ tailwind_config.js            (not needed if not using build process)
```

**Text File Duplicates:**
```
❌ gitignore_file.txt            (duplicate of .gitignore)
❌ readme_file.txt               (duplicate of README.md)
❌ public_index_html.html        (duplicate/old version?)
❌ public_manifest_json.json     (not using PWA features)
```

**JavaScript Files (If not actually used on site):**
```
❌ landing_page_js.js            (check if index.html uses this)
❌ src_app_js.js                 (React/build files not needed)
❌ src_index_js.js               (React/build files not needed)
❌ src_index_css.css             (React/build files not needed)
❌ verification_app_js (1).js    (check if actually used)
```

---

## 🎯 RECOMMENDED FINAL STRUCTURE

After cleanup, your repository should look like this:

```
rendr-platform/
├── .github/
│   └── workflows/
│       └── deploy.yml           (if using GitHub Actions)
├── .gitignore
├── CNAME                        (rendrtruth.com)
├── README.md
├── index.html                   (NEW - the one I just created)
├── platform.html
├── mobile-app.html
└── Profile.html
```

**Total:** ~7-8 files instead of 20+ files

---

## 🔧 HOW TO DELETE FILES FROM GITHUB

### Method 1: GitHub Website (Easiest)

**For each file to delete:**
1. Go to https://github.com/BrianJamesWY/rendr-platform
2. Click on the file name (e.g., `deploy.yml`)
3. Click the trash can icon (🗑️) at top right
4. Scroll down, add commit message: "Remove unnecessary file"
5. Click "Commit changes"
6. Repeat for each file

**Pro tip:** You can delete multiple files in one commit by doing them quickly one after another.

---

### Method 2: Git Command Line (Faster for multiple files)

If you have the repo cloned on your computer:

```bash
cd rendr-platform

# Delete unnecessary files
git rm deploy.yml
git rm package_json.json
git rm tailwind_config.js
git rm gitignore_file.txt
git rm readme_file.txt
git rm public_index_html.html
git rm public_manifest_json.json
git rm landing_page_js.js
git rm src_app_js.js
git rm src_index_js.js
git rm src_index_css.css
git rm "verification_app_js (1).js"

# Commit all deletions at once
git commit -m "Clean up unnecessary files"

# Push to GitHub
git push origin main
```

---

## ⚠️ FILES TO CHECK BEFORE DELETING

Some files might actually be used by your existing pages. Check these:

### Check `landing_page_js.js`
1. Open `index.html` in GitHub
2. Search (Ctrl+F) for "landing_page_js"
3. If found → KEEP the file
4. If not found → DELETE the file

### Check `verification_app_js (1).js`
1. Open all your HTML files
2. Search for "verification_app"
3. If any page uses it → KEEP
4. If not used → DELETE

---

## 📝 SPECIAL CASE: `deploy.yml`

You have TWO deploy files:
- `/.github/workflows/deploy.yml` (correct location)
- `/deploy.yml` (wrong location, root folder)

**What to do:**
1. Check if `.github/workflows/deploy.yml` exists
2. If YES → Delete `/deploy.yml` (the one in root)
3. If NO → Move `/deploy.yml` to `.github/workflows/deploy.yml`

**To check:**
1. Go to repo
2. Click `.github` folder
3. Click `workflows` folder
4. See if `deploy.yml` is there

---

## 🎨 UPDATING YOUR HOMEPAGE

Once you've cleaned up, update your homepage:

1. **Delete OLD `index.html`** (the current one)
2. **Upload NEW `index.html`** (the one I created in `/app/index.html`)
3. Wait 2-3 minutes
4. Visit rendrtruth.com
5. Should see the new centered, mobile-friendly design!

---

## 🗂️ ABOUT THE SECOND REPO

The `Rendr_Project` repo doesn't exist or is private. Options:

**If you don't remember creating it:**
- Ignore it, probably doesn't exist

**If you created it:**
- Go to your GitHub profile: https://github.com/BrianJamesWY
- Click "Repositories" tab
- See if `Rendr_Project` is listed
- If it's there and empty → Delete it
- If it has useful code → Keep it but make it private

**To delete a repository:**
1. Go to the repository
2. Click "Settings" tab
3. Scroll to bottom
4. Click "Delete this repository"
5. Type the repo name to confirm
6. Click "I understand, delete this repository"

---

## ✅ CLEANUP CHECKLIST

**Step 1: Identify What's Used**
- [ ] Check if `landing_page_js.js` is used
- [ ] Check if `verification_app_js (1).js` is used
- [ ] Check where `deploy.yml` is located

**Step 2: Delete Definitely Unnecessary Files**
- [ ] Delete `gitignore_file.txt`
- [ ] Delete `readme_file.txt`
- [ ] Delete `public_index_html.html`
- [ ] Delete `public_manifest_json.json`
- [ ] Delete `package_json.json`
- [ ] Delete `tailwind_config.js`
- [ ] Delete `src_app_js.js`
- [ ] Delete `src_index_js.js`
- [ ] Delete `src_index_css.css`

**Step 3: Conditional Deletes**
- [ ] Delete unused JavaScript files (if confirmed not needed)
- [ ] Delete duplicate `deploy.yml` (if in wrong location)

**Step 4: Update Homepage**
- [ ] Upload new `index.html` from `/app/`
- [ ] Test rendrtruth.com

**Step 5: Check Second Repo**
- [ ] Visit https://github.com/BrianJamesWY
- [ ] See if `Rendr_Project` exists
- [ ] Delete if empty/unnecessary

---

## 💡 WHY CLEAN UP?

**Benefits:**
1. **Easier to navigate** - Find files quickly
2. **Less confusion** - No duplicate files
3. **Professional** - Clean repos look better to collaborators
4. **Faster** - Less clutter, faster to load/update
5. **Clear purpose** - Only files that actually do something

**No downside:**
- Website will work exactly the same
- Just removes files that aren't being used
- Can always recover deleted files from Git history if needed

---

## 🆘 NEED HELP?

If you're unsure about deleting a file:
1. Don't delete it yet
2. Come back to this chat
3. Tell me the filename
4. I'll tell you if it's safe to delete

**General rule:**
- If a file has "src_" in the name → Usually safe to delete (leftover React files)
- If a file ends in "_file.txt" → Safe to delete (duplicates)
- If a file is in the root and should be in a folder → Move or delete

---

## 📞 SUMMARY

**Main Repository:** `rendr-platform` ✅ KEEP, but clean up files
**Second Repository:** `Rendr_Project` ❓ Check if exists, probably delete

**Files to definitely delete:** ~10-12 files
**Files to keep:** ~7-8 files
**Result:** Cleaner, more professional repository

**Next steps:**
1. Start deleting files from the "DELETE" list above
2. Upload new homepage (`index.html`)
3. Test your site
4. Celebrate clean repository! 🎉
