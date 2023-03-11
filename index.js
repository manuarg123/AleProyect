import express from "express";
import { Connection } from "./config.js";
import dotenv from "dotenv";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import mongoStore from "connect-mongo";
import userRouter from "./src/routes/user.js";
import pacienteRouter from "./src/routes/paciente.js";
import methodOverride from "method-override";
import flash from "connect-flash";
import hbs from "handlebars";
import moment from "moment";


//Registro un helper para dar formato al tiempo dentro de handlebars
hbs.registerHelper("formatTime", function (date, format) {
  var mmnt = moment(date);
  return mmnt.format(format);
});

hbs.registerHelper("setVar", function (varName, varValue, options) {
  options.data.root[varName] = varValue;
});

hbs.registerHelper("eq", function () {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  return args.every(function (expression) {
    return args[0] === expression;
  });
});

hbs.registerHelper("when", (operand_1, operator, operand_2, options) => {
  let operators = {
    //  {{#when <operand1> 'eq' <operand2>}}
    eq: (l, r) => l == r, //  {{/when}}
    noteq: (l, r) => l != r,
    gt: (l, r) => +l > +r, // {{#when var1 'eq' var2}}
    gteq: (l, r) => +l > +r || l == r, //               eq
    lt: (l, r) => +l < +r, // {{else when var1 'gt' var2}}
    lteq: (l, r) => +l < +r || l == r, //               gt
    or: (l, r) => l || r, // {{else}}
    and: (l, r) => l && r, //               lt
    "%": (l, r) => l % r === 0, // {{/when}}
  };
  let result = operators[operator](operand_1, operand_2);
  if (result) return options.fn(this);
  return options.inverse(this);
});

hbs.registerHelper("for", function (from, to, incr, block) {
  var accum = "";
  for (var i = from; i <= to; i += incr) accum += block.fn(i);
  return accum;
});

const app = express();
const connection = new Connection();
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Conecto a la Base de datos y levanto la app
connection.connectMongoDB();

const server = app.listen(process.env.PORT, () => {
  console.log(`Servidor conectado correctamente al puerto ${process.env.PORT}`);
});
server.on("error", (err) => console.log(err));

//Habilito carpeta para archivos estáticos como estilos
app.use(express.static("public"));

app.set("views", "./src/views");
app.set("view engine", "hbs");

//Define el motor de plantillas a utilizar
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",

    partialsDir: __dirname + "/src/views/partials",
  })
);

//Habilito la sesion para procesar el logueo
app.use(
  session({
    store: mongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      options: {
        userNewParser: true,
        useUnifiedTopology: true,
      },
    }),
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }, //10 min.
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");

  next();
});

app.use("/api/usuario", userRouter);
app.use("/api/paciente", pacienteRouter);

app.get("/", (req, res) => {
  res.render("templates/home", {});
});
