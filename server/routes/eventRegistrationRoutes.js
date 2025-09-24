import express from 'express';
import { createRegistration, listRegistrations, getRegistration, updateRegistration, deleteRegistration } from '../controllers/eventRegistrationController.js';

const router = express.Router();

router.get('/all', listRegistrations);
router.get('/:id', getRegistration);
router.post('/', createRegistration);
router.put('/:id', updateRegistration);
router.delete('/:id', deleteRegistration);

export default router;


