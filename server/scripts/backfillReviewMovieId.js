import 'dotenv/config';
import connectDB from '../configs/db.js';
import Review from '../models/Review.js';

(async () => {
  try {
    await connectDB();
    console.log('Connected. Backfilling movieId for reviews...');

    const res = await Review.updateMany(
      { $or: [ { movieId: { $exists: false } }, { movieId: null }, { movieId: '' } ] },
      [ { $set: { movieId: '$movie' } } ]
    );

    console.log('Matched:', res.matchedCount ?? res.n);
    console.log('Modified:', res.modifiedCount ?? res.nModified);
    console.log('Backfill complete.');
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
})();
