import express from "express";
const router = express.Router();
import {Paciente} from '../modules/pacientes.modules.js';

router.get('/form'), async(req, res) => {
    res.render('templates/form_paciente');
}

export default router;