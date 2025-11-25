import express from 'express';
import {
  createBed,
  getAllBeds,
  getBedById,
  updateBed,
  deleteBed
} from '../controllers/bedController.js';

const router = express.Router();

// Rotas para gestão de leitos
router.post('/', createBed);           // Criar leito
router.get('/', getAllBeds);           // Buscar todos os leitos
router.get('/:id', getBedById);        // Buscar leito por ID
router.put('/:id', updateBed);         // Atualizar leito
router.delete('/:id', deleteBed);      // Deletar leito

export default router;