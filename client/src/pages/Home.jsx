import React from 'react'
import HeroSection from '../components/HeroSection'
import RecommendationsSection from '../components/RecommendationsSection'
import UpcomingReleasesSection from '../components/UpcomingReleasesSection'
import TopTrendingSection from '../components/TopTrendingSection'
import PersonalizedCarousel from '../components/PersonalizedCarousel'
import MyCollectionSection from '../components/MyCollectionSection'
import TestimonialsSection from '../components/TestimonialsSection'
import NewsSection from '../components/NewsSection'
import LocationShowtimesSection from '../components/LocationShowtimesSection'
import QuizSection from '../components/QuizSection'
import FeaturedTrailerSection from '../components/FeaturedTrailerSection'
import SocialMediaSection from '../components/SocialMediaSection'
import AppPromotionSection from '../components/AppPromotionSection'
import FeaturedSection from '../components/FeaturedSection'
import TrailersSection from '../components/TrailersSection'
import FeedbackPrompt from '../components/FeedbackPrompt'

const Home = () => {
  return (
    <>
      <HeroSection />
      <MyCollectionSection />
      <RecommendationsSection />
      <PersonalizedCarousel />
      <UpcomingReleasesSection />
      <TopTrendingSection />
      <TestimonialsSection />
      <NewsSection />
      <LocationShowtimesSection />
      <QuizSection />
      <FeaturedTrailerSection />
      <SocialMediaSection />
      <AppPromotionSection />
      <FeaturedSection />
      <TrailersSection />
      <FeedbackPrompt />
    </>
  )
}

export default Home
