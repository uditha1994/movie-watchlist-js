import { auth, database } from './firebase.js';
import {
    ref,
    onValue,
    get,
    push,
    update,
    remove,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

//DOM element
const movieForm = document.getElementById('movieForm');
const movieIdInput = document.getElementById('movieId');
const titleInput = document.getElementById('title');
const yearInput = document.getElementById('year');
const derectorInput = document.getElementById('director');
const genreSelect = document.getElementById('genre');
const statusRadios = document.getElementById('status');
const ratingInput = document.getElementById('rating');
const notesInput = document.getElementById('notes');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const filterGenre = document.getElementById('filterGenre');
const moviesList = document.getElementById('moviesList');
const totalMovies = document.getElementById('totalMovies');
const watchlistCount = document.getElementById('watchlistCount');
const watchedCount = document.getElementById('watchedCount');

const stars = document.querySelectorAll('.rating-stars i');

let isEditing = false;
let currentMovieId = null;

//Initialize the application
function init() {
    //setup event listenersfilterGenre
    movieForm.addEventListener('submit', handleFormSumbit);
    cancelBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', filterMovies);
    filterStatus.addEventListener('change', filterMovies);
    filterGenre.addEventListener('change', filterMovies);

    //star functionality
    stars.forEach(star => {
        star.addEventListener('click', handleStarClick);
        star.addEventListener('mouseover', handleStarHover);
        star.addEventListener('mouseout', handleStarOut);
    });

    //load movies from firebase
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        // Only allow access if email is verified
        if (!user.emailVerified && window.location.pathname.includes('dashboard.html')) {
            alert('Please verify your email address before accessing the dashboard.');
            signOut(auth);
            window.location.href = 'index.html';
            return;
        }

        loadMovies();
    });
}

function loadMovies() {
    const user = auth.currentUser;
    if (!user) return;

    //Load movies from firebase
    const userId = user.uid;
    const movieRef = ref(database, `users/${userId}/movies`);

    onValue(movieRef, (snapshot) => {
        const movies = [];
        let watchlist = 0;
        let watched = 0;

        snapshot.forEach((childSnapshot) => {
            const movie = {
                id: childSnapshot.key,
                ...childSnapshot.val()
            };
            movies.push(movie);

            if (movie.status === 'watchlist') {
                watchlist++;
            } else if (movie.status === 'watched') {
                watched++;
            }
        });

        //update stats
        totalMovies.textContent = movies.length;
        watchlistCount.textContent = watchlist;
        watchedCount.textContent = watched;

        displayMovies(movies);
    }, (error) => {
        console.error("Error loading movies:", error);
        moviesList.innerHTML = '<div class="error">Error loading movies</div>';
    });
}

//  Display movies in the UI
function displayMovies(movies) {
    if (movies.length === 0) {
        moviesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-film"></i>
                <h3>No Movies Found</h3>
                <p>Add your first movie to get started!!</p>
            </div>
        `;
        return;
    }

    moviesList.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.dataset.id = movie.id;

        //create star rating HTML
        let starHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= movie.rating) {
                starHtml += '<i class="fas fa-star"></i>';
            } else {
                starHtml += '<i class="far fa-star"></i>';
            }
        }

        movieCard.innerHTML = `
            <div class="movie-poster" style="background-image: url('${movie.posterUrl
            || '../images/movie-placeholder.jpg'}')">
                <span class="movie-status ${movie.status}">
                    ${movie.status === 'watchlist' ? 'To Watch' : 'Watched'}
                </span>
            </div>

            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span>${movie.year}</span>
                    <span>${movie.genre}</span>
                </div>
                <div class="movie-rating">
                    ${starHtml}
                </div>
                ${movie.notes ? `<p class="movie-notes">${movie.notes}</p>` : ``}
                <div class="movie-actions">
                    <button class="btn btn-edit" data-id="${movie.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" data-id="${movie.id}">
                        <i class="fas fa-trash"></i>Delete
                    </button>
                </div>
            </div>
        `;
        moviesList.appendChild(movieCard);
    });

    //add event listeners to update and delete buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', handleEditMovie);
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', handleDeleteMovie);
    });
}

async function handleFormSumbit(e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    const year = yearInput.value;
    const director = derectorInput.value.trim();
    const genre = genreSelect.value;
    const status = document.querySelector('input[name="status"]:checked').value;
    const rating = ratingInput.value;
    const notes = notesInput.value.trim();

    if (!title) {
        alert('Please enter a movie title');
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        showAlert('You need to be signed in to save movies', 'error');
        return;
    }

    const userId = user.uid;

    const movieData = {
        title,
        year: year || null,
        director: director || null,
        genre,
        status,
        rating: rating ? parseInt(rating) : 0,
        notes: notes || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    }

    try {
        if (isEditing) {
            //update existing movie
            await update(ref(database,
                `users/${userId}/movies/${currentMovieId}`), movieData);
            showAlert('movie updated successfully!!', 'success');

        } else {
            //add new movie
            await push(ref(database, `users/${userId}/movies`), movieData);
            showAlert('movie added successfully!!', 'success');
        }
        resetForm();
    } catch (error) {
        showAlert(`Error: ${error.message}`, 'error');
    }
}

async function handleEditMovie(e) {
    const movieId = e.currentTarget.dataset.id;
    const user = auth.currentUser;
    if (!user) return;

    try {
        const snapshot = await get(ref(database,
            `users/${user.uid}/movies/${movieId}`));

        if (!snapshot.exists()) {
            throw new Error('Movie not found');
        }

        const movie = snapshot.val();

        //fill the form with movie data
        movieIdInput.value = movieId;
        titleInput.value = movie.title || '';
        yearInput.value = movie.year || '';
        derectorInput.value = movie.director || '';
        genreSelect.value = movie.genre || 'Action';

        document.querySelector(`input[name="status"][value="${movie.status}"]`).checked = true;

        ratingInput.value = movie.rating || 0;
        updateStarRating(movie.rating || 0);

        notesInput.value = movie.notes || '';

        isEditing = true;
        currentMovieId = movieId;
        saveBtn.textContent = 'Update Movie';

        //scroll to form
        document.querySelector('.form-container').scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        showAlert(`Error loading movie: ${error.message}`, 'error');
    }
}

async function handleDeleteMovie(e) {
    if (!confirm('Are you sure want to delete this movie?')) {
        return;
    }

    const movieId = e.currentTarget.dataset.id;
    const user = auth.currentUser;
    if (!user) return;

    try {
        await remove(ref(database,
            `users/${user.uid}/movies/${movieId}`));
        showAlert('Movie deleted successfully!!', 'success');
    } catch (error) {
        showAlert('Error deleting movie:' + error.message, 'error');
    }
}

function filterMovies() {
    const searchTerm = searchInput.value.toLowerCase();
    const stateFilter = filterStatus.value;
    const genreFilter = filterGenre.value;
    const user = auth.currentUser;

    if (!user) return;

    onValue(ref(database, `users/${user.uid}/movies`), (snapshot) => {
        const movies = [];
        snapshot.forEach(childSnapshot => {
            const movie = {
                id: childSnapshot.key,
                ...childSnapshot.val()
            };

            //apply filters
            const matchesSearch = movie.title.toLowerCase()
                .includes(searchTerm) ||
                (movie.director && movie.director.toLowerCase()
                    .includes(searchTerm));

            const matchesStatus = stateFilter === 'all'
                || movie.status === stateFilter;
            const matchesGenre = !genreFilter || movie.genre === genreFilter;

            if (matchesSearch && matchesStatus && matchesGenre) {
                movies.push(movie);
            }
        });
        displayMovies(movies);
    });
}

function resetForm() {
    movieForm.reset();
    movieIdInput.value = '';
    ratingInput.value = '0';
    isEditing = false;
    currentMovieId = null;
    saveBtn.textContent = 'Save Movie';
}

//star rating functinalities
function handleStarClick(e) {
    const rating = parseInt(e.target.dataset.rating);
    ratingInput.value = rating;
    updateStarRating(rating);
}

function handleStarHover(e) {
    const rating = parseInt(e.target.dataset.rating);
    highlightStars(rating);
}

function handleStarOut() {
    const currentRating = parseInt(ratingInput.value);
    highlightStars(currentRating);
}

function highlightStars(count) {
    stars.forEach((star, index) => {
        if (index < count) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function updateStarRating(rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('active');
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

function updateThemeIcon(theme) {
    const favicon = document.querySelector('link[rel="icon"]');
    const themeColor = document.getElementById('theme-color');

    // Create a new favicon link to force refresh
    const newFavicon = favicon.cloneNode(true);

    if (theme === 'dark') {
        newFavicon.href = 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <style>path{fill:white}</style>
                <path d="M20,30 L80,30 L80,70 L20,70 Z"/>
                <path d="M20,30 L20,50 L10,50 L10,30 Z" opacity="0.8"/>
                <path d="M80,30 L80,50 L90,50 L90,30 Z" opacity="0.8"/>
                <circle cx="30" cy="50" r="5" fill="white"/>
                <circle cx="50" cy="50" r="5" fill="white"/>
                <circle cx="70" cy="50" r="5" fill="white"/>
            </svg>
        `);
        themeColor.content = '#6a8fc5';
    } else {
        newFavicon.href = 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <style>path{fill:black}</style>
                <path d="M20,30 L80,30 L80,70 L20,70 Z"/>
                <path d="M20,30 L20,50 L10,50 L10,30 Z" opacity="0.8"/>
                <path d="M80,30 L80,50 L90,50 L90,30 Z" opacity="0.8"/>
                <circle cx="30" cy="50" r="5" fill="black"/>
                <circle cx="50" cy="50" r="5" fill="black"/>
                <circle cx="70" cy="50" r="5" fill="black"/>
            </svg>
        `);
        themeColor.content = '#4a6fa5';
    }

    // Replace the favicon
    document.head.removeChild(favicon);
    document.head.appendChild(newFavicon);
}

//Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('DOMContentLoaded', updateThemeIcon('light'));

