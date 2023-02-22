import mongoose  from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';


const Schema = mongoose.Schema;

let hclinicaSchema = new Schema({
    //////////////////Datos Que se cargan con id de paciente/////////////////////
    id_paciente: {
        type: String,
    },
    nro_consulta: {
        type: Number
    },
    
    nombre_completo: {
        type: String,
    },
    
    dni: {
        type: String,
    },

    fecha_nacimiento: {
        type: Date
    },

    direccion: {
        type: String,
    },
    
    localidad: {
        type: String,
    },

    email: {
        type: String
    },

    telefono_1: {
        type: String
    },
    
    telefono_2: {
        type: String
    },

    obra_social: {
        type: String
    },

    id_obra_social: {
        type: String
    },
    ///////////////////////////////////////////////////////////////////////////////////////
    motivo_consulta: {
        type: String
    },
    
    condicion_actual: {
        type: String
    },

    antecedentes_salud : {
        type: String
    },

    comentarios: {
        type: String
    },

    fecha_consulta: {
        type: Date
    },

    timestamp: {
        type: Date,
        default: Date.now
    }
});


pacienteSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser único'
})

export const HClinica = mongoose.model('HClinica', hclinicaSchema);