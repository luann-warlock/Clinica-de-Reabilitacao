import express from 'express';
import { 
  login, 
  register, 
  protect,
  deleteUserByEmail,
  getAllUsers 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/users', getAllUsers); // 👈 NOVA ROTA
router.delete('/users/email/:email', deleteUserByEmail); // 👈 NOVA ROTA

export default router;