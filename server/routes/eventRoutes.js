import express from 'express';
import { createEvent, listEvents, getEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';

const eventRouter = express.Router();

eventRouter.get('/', (req, res) => {
  res.json({
    message: 'Events API is live',
    endpoints: [
      'GET /all',
      'GET /:id',
      'POST /',
      'PUT /:id',
      'DELETE /:id'
    ]
  })
});

eventRouter.get('/all', listEvents);
eventRouter.get('/:id', getEvent);
eventRouter.post('/', createEvent);
eventRouter.put('/:id', updateEvent);
eventRouter.delete('/:id', deleteEvent);

export default eventRouter;


