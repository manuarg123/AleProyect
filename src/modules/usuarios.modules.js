import mongoose  from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const roles = {
    values: ["ADMIN", "USER"],
    message: '{VALUE} no es un rol válido'
}

const Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario'],
    },

    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario'],
    },

    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    
    rol: {
        type: String,
        default: 'USER',
        required: [true],
        enum: roles
    },
});

//Elimina la key password del objeto que retorna al momento de crear un usuario
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser único'
})

export const Usuario = mongoose.model('Usuario', usuarioSchema);