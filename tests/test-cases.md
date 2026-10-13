# Test Cases and Validation Report: Movie Recommendation System

**Academic Coursework:** 2nd Year B.Tech Artificial Intelligence and Data Science  
**Technology Stack:** Base R Programming & Vanilla HTML/CSS/JavaScript  
**Dataset:** `data/movies.csv` (50 synthetic records)  
**Verification Tool:** `tests/test_recommendations.R`  

---

## 1. Test Summary

| Total Test Cases | Passed | Failed | Automated R Tests | Manual UI Tests |
|:---:|:---:|:---:|:---:|:---:|
| **10 Categories (20 Assertions)** | **20** | **0** | **20** | **Verified** |

---

## 2. Detailed Test Cases

### TC-01: Valid Genre Selection
- **Objective:** Verify that single genre preference computes appropriate Jaccard similarity and returns matching movies.
- **Input:** `user_genres = c("Sci-Fi")`, `min_rating = 7.0`
- **Expected Result:** Only movies containing `Sci-Fi` in pipe-separated genre string are returned; Jaccard similarity matches formula `1 / |Movie Genres|`.
- **Status:** **PASS** (Verified in R and Frontend).

### TC-02: Multiple Preferred Genres
- **Objective:** Verify intersection and union handling across multiple user genres.
- **Input:** `user_genres = c("Sci-Fi", "Adventure")`, `min_rating = 8.0`
- **Expected Result:**
  - `Echoes of the Cosmos` (`Sci-Fi|Adventure`): Intersection = 2, Union = 2 $\rightarrow$ Similarity = `1.0000` (100%).
  - `Starlight Odyssey` (`Sci-Fi|Adventure|Action`): Intersection = 2, Union = 3 $\rightarrow$ Similarity = `0.6667` (66.7%).
- **Status:** **PASS** (Confirmed by Test 08 & Test 15).

### TC-03: Minimum Rating Filtering
- **Objective:** Ensure hard constraint filtering strictly eliminates films below threshold.
- **Input:** `min_rating = 8.5`
- **Expected Result:** All returned movies have `rating >= 8.5`.
- **Status:** **PASS** (Confirmed by Test 12).

### TC-04: Year-Range Filtering
- **Objective:** Validate temporal filtering with lower and upper year bounds.
- **Input:** `min_year = 2020`, `max_year = 2022`
- **Expected Result:** All returned movies have `release_year` in $[2020, 2022]$.
- **Status:** **PASS** (Confirmed by Test 13).

### TC-05: No Matching Movies (Empty Result Handling)
- **Objective:** Verify graceful handling when no movies satisfy strict constraints.
- **Input:** `user_genres = c("Sci-Fi")`, `min_rating = 9.9` (No movie has rating 9.9).
- **Expected Result:** Return an empty data frame (0 rows) without throwing an unhandled exception or crash; Frontend renders dedicated empty-state card with recovery buttons.
- **Status:** **PASS** (Confirmed by Test 17 and UI empty state).

### TC-06: Invalid or Missing Preferences
- **Objective:** Test system resilience against non-numeric ratings, out-of-range ratings, and empty inputs.
- **Input:** Rating string `"abc"`, negative rating `-5`, rating `15`.
- **Expected Result:**
  - R CLI catches invalid input and defaults safely to `7.0`.
  - Empty genre selection defaults to ranking candidate films by pure ratings.
- **Status:** **PASS** (Confirmed by Test 18 & interactive R error handler).

### TC-07: Duplicate or Invalid Dataset Records
- **Objective:** Ensure schema and data integrity during dataset loading.
- **Input:** Duplicate IDs, missing critical columns, out-of-bounds ratings.
- **Expected Result:** `load_and_validate_movies()` deduplicates IDs, removes rows missing critical fields, bounds ratings between $0.0$ and $10.0$, and validates required column headers.
- **Status:** **PASS** (Confirmed by Tests 01–04).

### TC-08: Correct Similarity and Recommendation Score Calculations
- **Objective:** Verify exact mathematical calculation of recommendation formula.
- **Formula:** $\text{Score} = (0.70 \times \text{Similarity}) + (0.30 \times \frac{\text{Rating}}{10.0})$
- **Test Case:** Similarity = $1.0$, Rating = $8.7$:
  $$\text{Score} = (0.70 \times 1.0) + (0.30 \times 0.87) = 0.70 + 0.261 = 0.961 \ (96.1\%)$$
- **Observed Result:** Calculated score equals `0.9610`.
- **Status:** **PASS** (Confirmed by Test 10).

### TC-09: Correct Sorting of Results
- **Objective:** Ensure recommendations are ordered strictly descending by score, followed by rating and release year.
- **Expected Result:** `diff(recs$recommendation_score) <= 0`.
- **Status:** **PASS** (Confirmed by Test 16).

### TC-10: Frontend CSV Loading and Error Handling
- **Objective:** Verify browser client loads `data/movies.csv` over HTTP, handles JSON/text parsing, and seamlessly falls back to bundled dataset if accessed locally via `file://` protocol.
- **Expected Result:** HTTP 200 on `data/movies.csv`, dynamic genre chips generation, interactive slider reactivity.
- **Status:** **PASS** (Verified with curl HTTP 200 tests and fallback dataset in `script.js`).

---

## 3. How to Run the Automated Test Suite

From the project root directory in PowerShell:
```powershell
& "C:\Program Files\R\R-4.6.1\bin\Rscript.exe" tests/test_recommendations.R
```
*(Or simply `Rscript tests/test_recommendations.R` if R is on your system PATH).*
