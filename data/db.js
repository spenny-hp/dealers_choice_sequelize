// bring in restaurant data from JSON
const data = require("./nyc_restaurants.json");
const boroughs = {
  1: 'Brooklyn',
  2: 'Manhattan',
  3: 'Queens',
  4: 'Bronx',
  5: 'Staten Island',
};

// Sequelize & data types
const Sequelize = require("sequelize");
const { STRING, INTEGER, DATE, BOOLEAN } = Sequelize;

// Database connection parameters (to run create db in postgres called 'nyc_restaurants' in psql)
const rdbm = "postgres";
const host = "localhost";
const schema = "nyc_restaurants";

// Create database connection
const conn = new Sequelize(
  process.env.DATABASE_URL || `${rdbm}://${host}/${schema}`
);

// Define tables without foreign keys
const Borough = conn.define(
  "borough",
  {
    id: {
      type: INTEGER,
      primaryKey: true,
    },
    name: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  { underscored: true }
);

const Restaurant = conn.define(
  "restaurant",
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    address: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    borough_id: {
      type: INTEGER,
    },
    sidewalk_seating: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    roadway_seating: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    liquor_license: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  { underscored: true }
);

// syncing connection and seeding database
async function syncAndSeed() {
  await conn.sync({
    force: true,
  });
  await Promise.all(
    Object.keys(boroughs).map((id) => {
      Borough.create({ 
        id: id, 
        name: boroughs[id],
      });
    })
  );
  await Promise.all(
    data.map((restaurant) => {
      let address = '';
      if (restaurant.bulding_number !== 'undefined') {
        address = restaurant.bulding_number + ' ' + restaurant.street.split(' ').filter(w => w !== '').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      } else {
        adddress = restaurant.street.split(' ').filter(w => w !== '').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
      Restaurant.create({
        name: restaurant.restaurant_name.split(' ').filter(w => w !== '').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
        address: address,
        borough_id:  Object.keys(boroughs).find(key => boroughs[key] === restaurant.borough),
        sidewalk_seating: restaurant.approved_for_sidewalk_seating,
        roadway_seating: restaurant.approved_for_roadway_seating,
        liquor_license: restaurant.qualify_alcohol,
      });
    })
  );
}

Restaurant.belongsTo(Borough, {foreignKey: 'borough_id'});
Borough.hasMany(Restaurant, {foreignKey: 'borough_id'});

module.exports = {
  syncAndSeed,
  boroughs,
  models: {
    Restaurant,
    Borough,
  },
};
