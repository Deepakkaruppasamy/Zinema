import express from "express";
import { getForYou, getTrending, getFeed, getSimilar, getNewReleases, getAIRecommendations } from "../controllers/discoveryController.js";

const discoveryRouter = express.Router();

discoveryRouter.get('/trending', getTrending);
discoveryRouter.get('/for-you', getForYou);
discoveryRouter.get('/feed', getFeed);
discoveryRouter.get('/similar', getSimilar);
discoveryRouter.get('/new-releases', getNewReleases);
discoveryRouter.get('/ai-recommendations', getAIRecommendations);

export default discoveryRouter;
