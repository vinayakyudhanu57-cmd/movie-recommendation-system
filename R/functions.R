# ==============================================================================
# R/functions.R
# Core functions for the Movie Recommendation System
# Developed for 2nd Year B.Tech AI & Data Science coursework
# ==============================================================================

#' Load and validate the synthetic movie dataset
#'
#' @param file_path Relative or absolute path to the CSV file
#' @return A validated data.frame of movies
load_and_validate_movies <- function(file_path = "data/movies.csv") {
  if (!file.exists(file_path)) {
    stop(paste("Dataset file not found at:", file_path))
  }

  movies <- read.csv(file_path, stringsAsFactors = FALSE, check.names = FALSE)

  required_cols <- c("movie_id", "title", "genre", "rating", "release_year", "description")
  missing_cols <- setdiff(required_cols, names(movies))
  if (length(missing_cols) > 0) {
    stop(paste("Dataset is missing required column(s):", paste(missing_cols, collapse = ", ")))
  }

  # Check for duplicate IDs
  if (any(duplicated(movies$movie_id))) {
    warning("Duplicate movie_id found in dataset; keeping first occurrences.")
    movies <- movies[!duplicated(movies$movie_id), ]
  }

  # Check for NA values in critical fields
  critical_nas <- is.na(movies$movie_id) | is.na(movies$title) | is.na(movies$rating)
  if (any(critical_nas)) {
    warning(paste("Removing", sum(critical_nas), "record(s) with missing critical fields."))
    movies <- movies[!critical_nas, ]
  }

  # Ensure ratings are numeric and between 0 and 10
  movies$rating <- as.numeric(movies$rating)
  valid_ratings <- !is.na(movies$rating) & movies$rating >= 0 & movies$rating <= 10
  movies <- movies[valid_ratings, ]

  # Ensure release_year is numeric
  movies$release_year <- as.integer(movies$release_year)

  # Trim whitespace in character columns
  movies$title <- trimws(movies$title)
  movies$genre <- trimws(movies$genre)
  movies$description <- trimws(movies$description)

  return(movies)
}

#' Extract unique, sorted list of all available genres in the dataset
#'
#' @param movies_df Data frame containing a 'genre' column with pipe-separated values
#' @return A character vector of unique genre names
get_all_genres <- function(movies_df) {
  if (nrow(movies_df) == 0) return(character(0))
  genre_lists <- strsplit(movies_df$genre, "\\|")
  all_genres <- unlist(genre_lists)
  all_genres <- trimws(all_genres)
  unique_genres <- sort(unique(all_genres[all_genres != ""]))
  return(unique_genres)
}

#' Calculate Jaccard Similarity between two sets of genres
#'
#' Formula: J(A, B) = |A ∩ B| / |A ∪ B|
#' Where A is the user's preferred genres and B is the movie's genres.
#'
#' @param user_genres Character vector of user-selected genres
#' @param movie_genres Character vector of genres for a single movie
#' @return Numeric similarity score between 0.0 and 1.0
calculate_jaccard_similarity <- function(user_genres, movie_genres) {
  if (length(user_genres) == 0 || length(movie_genres) == 0) {
    return(0.0)
  }

  # Normalize to lowercase for case-insensitive comparison
  u_set <- unique(tolower(trimws(user_genres)))
  m_set <- unique(tolower(trimws(movie_genres)))

  intersection_size <- length(intersect(u_set, m_set))
  union_size <- length(union(u_set, m_set))

  if (union_size == 0) {
    return(0.0)
  }

  similarity <- intersection_size / union_size
  return(round(similarity, 4))
}

#' Calculate the final recommendation score
#'
#' Combines genre similarity and normalized rating using transparent weights:
#' Score = (70% * Genre Similarity) + (30% * (Rating / 10.0))
#'
#' @param similarity Numeric genre similarity (0.0 to 1.0)
#' @param rating Numeric movie rating (0.0 to 10.0)
#' @param weight_similarity Weight assigned to similarity (default 0.70)
#' @param weight_rating Weight assigned to normalized rating (default 0.30)
#' @return Numeric score between 0.0 and 1.0
calculate_recommendation_score <- function(similarity,
                                           rating,
                                           weight_similarity = 0.70,
                                           weight_rating = 0.30) {
  # Normalize rating to 0-1 scale
  norm_rating <- max(0, min(10, rating)) / 10.0

  score <- (weight_similarity * similarity) + (weight_rating * norm_rating)
  return(round(score, 4))
}

#' Filter movies by constraints (minimum rating, release year range)
#'
#' @param movies_df Base movie data frame
#' @param min_rating Minimum acceptable movie rating
#' @param min_year Optional minimum release year (inclusive)
#' @param max_year Optional maximum release year (inclusive)
#' @return Filtered data frame of candidate movies
filter_movies <- function(movies_df, min_rating = 0.0, min_year = NULL, max_year = NULL) {
  filtered <- movies_df

  # Filter by minimum rating
  if (!is.null(min_rating) && !is.na(min_rating)) {
    filtered <- filtered[filtered$rating >= min_rating, ]
  }

  # Filter by minimum year
  if (!is.null(min_year) && !is.na(min_year)) {
    filtered <- filtered[filtered$release_year >= min_year, ]
  }

  # Filter by maximum year
  if (!is.null(max_year) && !is.na(max_year)) {
    filtered <- filtered[filtered$release_year <= max_year, ]
  }

  return(filtered)
}

#' Generate a human-readable explanation of why a movie was recommended
#'
#' @param matching_genres Vector of genres shared between user and movie
#' @param similarity Jaccard similarity value
#' @param rating Movie rating
#' @param score Recommendation score
#' @return Single character string explanation
generate_explanation <- function(matching_genres, similarity, rating, score) {
  if (length(matching_genres) > 0) {
    match_str <- paste(matching_genres, collapse = ", ")
    pct_sim <- round(similarity * 100, 1)
    pct_score <- round(score * 100, 1)
    return(sprintf(
      "Matches %d genre(s) [%s] with %g%% genre overlap. Rating: %.1f/10. Overall match score: %g%%.",
      length(matching_genres), match_str, pct_sim, rating, pct_score
    ))
  } else {
    pct_score <- round(score * 100, 1)
    return(sprintf(
      "No direct genre overlap; ranked purely on rating (%.1f/10) with overall score %g%%.",
      rating, pct_score
    ))
  }
}

#' Main Recommendation Pipeline Function
#'
#' @param movies_df Data frame of all movies
#' @param user_genres Character vector of preferred genres
#' @param min_rating Minimum movie rating threshold
#' @param min_year Optional minimum release year
#' @param max_year Optional maximum release year
#' @param top_n Number of recommendations to return (default 5)
#' @param require_genre_overlap If TRUE, excludes movies with 0 genre similarity
#' @return Data frame of top recommended movies with similarity, score, and explanations
recommend_movies <- function(movies_df,
                             user_genres,
                             min_rating = 0.0,
                             min_year = NULL,
                             max_year = NULL,
                             top_n = 5,
                             require_genre_overlap = TRUE) {
  if (nrow(movies_df) == 0) {
    return(data.frame())
  }

  # 1. Apply essential constraints (filtering)
  candidates <- filter_movies(movies_df, min_rating, min_year, max_year)
  if (nrow(candidates) == 0) {
    return(data.frame())
  }

  # 2. Vectorized computation of similarity, scoring, and explanations
  sim_scores <- numeric(nrow(candidates))
  rec_scores <- numeric(nrow(candidates))
  explanations <- character(nrow(candidates))
  matched_genres_list <- character(nrow(candidates))

  user_clean <- tolower(trimws(user_genres))

  for (i in seq_len(nrow(candidates))) {
    m_genres <- unlist(strsplit(candidates$genre[i], "\\|"))
    m_genres_clean <- tolower(trimws(m_genres))

    matched <- intersect(user_clean, m_genres_clean)
    matched_orig <- m_genres[m_genres_clean %in% matched]

    sim <- calculate_jaccard_similarity(user_genres, m_genres)
    sc <- calculate_recommendation_score(sim, candidates$rating[i])

    sim_scores[i] <- sim
    rec_scores[i] <- sc
    matched_genres_list[i] <- paste(matched_orig, collapse = ", ")
    explanations[i] <- generate_explanation(matched_orig, sim, candidates$rating[i], sc)
  }

  candidates$similarity <- sim_scores
  candidates$recommendation_score <- rec_scores
  candidates$matched_genres <- matched_genres_list
  candidates$explanation <- explanations

  # 3. Optional filter: require at least one matching genre if user selected any
  if (require_genre_overlap && length(user_genres) > 0) {
    candidates <- candidates[candidates$similarity > 0, ]
    if (nrow(candidates) == 0) {
      return(data.frame())
    }
  }

  # 4. Sort primarily by recommendation score (descending), then rating (descending), then year
  order_idx <- order(candidates$recommendation_score, candidates$rating, candidates$release_year, decreasing = TRUE)
  ranked <- candidates[order_idx, ]

  # 5. Extract top_n
  actual_top <- min(top_n, nrow(ranked))
  results <- ranked[seq_len(actual_top), ]
  rownames(results) <- NULL

  return(results)
}
