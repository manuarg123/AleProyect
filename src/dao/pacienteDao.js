import "./config.js";
import { Paciente } from "../modules/pacientes.modules.js";

export class PacienteDao {
    async crearPaciente(object) {
        try {
            return await Paciente.create(object)
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}