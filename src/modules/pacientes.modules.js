import mongoose  from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';


const Schema = mongoose.Schema;

let pacienteSchema = new Schema({
    nombre: {
        type: String,
    },

    apellido: {
        type: String,
    },
    
    dni: {
        type: String,
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

    timestamp: {
        type: Date,
        default: Date.now
    },

    comentarios: [{ type: Schema.Types.ObjectId, ref: 'Comentario' }]
});

let comentarioSchema = new Schema({
    comentario: {type: String},
    fecha:{type: Date,
           default: Date.now}
});

pacienteSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser único'
})

export const Paciente = mongoose.model('Paciente', pacienteSchema);
export const Comentario = mongoose.model('Comentario', comentarioSchema);