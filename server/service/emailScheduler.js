import cron from 'node-cron';
import UserModel from '../DAO/userDAO';
import userManager from '../business/user.manager';



const scheduleDailyEmails = () => {
  cron.schedule('0 18 * * 6', async () => {
    try {
      const users = await UserModel.model.find({ active: true });
      for (const user of users) {
        try {
          await userManager.sendRecommendationEmail(user);
        } catch (error) {
        }
      }
    } catch (error) {
    }
  });
};

export default scheduleDailyEmails;