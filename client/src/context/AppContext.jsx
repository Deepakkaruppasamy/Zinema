/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { retryApi, safeApiCall } from "../lib/retryApi.js";
import { getErrorMessage } from "../lib/errorHandler.js";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// API base URL is configured in lib/api.js

export const AppContext = createContext()

export const AppProvider = ({ children })=>{

    const [isAdmin, setIsAdmin] = useState(false)
    const [shows, setShows] = useState([])
    const [favoriteMovies, setFavoriteMovies] = useState([])

    // Route TMDB images through our proxy to avoid CORS and allow canvas usage
    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || '/api/tmdb-image?path=';

    const {user} = useUser()
    const {getToken} = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const fetchIsAdmin = async ()=>{
        try {
            const token = await getToken()
            if (!token) return
            
            const result = await safeApiCall(
                () => retryApi.get('/api/admin/is-admin', { headers: { Authorization: `Bearer ${token}` } }),
                { isAdmin: false }
            )
            
            if (result.error) {
                console.warn('Failed to fetch admin status:', result.error)
                return
            }
            
            setIsAdmin(result.data.isAdmin)

            if(!result.data.isAdmin && location.pathname.startsWith('/admin')){
                navigate('/')
                toast.error('You are not authorized to access admin dashboard')
            }
        } catch (error) {
            console.error('Admin check failed:', error)
        }
    }

    const fetchShows = async ()=>{
        try {
            const result = await safeApiCall(
                () => retryApi.get('/api/show/all'),
                { success: false, shows: [], message: 'Failed to load shows' }
            )
            
            if (result.error) {
                console.warn('Failed to fetch shows:', result.error)
                toast.error('Failed to load movies. Please check your connection.')
                return
            }
            
            if(result.data.success){
                setShows(result.data.shows)
            }else{
                toast.error(result.data.message)
            }
        } catch (error) {
            console.error('Shows fetch failed:', error)
            toast.error('Failed to load movies. Please try again later.')
        }
    }

    const fetchFavoriteMovies = async ()=>{
        try {
            const token = await getToken()
            if (!token) return
            
            const result = await safeApiCall(
                () => retryApi.get('/api/user/favorites', { headers: { Authorization: `Bearer ${token}` } }),
                { success: false, movies: [], message: 'Failed to load favorites' }
            )
            
            if (result.error) {
                console.warn('Failed to fetch favorites:', result.error)
                return
            }

            if(result.data.success){
                setFavoriteMovies(result.data.movies)
            }else{
                toast.error(result.data.message)
            }
        } catch (error) {
            console.error('Favorites fetch failed:', error)
        }
    }

    useEffect(()=>{
        fetchShows()
    },[])

    useEffect(()=>{
        if(user){
            // Record login timestamp for this session if not already set
            if (!sessionStorage.getItem('loginAt')) {
                try { sessionStorage.setItem('loginAt', String(Date.now())) } catch {}
            }
            fetchIsAdmin()
            fetchFavoriteMovies()
        }
    },[user])

    const value = {
        api,
        axios: api, // Alias for backward compatibility
        fetchIsAdmin,
        user, getToken, navigate, isAdmin, shows, 
        favoriteMovies, fetchFavoriteMovies, image_base_url
    }

    return (
        <AppContext.Provider value={value}>
            { children }
        </AppContext.Provider>
    )
}

export const useAppContext = ()=> useContext(AppContext)