/**
 * script.js - Movie Recommendation System
 * Client-side mirror of the authoritative R recommendation algorithm
 * 
 * Note: R cannot execute directly in static browser hosts like GitHub Pages.
 * This client-side script faithfully replicates the R implementation's
 * Jaccard Genre Similarity (70%) and Normalized Rating (30%) logic using
 * the same dataset (data/movies.csv).
 */

// Embedded fallback dataset in case user opens index.html via file:// protocol
const FALLBACK_MOVIES = [
  { movie_id: 1, title: "Echoes of the Cosmos", genre: "Sci-Fi|Adventure", rating: 8.7, release_year: 2021, description: "An astrophysicist deciphers a repeating signal originating from deep space." },
  { movie_id: 2, title: "Silent Melody", genre: "Drama|Romance", rating: 8.2, release_year: 2018, description: "A deaf pianist and a street violinist compose an award-winning symphony together." },
  { movie_id: 3, title: "The Neon Heist", genre: "Action|Crime|Thriller", rating: 7.9, release_year: 2022, description: "A team of elite hackers attempts to drain a corrupt cyber-banking conglomerate." },
  { movie_id: 4, title: "Shadows Over Venice", genre: "Mystery|Thriller", rating: 7.5, release_year: 2016, description: "A retired detective unravels an ancient conspiracy amidst the misty canals of Venice." },
  { movie_id: 5, title: "Starlight Odyssey", genre: "Sci-Fi|Adventure|Action", rating: 8.9, release_year: 2023, description: "Astronauts embark on humanity's first interstellar voyage through a stable wormhole." },
  { movie_id: 6, title: "Laughter Therapy", genre: "Comedy|Romance", rating: 7.1, release_year: 2019, description: "Two rival relationship counselors accidentally fall in love during a joint seminar." },
  { movie_id: 7, title: "Chronicles of Eldoria", genre: "Fantasy|Adventure", rating: 8.4, release_year: 2017, description: "A young blacksmith discovers a broken relic capable of restoring peace to divided kingdoms." },
  { movie_id: 8, title: "The Velvet Secret", genre: "Drama|Mystery", rating: 7.6, release_year: 2015, description: "An archivist uncovers hidden love letters that expose a high-society political scandal." },
  { movie_id: 9, title: "Cybernetic Dawn", genre: "Sci-Fi|Action", rating: 8.1, release_year: 2020, description: "In a dystopian metropolis a rogue cyborg fights to liberate sentient machine workers." },
  { movie_id: 10, title: "Rustic Kitchen", genre: "Comedy|Drama", rating: 7.8, release_year: 2021, description: "A gourmet chef leaves city life to revive his grandmother's failing village bakery." },
  { movie_id: 11, title: "Frozen Horizon", genre: "Adventure|Thriller", rating: 8.0, release_year: 2014, description: "Arctic explorers struggle to survive after their research vessel becomes trapped in pack ice." },
  { movie_id: 12, title: "The Crimson Manor", genre: "Horror|Mystery", rating: 6.9, release_year: 2019, description: "Skeptical paranormal investigators spend seven nights in an abandoned Victorian estate." },
  { movie_id: 13, title: "Guardians of the Wild", genre: "Documentary|Adventure", rating: 8.8, release_year: 2022, description: "A cinematic journey following wildlife rangers protecting endangered mountain gorillas." },
  { movie_id: 14, title: "Midnight Express Lane", genre: "Action|Comedy", rating: 7.3, release_year: 2018, description: "An unsuspecting rideshare driver gets pulled into a high-octane mob getaway chase." },
  { movie_id: 15, title: "Beneath the Surface", genre: "Drama|Mystery", rating: 7.7, release_year: 2020, description: "A coastal town confronts long-buried secrets when drought reveals a sunken hamlet." },
  { movie_id: 16, title: "Quantum Rift", genre: "Sci-Fi|Thriller", rating: 8.3, release_year: 2024, description: "Physicists at a particle collider accidentally open a doorway into parallel timelines." },
  { movie_id: 17, title: "Parisian Sunset", genre: "Romance|Drama", rating: 7.4, release_year: 2016, description: "Two foreign exchange students spend one unforgettable summer along the River Seine." },
  { movie_id: 18, title: "The Iron Bastion", genre: "Action|History|Drama", rating: 8.5, release_year: 2017, description: "A besieged garrison defends an ancient fortress against overwhelming medieval forces." },
  { movie_id: 19, title: "Pixel Pals", genre: "Animation|Comedy|Family", rating: 8.0, release_year: 2021, description: "Retro arcade characters unite to save their game cartridge from being deleted." },
  { movie_id: 20, title: "Dark Water Trench", genre: "Sci-Fi|Horror", rating: 6.8, release_year: 2018, description: "Deep-sea marine biologists encounter bioluminescent predators in the Mariana Trench." },
  { movie_id: 21, title: "Golden Harvest", genre: "Drama", rating: 8.1, release_year: 2013, description: "Three generations of farmers battle corporate buyout attempts to keep their ancestral soil." },
  { movie_id: 22, title: "The Phantom Syndicate", genre: "Action|Thriller", rating: 7.8, release_year: 2022, description: "An undercover agent infiltrates a counterfeit art ring operating across European capitals." },
  { movie_id: 23, title: "Whispering Pines", genre: "Mystery|Drama", rating: 7.3, release_year: 2015, description: "A park ranger investigates strange acoustic anomalies occurring deep within protected woods." },
  { movie_id: 24, title: "Galactic Bounty", genre: "Sci-Fi|Comedy|Action", rating: 8.2, release_year: 2023, description: "A mismatched duo of space hunters accidentally rescue an interplanetary diplomat." },
  { movie_id: 25, title: "Summer of Harmony", genre: "Romance|Comedy", rating: 7.0, release_year: 2017, description: "A free-spirited musician and a corporate auditor clash and connect at a music festival." },
  { movie_id: 26, title: "The Last Alchemist", genre: "Fantasy|Mystery", rating: 8.3, release_year: 2020, description: "An apprentice searches for the legendary philosopher's stone to cure an empire-wide plague." },
  { movie_id: 27, title: "Urban Beats", genre: "Drama|Music", rating: 7.9, release_year: 2019, description: "Underground rap artists in Brooklyn compete for a life-altering recording contract." },
  { movie_id: 28, title: "Desert Mirage", genre: "Adventure|Action", rating: 7.4, release_year: 2016, description: "Treasure hunters race against ruthless mercenaries across the Sahara desert." },
  { movie_id: 29, title: "The Silicon Illusion", genre: "Documentary|Thriller", rating: 8.6, release_year: 2021, description: "An investigative expose exploring how social media algorithms influence global elections." },
  { movie_id: 30, title: "Lover's Knot", genre: "Romance|Drama", rating: 7.2, release_year: 2014, description: "Childhood sweethearts meet after a decade apart and question the life choices they made." },
  { movie_id: 31, title: "Orbital Decay", genre: "Sci-Fi|Thriller", rating: 8.4, release_year: 2023, description: "Space station crew members fight to restore propulsion before burning up in the atmosphere." },
  { movie_id: 32, title: "The Clown's Riddle", genre: "Comedy|Mystery", rating: 7.0, release_year: 2018, description: "A clumsy stage clown unintentionally stumbles upon clues that crack a museum theft." },
  { movie_id: 33, title: "Savage Peak", genre: "Action|Adventure", rating: 7.7, release_year: 2015, description: "Mountaineers must navigate treacherous blizzards and hostile terrain to rescue survivors." },
  { movie_id: 34, title: "Tales of Mythica", genre: "Animation|Fantasy|Adventure", rating: 8.5, release_year: 2022, description: "A young sorceress journeys across mythical floating islands to awaken ancient dragons." },
  { movie_id: 35, title: "Vortex Protocol", genre: "Sci-Fi|Action", rating: 7.9, release_year: 2020, description: "A cyber-defense operative uncovers a sinister AI planning to compromise world power grids." },
  { movie_id: 36, title: "The Antique Watchmaker", genre: "Drama|Mystery", rating: 8.1, release_year: 2016, description: "A horologist finds hidden microfilms sealed inside a pocket watch from World War II." },
  { movie_id: 37, title: "Campfire Nightmares", genre: "Horror|Thriller", rating: 6.7, release_year: 2019, description: "College campers realize an urban legend haunting the forest may be terrifyingly real." },
  { movie_id: 38, title: "Velocity Rush", genre: "Action|Thriller", rating: 7.5, release_year: 2021, description: "An illegal street racer is coerced into pulling off high-speed border courier runs." },
  { movie_id: 39, title: "The Ocean's Whisper", genre: "Documentary|Family", rating: 8.7, release_year: 2023, description: "A breathtaking exploration of marine life and coral reefs across the South Pacific." },
  { movie_id: 40, title: "Love in Translation", genre: "Romance|Comedy", rating: 7.6, release_year: 2018, description: "A diplomat and an interpreter find common ground despite cultural and language barriers." },
  { movie_id: 41, title: "The Clockwork Empire", genre: "Fantasy|Sci-Fi", rating: 8.2, release_year: 2022, description: "Steampunk airship captains defend their sky cities from mechanical sky pirates." },
  { movie_id: 42, title: "Undercover Melody", genre: "Comedy|Action", rating: 7.2, release_year: 2017, description: "An uncoordinated FBI agent goes undercover as a lead singer in a traveling pop band." },
  { movie_id: 43, title: "Echoes of the Trench", genre: "History|Drama", rating: 8.4, release_year: 2015, description: "A poignant look into the camaraderie and courage of soldiers during the Great War." },
  { movie_id: 44, title: "Cyber Street Dogs", genre: "Animation|Sci-Fi|Action", rating: 8.0, release_year: 2023, description: "A pack of augmented stray dogs protects vulnerable street orphans in Neo-Tokyo." },
  { movie_id: 45, title: "The Forgotten Cipher", genre: "Mystery|Thriller", rating: 7.9, release_year: 2018, description: "A cryptographer races against time to stop an encrypted countdown broadcast on radio waves." },
  { movie_id: 46, title: "Highland Serenade", genre: "Romance|Drama", rating: 7.3, release_year: 2019, description: "An American novelist seeks solitude in the Scottish Highlands and meets a local historian." },
  { movie_id: 47, title: "Solaris Drift", genre: "Sci-Fi|Drama", rating: 8.6, release_year: 2024, description: "A lone technician on a solar observation satellite discovers an anomaly inside solar flares." },
  { movie_id: 48, title: "The Jester's Gambit", genre: "Comedy|History", rating: 7.4, release_year: 2016, description: "A royal court jester uses quick wit and hilarious blunders to thwart a palace coup." },
  { movie_id: 49, title: "Haunted Reverie", genre: "Horror|Mystery", rating: 7.1, release_year: 2021, description: "A psychologist treating insomnia patients realizes their collective nightmares are shared." },
  { movie_id: 50, title: "Apex Predator", genre: "Action|Adventure|Thriller", rating: 7.8, release_year: 2020, description: "A wildlife tracker guides a rescue team through dense jungle to locate downed pilots." }
];

// Application State
let allMovies = [];
let availableGenres = [];
let selectedGenres = new Set(["Sci-Fi", "Adventure"]); // Pre-select for delightful initial state

// DOM Elements
const genreChipsContainer = document.getElementById("genre-chips-container");
const genreCountHint = document.getElementById("genre-count-hint");
const ratingSlider = document.getElementById("rating-slider");
const ratingValueDisplay = document.getElementById("rating-value-display");
const minYearSelect = document.getElementById("min-year-select");
const topNSelect = document.getElementById("top-n-select");
const btnGetRecommendations = document.getElementById("btn-get-recommendations");
const btnResetPreferences = document.getElementById("btn-reset-preferences");
const btnSelectAllGenres = document.getElementById("btn-select-all-genres");
const btnClearGenres = document.getElementById("btn-clear-genres");
const dataStatusAlert = document.getElementById("data-status-alert");
const dataStatusText = document.getElementById("data-status-text");
const resultsGrid = document.getElementById("results-grid");
const emptyStateCard = document.getElementById("empty-state-card");
const resultsHeading = document.getElementById("results-heading");
const resultsMetaPill = document.getElementById("results-meta-pill");
const btnLoosenFilters = document.getElementById("btn-loosen-filters");
const btnEmptyReset = document.getElementById("btn-empty-reset");

/**
 * Robust CSV parser for data/movies.csv
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse comma-separated fields while respecting potential quotes
    const values = [];
    let insideQuotes = false;
    let currentValue = "";

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    if (values.length >= headers.length) {
      const record = {};
      headers.forEach((header, idx) => {
        let val = values[idx];
        if (header === "movie_id" || header === "release_year") {
          val = parseInt(val, 10);
        } else if (header === "rating") {
          val = parseFloat(val);
        }
        record[header] = val;
      });
      records.push(record);
    }
  }

  return records;
}

/**
 * Load dataset with fallback support
 */
async function loadDataset() {
  try {
    const response = await fetch("data/movies.csv");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const csvData = await response.text();
    const parsed = parseCSV(csvData);

    if (parsed.length > 0) {
      allMovies = parsed;
      dataStatusAlert.className = "data-status-alert";
      dataStatusText.textContent = `Successfully loaded ${allMovies.length} movies via HTTP from data/movies.csv`;
    } else {
      throw new Error("CSV was empty or unparseable");
    }
  } catch (err) {
    console.warn("Could not load data/movies.csv via fetch (likely opened via local file:// protocol). Using bundled dataset.", err);
    allMovies = FALLBACK_MOVIES;
    dataStatusAlert.className = "data-status-alert";
    dataStatusText.textContent = `Using verified offline dataset (${allMovies.length} movies). Served for direct local browsing & viva demo.`;
  }

  extractGenres();
  renderGenreChips();
  generateAndDisplayRecommendations();
}

/**
 * Extract unique sorted genres from movies
 */
function extractGenres() {
  const genreSet = new Set();
  allMovies.forEach(m => {
    if (m.genre) {
      m.genre.split("|").forEach(g => {
        const clean = g.trim();
        if (clean) genreSet.add(clean);
      });
    }
  });
  availableGenres = Array.from(genreSet).sort();
}

/**
 * Render genre selector chips
 */
function renderGenreChips() {
  genreChipsContainer.innerHTML = "";
  availableGenres.forEach(genre => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `genre-chip ${selectedGenres.has(genre) ? "selected" : ""}`;
    chip.textContent = genre;
    chip.setAttribute("data-genre", genre);

    chip.addEventListener("click", () => {
      if (selectedGenres.has(genre)) {
        selectedGenres.delete(genre);
        chip.classList.remove("selected");
      } else {
        selectedGenres.add(genre);
        chip.classList.add("selected");
      }
      updateGenreHint();
    });

    genreChipsContainer.appendChild(chip);
  });
  updateGenreHint();
}

function updateGenreHint() {
  const count = selectedGenres.size;
  if (count === 0) {
    genreCountHint.textContent = "0 genres selected (will rank purely by rating score)";
  } else {
    genreCountHint.textContent = `${count} genre(s) selected: ${Array.from(selectedGenres).join(", ")}`;
  }
}

/**
 * Identical R Jaccard Similarity Formula: J(A, B) = |A ∩ B| / |A ∪ B|
 */
function calculateJaccardSimilarity(userGenresArray, movieGenresArray) {
  if (!userGenresArray.length || !movieGenresArray.length) return 0.0;

  const uSet = new Set(userGenresArray.map(g => g.toLowerCase().trim()));
  const mSet = new Set(movieGenresArray.map(g => g.toLowerCase().trim()));

  let intersectionCount = 0;
  for (const g of uSet) {
    if (mSet.has(g)) intersectionCount++;
  }

  const unionSize = new Set([...uSet, ...mSet]).size;
  if (unionSize === 0) return 0.0;

  return Math.round((intersectionCount / unionSize) * 10000) / 10000;
}

/**
 * Identical R Composite Score Formula: 70% Genre Similarity + 30% Normalized Rating
 */
function calculateRecommendationScore(similarity, rating, weightSim = 0.70, weightRating = 0.30) {
  const normRating = Math.max(0, Math.min(10, rating)) / 10.0;
  const score = (weightSim * similarity) + (weightRating * normRating);
  return Math.round(score * 10000) / 10000;
}

/**
 * Generate human-readable explanation matching R generate_explanation()
 */
function generateExplanation(matchingGenres, similarity, rating, score) {
  const pctSim = (similarity * 100).toFixed(1);
  const pctScore = (score * 100).toFixed(1);

  if (matchingGenres.length > 0) {
    return `Matches ${matchingGenres.length} genre(s) [${matchingGenres.join(", ")}] with ${pctSim}% genre overlap. Rating: ${rating.toFixed(1)}/10. Overall match score: ${pctScore}%.`;
  } else {
    return `No direct genre overlap; ranked purely on rating (${rating.toFixed(1)}/10) with overall score ${pctScore}%.`;
  }
}

/**
 * Core recommendation pipeline
 */
function recommendMovies(userGenresArray, minRating, minYear, topN) {
  // 1. Filter movies by rating & year
  let candidates = allMovies.filter(m => {
    if (m.rating < minRating) return false;
    if (minYear && m.release_year < minYear) return false;
    return true;
  });

  const scoredCandidates = [];

  for (const movie of candidates) {
    const movieGenres = movie.genre.split("|").map(g => g.trim());
    const lowerUser = userGenresArray.map(g => g.toLowerCase());
    const matchingGenres = movieGenres.filter(g => lowerUser.includes(g.toLowerCase()));

    const sim = calculateJaccardSimilarity(userGenresArray, movieGenres);
    const score = calculateRecommendationScore(sim, movie.rating);

    // If user selected genres, require similarity > 0
    if (userGenresArray.length > 0 && sim === 0) {
      continue;
    }

    scoredCandidates.push({
      ...movie,
      movieGenres,
      matchingGenres,
      similarity: sim,
      score: score,
      explanation: generateExplanation(matchingGenres, sim, movie.rating, score)
    });
  }

  // 2. Sort descending primarily by score, tie-break by rating, then year
  scoredCandidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.release_year - a.release_year;
  });

  return scoredCandidates.slice(0, topN);
}

/**
 * Render recommendations to results-grid
 */
function generateAndDisplayRecommendations() {
  const userGenresArray = Array.from(selectedGenres);
  const minRating = parseFloat(ratingSlider.value) || 0.0;
  const minYear = minYearSelect.value ? parseInt(minYearSelect.value, 10) : null;
  const topN = parseInt(topNSelect.value, 10) || 5;

  const results = recommendMovies(userGenresArray, minRating, minYear, topN);

  resultsGrid.innerHTML = "";

  if (results.length === 0) {
    emptyStateCard.style.display = "block";
    resultsMetaPill.textContent = "0 matches found";
    resultsHeading.textContent = "No Movies Found";
    return;
  }

  emptyStateCard.style.display = "none";
  resultsHeading.textContent = `Top ${results.length} Recommendations`;
  resultsMetaPill.textContent = `${results.length} movies scored • Min Rating: ${minRating.toFixed(1)}`;

  results.forEach((movie, index) => {
    const rank = index + 1;
    const card = document.createElement("div");
    card.className = "movie-rec-card";

    // Genre tags HTML with highlighted matches
    const genreTagsHtml = movie.movieGenres.map(g => {
      const isMatch = movie.matchingGenres.includes(g);
      return `<span class="genre-tag ${isMatch ? "matched" : ""}">${g}</span>`;
    }).join("");

    const scorePct = (movie.score * 100).toFixed(1);
    const simPct = (movie.similarity * 100).toFixed(1);
    const ratingPct = ((movie.rating / 10.0) * 100).toFixed(1);

    card.innerHTML = `
      <div class="card-top-row">
        <span class="rank-pill ${rank === 1 ? "top-pick" : ""}">Rank #${rank}</span>
        <span class="rating-badge">★ ${movie.rating.toFixed(1)} / 10</span>
      </div>
      <h3 class="card-title">${escapeHTML(movie.title)}</h3>
      <div class="card-year">Released: ${movie.release_year}</div>
      <div class="card-genres">${genreTagsHtml}</div>
      <p class="card-description">${escapeHTML(movie.description)}</p>
      
      <div class="score-box">
        <div class="score-header">
          <span>Recommendation Match</span>
          <span class="score-percentage">${scorePct}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${scorePct}%;"></div>
        </div>
        <div class="score-breakdown-row">
          <span>70% Similarity: ${simPct}%</span>
          <span>30% Rating: ${ratingPct}%</span>
        </div>
      </div>

      <div class="explanation-banner">
        <span class="exp-icon">💡</span>
        <span>${escapeHTML(movie.explanation)}</span>
      </div>
    `;

    resultsGrid.appendChild(card);
  });
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, tag => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[tag] || tag));
}

// Event Listeners
ratingSlider.addEventListener("input", (e) => {
  ratingValueDisplay.textContent = `${parseFloat(e.target.value).toFixed(1)} / 10.0`;
});

btnGetRecommendations.addEventListener("click", () => {
  generateAndDisplayRecommendations();
  // Smooth scroll to results
  document.getElementById("results").scrollIntoView({ behavior: "smooth" });
});

btnResetPreferences.addEventListener("click", () => {
  selectedGenres = new Set(["Sci-Fi", "Adventure"]);
  ratingSlider.value = 7.0;
  ratingValueDisplay.textContent = "7.0 / 10.0";
  minYearSelect.value = "";
  topNSelect.value = "5";
  renderGenreChips();
  generateAndDisplayRecommendations();
});

btnSelectAllGenres.addEventListener("click", () => {
  ["Action", "Adventure", "Sci-Fi", "Drama", "Thriller"].forEach(g => selectedGenres.add(g));
  renderGenreChips();
});

btnClearGenres.addEventListener("click", () => {
  selectedGenres.clear();
  renderGenreChips();
});

btnLoosenFilters.addEventListener("click", () => {
  ratingSlider.value = 6.5;
  ratingValueDisplay.textContent = "6.5 / 10.0";
  minYearSelect.value = "";
  generateAndDisplayRecommendations();
});

btnEmptyReset.addEventListener("click", () => {
  btnResetPreferences.click();
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadDataset();
});
