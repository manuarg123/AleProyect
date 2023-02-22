import mongoose from 'mongoose';
import dotenv from "dotenv";

export class Connection {
    async connectMongoDB () {
        dotenv.config();
        return mongoose.connect(process.env.MONGO_URI, {}, (err) => {
            err 
                ? console.log("Error al conectarse a la base MongoDB")
                : console.log("Conexión a base MongoDB exitosa")
        })
    }
}