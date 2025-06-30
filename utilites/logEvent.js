
import Log from '../models/Log.js';
import connectDB from '../config/db.js';
export const logEvent = async ({ user = null, message, level = 'info', meta = null }) => {
  try {
    await Log.create({ user, message, level, meta });
  } catch (err) {
    console.log('Failed to log event:', err);
  }
};