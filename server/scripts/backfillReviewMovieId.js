import 'dotenv/config';
import connectDB from '../configs/db.js';
import Review from '../models/Review.js';

(async () => {
  try {
    await connectDB();
    console.log('Connected. Backfilling movieId for reviews...');

    // Set movieId = movie where movieId is missing/null/empty
    const res = await Review.updateMany(
      { $or: [ { movieId: { $exists: false } }, { movieId: null }, { movieId: '' } ] },
      [ { $set: { movieId: '$movie' } } ] // aggregation pipeline update (MongoDB 4.2+)
    );

    console.log('Matched:', res.matchedCount ?? res.n);
    console.log('Modified:', res.modifiedCount ?? res.nModified);
    console.log('Backfill complete.');
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exitCode = 1;
  } finally {
    // Exit regardless; mongoose connection will close with process end
    process.exit();
  }
})();
