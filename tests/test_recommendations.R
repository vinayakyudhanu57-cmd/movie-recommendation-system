# ==============================================================================
# tests/test_recommendations.R
# Automated unit & integration tests using Base R assertions
# College Project: Movie Recommendation System
# ==============================================================================

source("R/functions.R")

test_count <- 0
passed_count <- 0

assert_test <- function(test_name, condition) {
  test_count <<- test_count + 1
  if (isTRUE(condition)) {
    passed_count <<- passed_count + 1
    cat(sprintf("  [PASS] Test %02d: %s\n", test_count, test_name))
  } else {
    cat(sprintf("  [FAIL] Test %02d: %s\n", test_count, test_name))
    stop(paste("Assertion failed for:", test_name))
  }
}

cat("\n======================================================================\n")
cat(" RUNNING AUTOMATED R TEST SUITE: MOVIE RECOMMENDATION SYSTEM\n")
cat("======================================================================\n\n")

# 1. Dataset Loading & Validation
movies <- load_and_validate_movies("data/movies.csv")
assert_test("Dataset loads successfully with 50 records", nrow(movies) == 50)
assert_test("Required columns exist", all(c("movie_id", "title", "genre", "rating", "release_year", "description") %in% names(movies)))
assert_test("Ratings are bounded between 0 and 10", all(movies$rating >= 0 & movies$rating <= 10))
assert_test("All movie IDs are unique", !any(duplicated(movies$movie_id)))

# 2. Genre Extraction
genres <- get_all_genres(movies)
assert_test("Genre extraction yields unique non-empty genres", length(genres) >= 10 && "Sci-Fi" %in% genres && "Action" %in% genres)

# 3. Jaccard Similarity Calculations
# Identical sets -> similarity = 1.0
sim_ident <- calculate_jaccard_similarity(c("Action", "Sci-Fi"), c("Action", "Sci-Fi"))
assert_test("Identical genre sets yield similarity 1.0", abs(sim_ident - 1.0) < 1e-4)

# Disjoint sets -> similarity = 0.0
sim_disjoint <- calculate_jaccard_similarity(c("Romance"), c("Action", "Horror"))
assert_test("Disjoint genre sets yield similarity 0.0", abs(sim_disjoint - 0.0) < 1e-4)

# Partial overlap: [Sci-Fi, Adventure] vs [Sci-Fi, Adventure, Action]
# intersection = 2, union = 3 -> 2/3 = 0.6667
sim_partial <- calculate_jaccard_similarity(c("Sci-Fi", "Adventure"), c("Sci-Fi", "Adventure", "Action"))
assert_test("Partial overlap matches expected Jaccard ratio 2/3 (0.6667)", abs(sim_partial - (2/3)) < 1e-3)

# Case-insensitivity & whitespace trimming
sim_case <- calculate_jaccard_similarity(c("sci-fi ", "ADVENTURE"), c(" Sci-Fi", "adventure"))
assert_test("Similarity is case-insensitive and trims whitespace", abs(sim_case - 1.0) < 1e-4)

# 4. Recommendation Scoring Formula
# Formula: 0.70 * Sim + 0.30 * (Rating / 10.0)
# Example: Sim = 1.0, Rating = 8.7 -> 0.70 + 0.30 * 0.87 = 0.70 + 0.261 = 0.961
score1 <- calculate_recommendation_score(1.0, 8.7)
assert_test("Recommendation score matches 70/30 weighting (Sim 1.0, Rating 8.7 -> 0.961)", abs(score1 - 0.961) < 1e-3)

score2 <- calculate_recommendation_score(0.0, 8.0)
assert_test("Recommendation score handles zero similarity (Sim 0.0, Rating 8.0 -> 0.24)", abs(score2 - 0.24) < 1e-3)

# 5. Filtering Logic
filtered_rating <- filter_movies(movies, min_rating = 8.5)
assert_test("Filter by minimum rating returns only movies >= threshold", all(filtered_rating$rating >= 8.5))

filtered_years <- filter_movies(movies, min_rating = 0, min_year = 2020, max_year = 2022)
assert_test("Filter by year bounds returns only movies within [2020, 2022]", all(filtered_years$release_year >= 2020 & filtered_years$release_year <= 2022))

# 6. Recommendation Ranking & Sorting Order
recs <- recommend_movies(movies, user_genres = c("Sci-Fi", "Adventure"), min_rating = 8.0, top_n = 5)
assert_test("Top recommendations count respects top_n parameter", nrow(recs) <= 5)
assert_test("Top recommendation is 'Echoes of the Cosmos'", recs$title[1] == "Echoes of the Cosmos")
assert_test("Recommendations are strictly sorted descending by recommendation score", all(diff(recs$recommendation_score) <= 0))

# 7. Edge Cases: No matches due to high threshold
recs_empty <- recommend_movies(movies, user_genres = c("Sci-Fi"), min_rating = 9.9)
assert_test("Zero matches handled gracefully with empty data frame", nrow(recs_empty) == 0)

# Edge Cases: User selects no genres (falls back to ranking purely by rating)
recs_no_genre <- recommend_movies(movies, user_genres = character(0), min_rating = 8.5, top_n = 3, require_genre_overlap = FALSE)
assert_test("Empty genre input ranks movies by pure rating score", nrow(recs_no_genre) > 0 && recs_no_genre$rating[1] >= recs_no_genre$rating[2])

# Edge Cases: Non-existent genre
recs_fake_genre <- recommend_movies(movies, user_genres = c("NonExistentGenre123"), min_rating = 5.0)
assert_test("Unknown genre selection returns zero matches when genre overlap required", nrow(recs_fake_genre) == 0)

# 8. Explanation Verification
assert_test("Explanation column populated with non-empty strings", all(nchar(recs$explanation) > 10))

cat("\n======================================================================\n")
cat(sprintf(" TEST SUITE SUMMARY: %d / %d TESTS PASSED (100%% SUCCESS)\n", passed_count, test_count))
cat("======================================================================\n\n")
