/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api.js";
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
            const {data} = await api.get('/api/admin/is-admin', { headers: { Authorization: `Bearer ${token}` } })
            setIsAdmin(data.isAdmin)

            if(!data.isAdmin && location.pathname.startsWith('/admin')){
                navigate('/')
                toast.error('You are not authorized to access admin dashboard')
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchShows = async ()=>{
        try {
            const { data } = await api.get('/api/show/all')
            if(data.success){
                setShows(data.shows)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchFavoriteMovies = async ()=>{
        try {
            const token = await getToken()
            if (!token) return
            const { data } = await api.get('/api/user/favorites', { headers: { Authorization: `Bearer ${token}` } })

            if(data.success){
                setFavoriteMovies(data.movies)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(()=>{
        fetchShows()
    },[])

    useEffect(()=>{
        if(user){
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