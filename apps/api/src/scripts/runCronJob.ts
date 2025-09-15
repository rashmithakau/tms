import { CronJobService } from '../services/cronJob.service';

async function runCronJob() {
  console.log('Testing timesheet reminder cron job...');
  
  const cronService = new CronJobService();

  const testCheck = cronService['checkMissingTimesheets'].bind(cronService);
  
  try {
    await testCheck();
    console.log('Cron job completed successfully!');
  } catch (error) {
    console.error('Cron job failed:', error);
  }
}

runCronJob();
