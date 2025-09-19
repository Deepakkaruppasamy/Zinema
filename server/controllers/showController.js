import axios from "axios"
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import Review from "../models/Review.js";
import { inngest } from "../inngest/index.js";

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res)=>{
    try {
        const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            headers: {Authorization : `Bearer ${process.env.TMDB_API_KEY}`}
        })

        const movies = data.results;
        res.json({success: true, movies: movies})
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

// Helper function to make API calls with retry
const makeApiCallWithRetry = async (url, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
                timeout: 10000 // 10 second timeout
            });
            return response;
        } catch (error) {
            if (i === retries - 1) throw error; // If this was the last retry, throw the error
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // Exponential backoff
        }
    }
};

// API to add a new show to the database
export const addShow = async (req, res) =>{
    try {
        const {movieId, showsInput, showPrice} = req.body;

        if (!movieId) {
            return res.status(400).json({ success: false, message: 'Movie ID is required' });
        }

        let movie = await Movie.findById(movieId);

        if(!movie) {
            try {
                // Fetch movie details and credits from TMDB API with retry logic
                const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                    makeApiCallWithRetry(`https://api.themoviedb.org/3/movie/${movieId}`),
                    makeApiCallWithRetry(`https://api.themoviedb.org/3/movie/${movieId}/credits`)
                ]);

                const movieApiData = movieDetailsResponse?.data;
                const movieCreditsData = movieCreditsResponse?.data;

                const movieDetails = {
                    _id: movieId,
                    title: movieApiData.title,
                    overview: movieApiData.overview,
                    poster_path: movieApiData.poster_path,
                    backdrop_path: movieApiData.backdrop_path,
                    genres: movieApiData.genres,
                    casts: movieCreditsData.cast,
                    release_date: movieApiData.release_date,
                    original_language: movieApiData.original_language,
                    tagline: movieApiData.tagline || "",
                    vote_average: movieApiData.vote_average,
                    runtime: movieApiData.runtime,
                };

                // Add movie to the database
                movie = await Movie.create(movieDetails);
            } catch (apiError) {
                console.error('Error fetching from TMDB API:', apiError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to fetch movie details from TMDB',
                    error: apiError.message 
                });
            }
        }

        const showsToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            show.time.forEach((time)=>{
                const dateTimeString = `${showDate}T${time}`;
                showsToCreate.push({
                    movie: movieId,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    occupiedSeats: {}
                })
            })
        });

        if(showsToCreate.length > 0){
            await Show.insertMany(showsToCreate);
        }

         //  Trigger Inngest event
         await inngest.send({
            name: "app/show.added",
             data: {movieTitle: movie.title}
         })

        res.json({success: true, message: 'Show Added successfully.'})
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

// API to get all shows from the database
export const getShows = async (req, res) =>{
    try {
        const shows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie').sort({ showDateTime: 1 });

        // filter unique shows
        const uniqueShows = new Set(shows.map(show => show.movie))

        res.json({success: true, shows: Array.from(uniqueShows)})
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get a single show from the database
export const getShow = async (req, res) =>{
    try {
        const {movieId} = req.params;
        // get all upcoming shows for the movie
        const shows = await Show.find({movie: movieId, showDateTime: { $gte: new Date() }})

        const movie = await Movie.findById(movieId);
        const dateTime = {};

        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];
            if(!dateTime[date]){
                dateTime[date] = []
            }
            dateTime[date].push({ time: show.showDateTime, showId: show._id })
        })

        // Aggregate user reviews for this movie
        const agg = await Review.aggregate([
            { $match: { movie: movieId } },
            { $group: { _id: "$movie", count: { $sum: 1 }, avg: { $avg: "$rating" } } }
        ]);
        const userRating = agg.length ? { count: agg[0].count, avg: Number(agg[0].avg.toFixed(1)) } : { count: 0, avg: 0 };

        res.json({success: true, movie, dateTime, userRating})
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}