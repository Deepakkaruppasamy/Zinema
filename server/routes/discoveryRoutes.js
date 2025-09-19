import express from "express";
import { getForYou, getTrending, getFeed } from "../controllers/discoveryController.js";

const discoveryRouter = express.Router();

discoveryRouter.get('/trending', getTrending);
discoveryRouter.get('/for-you', getForYou);
discoveryRouter.get('/feed', getFeed);

export default discoveryRouter;
