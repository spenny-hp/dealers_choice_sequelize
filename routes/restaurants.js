const express = require('express');
const router = express.Router()
const db = require("../data/db");

router.get("/", (req, res, next) => {
    res.redirect("/restaurants");
  });
  
  router.get("/restaurants", async (req, res, next) => {
    const restaurants = await db.models.Restaurant.findAll();
    const countByBorough = restaurants.reduce((acc, val) => {
      const boroughs = db.boroughs;
      const borough = boroughs[val.borough_id];
      acc[borough] = acc[borough] || 0;
      acc[borough]++;
      return acc;
    }, {});

    const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          <link rel='stylesheet' href='styles.css'>
      </head>
      <body>
        <h1>
            Restaurants in NYC by Borough
        </h1>
          <ul>
          ${Object.entries(countByBorough)
            .map(
              (bor) => `
          <li>
          <a href='/restaurants/${bor[0]}'> 
              ${bor[0]} (${bor[1]})
          </a>
          </li>`
            )
            .join("")}
          </ul>
      </body>
      </html>`;
    try {
      res.send(html);
    } catch (err) {
      next(err);
    }
  });
  
  router.get("/restaurants/:borough", async (req, res, next) => {
    const pageId = req.params.borough;
    const borough = await db.models.Borough.findOne({where: {name: pageId}});
    const restaurants = await db.models.Restaurant.findAll({
      where: { borough_id: borough.id },
    });
    
    const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
      </head>
      <body>
      <button><a href='../'>BACK TO BOROUGHS</a></button>
      <h1> 
        Restaurants in ${borough.name}
      </h1>
          ${restaurants
            .map(
              (restaurant) =>
                `<div>
                  <pre>
                    ${JSON.stringify(restaurant, null, 2)}
                  </pre>
                </div>`
            )
            .join("")}
      </body>
      </html>`;
    try {
      res.send(html);
    } catch (err) {
      next(err);
    }
  });

  module.exports = router;