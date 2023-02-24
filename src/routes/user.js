import express from "express";
const router = express.Router();
import session from "express-session";
import bcrypt from "bcrypt";
import { Usuario } from "../modules/usuarios.modules.js";
import { Paciente } from "../modules/pacientes.modules.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import moment from "moment";

//Obtiene la ruta login. Si estaba logueado te redirige al index y sino al login para ingresar usuario/contraseña
router.get("/login", async (req, res) => {
  if (req.session.login) {
    res.redirect("/api/usuario/login");
  } else {
    res.render("templates/login", { status: false });
  }
});

//Obtiene la ruta para registrarse.
router.get("/register", async (req, res) => {
  res.render("templates/register", { status: false });
});

router.post("/register", async (req, res) => {
  let body = req.body;

  let { nombre, email, password, rol } = body;

  let usuario = new Usuario({
    nombre,
    email,
    password: bcrypt.hashSync(password, 10),
    rol,
  });

  usuario.save();

  res.render("templates/finishregister");
});

/**
 * Cuando ingreso un usuario y contraseña los obtiene del body, para validarlos con los que tengo cargados en .env
 */
router.post("/login", async (req, res) => {
  let body = req.body;

  Usuario.findOne({ email: body.email }, (erro, usuarioDB) => {
    if (erro) {
      return res.status(500).json({
        ok: false,
        err: erro,
      });
    }

    //Verifica que exista un usuario con el mail escrito en el form
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario o contraseña incorrectos",
        },
      });
    }

    //Valida que la contraseña escrita por el usuario sea la almacenada en la base
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario o contraseña incorrectos",
        },
      });
    }

    dotenv.config();
    //Genera el token de autenticación con JWT
    let token = jwt.sign(
      {
        usuario: usuarioDB,
      },
      process.env.SEED_AUTENTICACION,
      {
        expiresIn: "24h",
      }
    );

    req.session.login = true;
    res.redirect("/api/usuario");
  });
});

//Obtiene la página inicial apenas entro al localhost, validada para habilitar inicio sesion
router.get("/", async (req, res) => {
  Paciente.find((err, listar_personas) => {
    if (err) {
      res.json({
        resultado: false,
        msj: "No se pudieron listar los pacientes",
        err,
      });
    } else {
      res.render("templates/home", {
        status: req.session.login,
        pacientes: listar_personas,
      });
    }
  });
});

//Cierra la sesion eliminando los datos y redifgiendo a página de logout
router.get("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.json(err);
    } else {
      res.render("templates/logout", { status: false });
    }
  });
});

router.post("/paciente", async (req, res) => {
  let body = req.body;

  let {
    nombre,
    apellido,
    dni,
    fecha_nacimiento,
    direccion,
    localidad,
    email,
    telefono_1,
    telefono_2,
    obra_social,
    id_obra_social,
  } = body;

  let paciente = new Paciente({
    nombre,
    apellido,
    dni,
    fecha_nacimiento,
    direccion,
    localidad,
    email,
    telefono_1,
    telefono_2,
    obra_social,
    id_obra_social,
  });

  paciente.save();
  req.flash("success_msg", "Se agrego el paciente exitosamente");
  Paciente.find((err, listar_personas) => {
    if (err) {
      res.json({
        resultado: false,
        msj: "No se pudieron listar los pacientes",
        err,
      });
    } else {
      //Redirecciono para que cambie url y luego renderizo el home con los datos
      req.session.login = true;
      res.redirect("/api/usuario");
      res.render("templates/home", {
        status: true,
        pacientes: listar_personas,
      });
    }
  });
});

router.get("/form_paciente", (req, res) => {
  if (req.session.login) {
    res.render("templates/form_paciente", { status: req.session.login });
  } else {
    res.render("templates/login", { status: false });
  }
});

router.get("/pacientes/editar/:id", async (req, res) => {
  if (req.session.login) {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      let paciente = await Paciente.findById(req.params.id);
    
      let nacimiento = moment(paciente.fecha_nacimiento).format('YYYY-MM-DD');

      res.render("templates/editar_paciente", {
        status: req.session.login,
        nacimiento : nacimiento,
        paciente
      });
    }
  } else {
    res.render("templates/login", { status: false });
  }
});

router.put("/pacientes/editar/:id", async (req, res) => {
  if (req.session.login) {
    let body = req.body;

    let {
      nombre,
      apellido,
      dni,
      fecha_nacimiento,
      direccion,
      localidad,
      email,
      telefono_1,
      telefono_2,
      obra_social,
      id_obra_social,
    } = body;

    await Paciente.findByIdAndUpdate(req.params.id, {
      nombre,
      apellido,
      dni,
      fecha_nacimiento,
      direccion,
      localidad,
      email,
      telefono_1,
      telefono_2,
      obra_social,
      id_obra_social,
    });
    Paciente.find((err, listar_personas) => {
      if (err) {
        res.json({
          resultado: false,
          msj: "No se pudieron listar los pacientes",
          err,
        });
      } else {
        //Redirecciono para que cambie url y luego renderizo el home con los datos
        req.session.login = true;
        res.redirect("/api/usuario");
        res.render("templates/home", {
          status: true,
          pacientes: listar_personas,
        });
      }
    });
  } else {
    res.render("templates/login", { status: false });
  }
});

router.delete("/pacientes/eliminar/:id", async (req, res) => {
  await Paciente.findByIdAndDelete(req.params.id);
  req.flash("error_msg", "Paciente eliminado exitosamente");
  Paciente.find((err, listar_personas) => {
    if (err) {
      res.json({
        resultado: false,
        msj: "No se pudieron listar los pacientes",
        err,
      });
    } else {
      //Redirecciono para que cambie url y luego renderizo el home con los datos
      req.session.login = true;
      res.redirect("/api/usuario");
      res.render("templates/home", {
        status: true,
        pacientes: listar_personas,
      });
    }
  });
});

router.get("/historias_clinicas/:id", (req, res) => {
  if (req.session.login) {
    res.render("templates/historias_clinicas", {
      status: req.session.login,
      id: req.params.id,
    });
  } else {
    res.render("templates/login", { status: false });
  }
});

router.get("/form_historias_clinicas/:paciente_id", (req, res) => {
  if (req.session.login) {
    res.render("templates/form_historias_clinicas", {
      status: req.session.login,
      id: req.params.paciente_id,
    });
  } else {
    res.render("templates/login", { status: false });
  }
});
export default router;
