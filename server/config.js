const config = {
    port: process.env.PORT || 5000,
    databaseUrl: process.env.MONGO_URI || 'mongodb+srv://angelika:Password123@moviedatabase.j9jjd.mongodb.net/?retryWrites=true&w=majority&appName=movieDatabase',
    JwtSecret: process.env.JWT_SECRET || 'secret-password'
  };
  
  export default config;

