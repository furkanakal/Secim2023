import { http, params } from "@ampt/sdk";
import express, { Router } from "express";
import env from "dotenv";
import mysql from "mysql2";
import morgan from "morgan";
import swaggerJSDoc from "swagger-jsdoc"; // TODO: Add Swagger UI
env.config();

const port = process.env.PORT || 3000;
const domain = process.env.DOMAIN || "localhost";
const app = express();

// Create connection to database
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const databaseName = process.env.DATABASE_NAME;
const databaseHost = process.env.DATABASE_HOST;
const ssl = { rejectUnauthorized: true };
const DATABASE_URL = `mysql://${username}:${password}@${databaseHost}/${databaseName}?ssl=${JSON.stringify(
  ssl
)}`;
const connection = mysql.createConnection(DATABASE_URL);

connection.connect();

const auth = (req, res, next) => {
  const { headers } = req;

  if (!headers["authorization"]) {
    return res.status(401).send("Unauthorized");
  }

  req.context = {
    userId: "123",
  };

  next();
};

const privateApi = Router();
privateApi.use(auth);
const publicApi = Router();
const rootApi = Router();

publicApi.get("/", (req, res) => {
  res.redirect("../");
});

publicApi.get("/partiler", (req, res) => {
  let parti = req.query.name;

  let data_query = "SELECT * FROM partiler";
  const params = [];

  if (parti) {
    data_query += " WHERE party_name LIKE ?";
    params.push(`%${parti}%`);
  }

  connection.query(data_query, params, function (err, rows, fields) {
    if (err) throw err;

    res.send(rows);
  });
});

publicApi.get("/partiler/:parti_id", (req, res) => {
  let parti_id = req.params.parti_id;
  parti_id = parseInt(parti_id);

  const params = [parti_id];

  connection.query(
    `SELECT * FROM partiler WHERE partiler.id = ?`,
    params,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

publicApi.get("/sehirler", (req, res) => {
  let sehir = req.query.name;

  let data_query = "SELECT * FROM sehirler";
  const params = [];

  if (sehir) {
    data_query += " WHERE city_name LIKE ?";
    params.push(`%${sehir}%`);
  }

  connection.query(data_query, params, function (err, rows, fields) {
    if (err) throw err;

    res.send(rows);
  });
});

publicApi.get("/sehirler/:sehir_id", (req, res) => {
  let sehir_id = req.params.sehir_id;
  sehir_id = parseInt(sehir_id);

  const params = [sehir_id];

  connection.query(
    `SELECT * FROM sehirler WHERE sehirler.id = ?`,
    params,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

publicApi.get("/secim/:secim_id", (req, res) => {
  let secim_id = req.params.secim_id;
  secim_id = parseInt(secim_id);

  const params = [secim_id];

  connection.query(
    `SELECT * FROM adaylar WHERE adaylar.election_id = ?`,
    params,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

publicApi.get("/secim/:secim_id/parti/:parti_id", (req, res) => {
  let secim_id = req.params.secim_id;
  let parti_id = req.params.parti_id;

  secim_id = parseInt(secim_id);
  parti_id = parseInt(parti_id);

  const params = [secim_id, parti_id];

  connection.query(
    `SELECT * FROM adaylar WHERE adaylar.election_id = ? AND adaylar.party_id = ?`,
    params,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

publicApi.get(
  "/secim/:secim_id/parti/:parti_id/sehir/:sehir_id",
  (req, res) => {
    let secim_id = req.params.secim_id;
    let parti_id = req.params.parti_id;
    let sehir_id = req.params.sehir_id;

    secim_id = parseInt(secim_id);
    parti_id = parseInt(parti_id);
    sehir_id = parseInt(sehir_id);
    let order_filter = "candidate_id";

    const params = [secim_id, parti_id, sehir_id, order_filter];

    connection.query(
      `SELECT * FROM adaylar WHERE adaylar.election_id = ? AND adaylar.party_id = ? AND adaylar.area_id = ? ORDER BY ?`,
      params,
      function (err, rows, fields) {
        if (err) throw err;

        res.send(rows);
      }
    );
  }
);

// CITY
publicApi.get("/secim/:secim_id/sehir/:sehir_id", (req, res) => {
  let secim_id = req.params.secim_id;
  let sehir_id = req.params.sehir_id;

  secim_id = parseInt(secim_id);
  sehir_id = parseInt(sehir_id);

  const params = [secim_id, sehir_id];

  connection.query(
    `SELECT * FROM adaylar WHERE adaylar.election_id = ? AND adaylar.area_id = ?`,
    params,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

publicApi.get(
  "/secim/:secim_id/sehir/:sehir_id/parti/:parti_id",
  (req, res) => {
    let secim_id = req.params.secim_id;
    let sehir_id = req.params.sehir_id;
    let parti_id = req.params.parti_id;

    secim_id = parseInt(secim_id);
    sehir_id = parseInt(sehir_id);
    parti_id = parseInt(parti_id);
    let order_filter = "candidate_id";
    const params = [secim_id, sehir_id, parti_id, order_filter];

    connection.query(
      `SELECT * FROM adaylar WHERE adaylar.election_id = ? AND adaylar.area_id = ? AND adaylar.party_id = ? ORDER BY ?`,
      params,
      function (err, rows, fields) {
        if (err) throw err;

        res.send(rows);
      }
    );
  }
);

publicApi.get("/secim/:secim_id/sehir", (req, res) => {
  let secim_id = req.params.secim_id;
  let sehir = req.query.name;

  secim_id = parseInt(secim_id);

  const params = [secim_id, sehir];

  connection.query(
    `SELECT * FROM adaylar WHERE adaylar.election_id = ? AND adaylar.area_name LIKE ?`,
    params,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

// PARTY

publicApi.get("/secim/:secim_id/parti/:parti_id", (req, res) => {
  let secim_id = req.params.secim_id;
  let parti_id = req.params.parti_id;

  secim_id = parseInt(secim_id);
  parti_id = parseInt(parti_id);

  const params = [secim_id, parti_id];

  connection.query(
    `SELECT * FROM adaylar WHERE adaylar.election_id = ? AND adaylar.party_id = ?`,
    params,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

// NAME AND SURNAME
publicApi.get("/secim/:secim_id/isim/:isim", (req, res) => {
  let secim_id = req.params.secim_id;
  let isim = req.params.isim;

  secim_id = parseInt(secim_id);
  const params = [secim_id, isim];

  connection.query(
    `SELECT * FROM adaylar WHERE adaylar.election_id = ? AND adaylar.name LIKE ?`,
    params,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

publicApi.get("/secim/:secim_id/soyisim/:soyisim", (req, res) => {
  let secim_id = req.params.secim_id;
  let soyisim = req.params.soyisim;

  secim_id = parseInt(secim_id);

  const params = [secim_id, soyisim];

  connection.query(
    `SELECT * FROM adaylar WHERE adaylar.election_id = ? AND adaylar.surname LIKE ?`,
    params,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

publicApi.get("/secim/:secim_id/isim/:isim/soyisim/:soyisim", (req, res) => {
  let secim_id = req.params.secim_id;
  let isim = req.params.isim;
  let soyisim = req.params.soyisim;

  secim_id = parseInt(secim_id);

  const params = [secim_id, isim, soyisim];

  connection.query(
    `SELECT * FROM adaylar WHERE adaylar.election_id = ? AND adaylar.name LIKE ? AND adaylar.surname LIKE ?`,
    params,
    function (err, rows, fields) {
      if (err) throw err;

      res.send(rows);
    }
  );
});

app.use(morgan("tiny"));
app.use("/", rootApi);
app.use("/api", publicApi);
app.use("/admin", privateApi);

http.useNodeHandler(app);
