import React from 'react';
import HeroSection from '../components/HeroSection';
import TrendingSection from '../components/TrendingSection';
import UpcomingSection from '../components/UpcomingSection';
import TopRatedSection from '../components/TopRatedSection';
import Recommendations from '../components/Recommendation';

const Home = () => {
  return (
    <main>
      <HeroSection />
      <TrendingSection />
      <Recommendations />
      <TopRatedSection />
      <UpcomingSection />
    </main>
  );
};

export default Home;
