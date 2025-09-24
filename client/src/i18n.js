import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        movies: 'Movies',
        theatres: 'Theatres',
        releases: 'Releases',
        view3d: '3D View',
        community: 'Community',
        favorites: 'Favorites',
        login: 'Login'
      },
      hero: {
        exploreMovies: 'Explore Movies'
      }
    }
  },
  hi: {
    translation: {
      nav: {
        home: 'होम',
        movies: 'फ़िल्में',
        theatres: 'थिएटर',
        releases: 'रिलीज़',
        view3d: '3D व्यू',
        community: 'समुदाय',
        favorites: 'पसंदीदा',
        login: 'लॉगिन'
      },
      hero: {
        exploreMovies: 'फिल्में देखें'
      }
    }
  },
  ta: {
    translation: {
      nav: {
        home: 'முகப்பு',
        movies: 'படங்கள்',
        theatres: 'திரையரங்குகள்',
        releases: 'வெளியீடுகள்',
        view3d: '3D காட்சி',
        community: 'சமூகம்',
        favorites: 'பிடித்தவை',
        login: 'உள்நுழை'
      },
      hero: {
        exploreMovies: 'படங்களை பார்க்க'
      }
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })

export default i18n


