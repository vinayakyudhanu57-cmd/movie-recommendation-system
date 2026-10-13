# ==============================================================================
# R/main.R
# Movie Recommendation System - Interactive Console Application
# College Project: 2nd Year B.Tech Artificial Intelligence & Data Science
# ==============================================================================

# Source reusable functions
source("R/functions.R")

# Helper to read input safely across R environments (RStudio, R console, and Rscript terminal)
.stdin_conn <- NULL

read_user_input <- function(prompt_text = "") {
  if (nchar(prompt_text) > 0) cat(prompt_text)
  if (interactive()) {
    res <- readline()
    return(trimws(gsub("[\r\n]", "", res)))
  } else {
    if (is.null(.stdin_conn) || !isOpen(.stdin_conn)) {
      .stdin_conn <<- file("stdin", open = "r")
    }
    line <- readLines(.stdin_conn, n = 1, warn = FALSE)
    if (length(line) == 0) {
      # Detected EOF from pipe or redirect
      return("__EOF__")
    }
    return(trimws(gsub("[\r\n]", "", line)))
  }
}

print_header <- function() {
  cat("\n")
  cat("======================================================================\n")
  cat("           MOVIE RECOMMENDATION SYSTEM (R PROGRAMMING)                \n")
  cat("      Content-Based Recommendation using Jaccard Genre Similarity     \n")
  cat("======================================================================\n")
  cat(" Transparent Scoring Model: 70% Genre Similarity + 30% Normalized Rating\n")
  cat("======================================================================\n\n")
}

display_recommendations <- function(results) {
  if (nrow(results) == 0) {
    cat("\n[!] No movies matched your criteria.\n")
    cat("    Try lowering the minimum rating or selecting broader genres.\n\n")
    return(invisible(NULL))
  }

  cat("\n----------------------------------------------------------------------\n")
  cat(sprintf(" TOP %d RECOMMENDED MOVIES FOR YOU\n", nrow(results)))
  cat("----------------------------------------------------------------------\n")

  for (i in seq_len(nrow(results))) {
    row <- results[i, ]
    cat(sprintf("\n#%d %s (%d)\n", i, toupper(row$title), row$release_year))
    cat(sprintf("    Genres         : %s\n", row$genre))
    cat(sprintf("    Rating         : %.1f / 10.0\n", row$rating))
    cat(sprintf("    Match Score    : %.1f%% (Genre Sim: %.1f%% | Norm Rating: %.1f%%)\n",
                row$recommendation_score * 100,
                row$similarity * 100,
                (row$rating / 10) * 100))
    cat(sprintf("    Explanation    : %s\n", row$explanation))
    cat(sprintf("    Synopsis       : %s\n", row$description))
  }
  cat("----------------------------------------------------------------------\n\n")
}

run_recommendation_cycle <- function(movies_df, all_genres) {
  cat("Available Genres:\n")
  for (i in seq_along(all_genres)) {
    cat(sprintf("  [%2d] %-15s", i, all_genres[i]))
    if (i %% 3 == 0 || i == length(all_genres)) cat("\n")
  }
  cat("\n")

  # 1. Preferred Genres input
  cat("Select preferred genres by number (e.g., 1, 5) or name (e.g., Sci-Fi, Action):\n")
  genre_input <- trimws(read_user_input("Enter selection (or Enter for all): "))

  selected_genres <- character(0)
  if (nchar(genre_input) > 0) {
    tokens <- trimws(unlist(strsplit(genre_input, ",")))
    for (tok in tokens) {
      if (grepl("^[0-9]+$", tok)) {
        idx <- as.integer(tok)
        if (idx >= 1 && idx <= length(all_genres)) {
          selected_genres <- c(selected_genres, all_genres[idx])
        }
      } else {
        # Match by name (case-insensitive)
        matched <- all_genres[tolower(all_genres) == tolower(tok)]
        if (length(matched) > 0) {
          selected_genres <- c(selected_genres, matched)
        }
      }
    }
    selected_genres <- unique(selected_genres)
  }

  if (length(selected_genres) > 0) {
    cat(sprintf("-> Selected genre(s): %s\n", paste(selected_genres, collapse = ", ")))
  } else {
    cat("-> No specific genre selected. Will rank purely by movie ratings.\n")
  }

  # 2. Minimum Rating input
  rating_input <- read_user_input("\nEnter minimum rating threshold (0.0 - 10.0) [Default: 7.0]: ")
  min_rating <- 7.0
  if (nchar(rating_input) > 0 && rating_input != "__EOF__") {
    parsed_rating <- suppressWarnings(as.numeric(rating_input))
    if (!is.na(parsed_rating) && parsed_rating >= 0 && parsed_rating <= 10) {
      min_rating <- parsed_rating
    } else {
      cat("[!] Invalid rating entered. Using default rating threshold: 7.0\n")
    }
  }
  cat(sprintf("-> Minimum rating: %.1f\n", min_rating))

  # 3. Optional Year Range input
  min_year_input <- read_user_input("\nEnter minimum release year (optional, press Enter to skip): ")
  min_year <- NULL
  if (nchar(min_year_input) > 0 && min_year_input != "__EOF__") {
    parsed_year <- suppressWarnings(as.integer(min_year_input))
    if (!is.na(parsed_year) && parsed_year > 1900 && parsed_year <= 2030) {
      min_year <- parsed_year
      cat(sprintf("-> Min release year: %d\n", min_year))
    }
  }

  max_year_input <- read_user_input("Enter maximum release year (optional, press Enter to skip): ")
  max_year <- NULL
  if (nchar(max_year_input) > 0 && max_year_input != "__EOF__") {
    parsed_year <- suppressWarnings(as.integer(max_year_input))
    if (!is.na(parsed_year) && parsed_year > 1900 && parsed_year <= 2030) {
      max_year <- parsed_year
      cat(sprintf("-> Max release year: %d\n", max_year))
    }
  }

  # 4. Top N Recommendations
  top_input <- read_user_input("Enter number of recommendations to display [Default: 5]: ")
  top_n <- 5
  if (nchar(top_input) > 0 && top_input != "__EOF__") {
    parsed_top <- suppressWarnings(as.integer(top_input))
    if (!is.na(parsed_top) && parsed_top > 0) {
      top_n <- min(parsed_top, 20)
    }
  }

  # Execute recommendation logic
  cat("\nProcessing recommendations...\n")
  results <- recommend_movies(
    movies_df = movies_df,
    user_genres = selected_genres,
    min_rating = min_rating,
    min_year = min_year,
    max_year = max_year,
    top_n = top_n,
    require_genre_overlap = (length(selected_genres) > 0)
  )

  display_recommendations(results)
}

main <- function() {
  print_header()

  # Load and validate dataset
  cat("Loading movie dataset from 'data/movies.csv'...\n")
  movies_df <- tryCatch({
    load_and_validate_movies("data/movies.csv")
  }, error = function(e) {
    cat(sprintf("[ERROR] Could not load dataset: %s\n", e$message))
    return(NULL)
  })

  if (is.null(movies_df)) {
    cat("Exiting application.\n")
    return(invisible(NULL))
  }

  cat(sprintf("[OK] Successfully loaded %d movies across %d genres.\n\n",
              nrow(movies_df), length(get_all_genres(movies_df))))

  all_genres <- get_all_genres(movies_df)

  # Interactive Loop
  repeat {
    run_recommendation_cycle(movies_df, all_genres)

    cat("Would you like to search with new preferences? (y/n) [Default: y]: ")
    choice <- tolower(trimws(read_user_input("")))
    if (choice == "__eof__" || choice == "n" || choice == "no" || choice == "exit" || choice == "q") {
      cat("\nThank you for using the Movie Recommendation System! Goodbye.\n\n")
      break
    }
    cat("\n")
  }
}

# Run when executed directly
if (!interactive()) {
  # If called with command-line arguments in non-interactive batch test
  args <- commandArgs(trailingOnly = TRUE)
  if (length(args) > 0 && args[1] == "--demo") {
    print_header()
    movies_df <- load_and_validate_movies("data/movies.csv")
    cat("[DEMO MODE] Running automated sample query: Genres = c('Sci-Fi', 'Adventure'), Min Rating = 8.0\n")
    results <- recommend_movies(
      movies_df = movies_df,
      user_genres = c("Sci-Fi", "Adventure"),
      min_rating = 8.0,
      top_n = 5
    )
    display_recommendations(results)
  } else {
    main()
  }
} else {
  main()
}
