import axios from 'axios';

// Create axios instance with default configuration
const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Authorization': `Bearer ${process.env.TMDB_API_KEY}`,
    'Accept': 'application/json',
    'User-Agent': 'Zinema-App/1.0'
  },
  // Retry configuration
  retry: 3,
  retryDelay: 1000, // 1 second
});

// Retry interceptor
const retryInterceptor = (error) => {
  const { config } = error;
  
  if (!config || !config.retry) {
    return Promise.reject(error);
  }

  config.retryCount = config.retryCount || 0;

  if (config.retryCount >= config.retry) {
    return Promise.reject(error);
  }

  config.retryCount++;

  // Only retry on network errors or 5xx status codes
  const shouldRetry = 
    error.code === 'ECONNRESET' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT' ||
    (error.response && error.response.status >= 500);

  if (!shouldRetry) {
    return Promise.reject(error);
  }

  console.log(`Retrying request (${config.retryCount}/${config.retry}): ${config.url}`);

  // Exponential backoff delay
  const delay = config.retryDelay * Math.pow(2, config.retryCount - 1);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(tmdbApi(config));
    }, delay);
  });
};

// Request interceptor for logging
tmdbApi.interceptors.request.use(
  (config) => {
    console.log(`Making TMDB API request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('TMDB API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
tmdbApi.interceptors.response.use(
  (response) => {
    console.log(`TMDB API response: ${response.status} ${response.config.url}`);
    return response;
  },
  retryInterceptor
);

// Helper function to make API calls with better error handling
export const makeTmdbRequest = async (url, options = {}) => {
  try {
    const response = await tmdbApi.get(url, {
      ...options,
      retry: options.retry || 3,
      retryDelay: options.retryDelay || 1000,
    });
    return response.data;
  } catch (error) {
    console.error(`TMDB API Error for ${url}:`, {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    
    // Provide more specific error messages
    if (error.code === 'ECONNRESET') {
      throw new Error('Connection to TMDB API was reset. Please try again.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Request to TMDB API timed out. Please try again.');
    } else if (error.response?.status === 429) {
      throw new Error('TMDB API rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid TMDB API key. Please check your configuration.');
    } else if (error.response?.status >= 500) {
      throw new Error('TMDB API server error. Please try again later.');
    } else {
      throw new Error(`TMDB API error: ${error.message}`);
    }
  }
};

// Specific functions for common TMDB API calls
export const getNowPlayingMovies = async () => {
  return await makeTmdbRequest('/movie/now_playing');
};

export const getMovieDetails = async (movieId) => {
  return await makeTmdbRequest(`/movie/${movieId}`);
};

export const getMovieCredits = async (movieId) => {
  return await makeTmdbRequest(`/movie/${movieId}/credits`);
};

export const getMovieDetailsAndCredits = async (movieId) => {
  try {
    const [movieDetails, movieCredits] = await Promise.all([
      getMovieDetails(movieId),
      getMovieCredits(movieId)
    ]);
    return { movieDetails, movieCredits };
  } catch (error) {
    console.error(`Error fetching movie details and credits for ${movieId}:`, error);
    throw error;
  }
};

export default tmdbApi;
