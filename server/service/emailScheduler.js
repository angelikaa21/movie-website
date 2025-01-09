import cron from 'node-cron';
import UserModel from '../DAO/userDAO';
import userManager from '../business/user.manager';



const scheduleDailyEmails = () => {
    cron.schedule('* * * * *', async () => {
      console.log('Running email task every minute...');
  
      try {
        const users = await UserModel.model.find({ active: true });
        console.log('Active users:', users.length);
  
        for (const user of users) {
          try {
            await userManager.sendRecommendationEmail(user);
            console.log(`Email sent to ${user.email}`);
          } catch (error) {
            console.error(`Error sending email to ${user.email}:`, error);
          }
        }
      } catch (error) {
        console.error('Error running daily email task:', error);
      }
    });
  };

export default scheduleDailyEmails;