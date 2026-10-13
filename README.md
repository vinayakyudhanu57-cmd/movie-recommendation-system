# Movie Recommendation System

A college-level R programming project designed for 2nd-year B.Tech Artificial Intelligence & Data Science students. This application recommends movies according to user-selected genres, minimum rating thresholds, and optional release years using transparent content-based filtering.

---

## Main Features
- **Content-Based Filtering:** Computes genre similarity using the classic **Jaccard Similarity** index.
- **Transparent Scoring Model:** Combines 70% genre similarity + 30% normalized rating into a clean match score.
- **Interactive Command-Line Application:** Working base R terminal menu allowing flexible searches without restarting.
- **Modern Web Interface:** Responsive dark-mode dashboard (HTML/CSS/Vanilla JS) mirroring the R recommendation logic.
- **Explainable Results:** Every recommendation includes an explanation showing why it was ranked and which genres matched.
- **Robust Edge Handling:** Handles zero matches, custom year bounds, and missing or invalid input gracefully.

---

## Technologies Used
- **R (Base R):** Data frame manipulation, set theory functions, filtering, scoring, sorting, and CLI.
- **Frontend:** Vanilla HTML5, CSS3 (Glassmorphism & Flexbox/Grid), and Vanilla JavaScript (ES6+).
- **Data Format:** CSV (`data/movies.csv`).

---

## How to Run the R Application

From the project root directory, run:

```bash
# Interactive Mode
Rscript R/main.R

# Quick Automated Demo Mode
Rscript R/main.R --demo
```

*Note: If `Rscript` is not in your system environment PATH on Windows, execute using the full path:*
```powershell
& "C:\Program Files\R\R-4.6.1\bin\Rscript.exe" R/main.R
```

---

## How to Run the Frontend Locally

You can serve the project using Python's built-in HTTP server or Node:

```bash
# Using Python
python -m http.server 8080
```

Then open your browser and navigate to:
```
http://localhost:8080
```

*(You can also double-click `index.html` to open it directly in any browser; an embedded fallback dataset ensures full functionality offline).*

---

## How to Run Automated Tests

To run the automated validation test suite (20 base R assertions):

```bash
Rscript tests/test_recommendations.R
```

---

## How to Upload to GitHub

Follow these simple steps from your terminal:

```bash
# 1. Initialize Git repository
git init

# 2. Stage project files (.gitignore automatically protects the sample report)
git add .

# 3. Create initial commit
git commit -m "Initial commit: Movie Recommendation System in R"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub repository (replace with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/movie-recommendation-system-r.git

# 6. Push project to GitHub
git push -u origin main
```

### Enabling GitHub Pages (Live Web Demo)
1. In your GitHub repository, open **Settings** > **Pages**.
2. Under **Build and deployment** > **Branch**, select `main` branch and `/ (root)` folder.
3. Click **Save**. Your web recommender will be live at `https://YOUR_USERNAME.github.io/movie-recommendation-system-r/`.

---

## Synthetic Dataset Notice
The dataset contained in `data/movies.csv` consists of **50 fictional movie records** created exclusively for academic demonstration and algorithm testing. Ratings, synopses, and film titles are synthetic and do not represent real-world commercial metrics.
