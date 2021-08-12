const db = require("./data/db");
const express = require("express");
const path = require('path');
const routes = require("./routes/restaurants");
const app = express();

app.use(routes);
app.use(express.static(path.join(__dirname, './public')))

const init = async () => {
  await db.syncAndSeed();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
