import mongoose from "mongoose";

const trendingConfigSchema = new mongoose.Schema({
  _id: { type: String, default: "curated" },
  // Curated by movies (legacy) and/or by specific shows (preferred)
  movieIds: { type: [String], default: [] },
  showIds: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

const TrendingConfig = mongoose.model("TrendingConfig", trendingConfigSchema);

export default TrendingConfig;
