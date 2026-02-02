import mongo from './mongo';

export const fetchRecommendations = async (token) => {
    try {
      console.log('Fetching recommendations...');
      const response = await mongo.get('/user/recommendations', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
  
      console.log('Recommendations response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error.response?.data || error.message);
      throw error;
    }
  }

