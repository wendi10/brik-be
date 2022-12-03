const express = require("express");
const connection = require("./database");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(cors());

app.get("/products", (req, res) => {
  connection.query(
    `SELECT * FROM products, (SELECT count(*) AS total_data FROM products) AS c ${setFilterProducts(
      req.query
    )}`,
    (err, rows) => {
      console.log(rows, "aaa");
      const totalData = rows[0]?.total_data;

      if (err) {
        console.log("ccc");
        console.log(err);
        return;
      }

      if (rows.length <= 0) {
        res.status(200);
        res.json({
          data: null,
        });
        return;
      }

      res.status(200);
      res.json({
        data: rows,
        pagination: {
          total_data: totalData,
          total_page: Math.ceil(totalData / req.query.limit),
        },
      });
    }
  );
});

app.get("/products/detail", (req, res) => {
  connection.query(
    `SELECT * FROM products WHERE id = ${req.query.id}`,
    (err, rows) => {
      if (err) {
        console.log(err);
        return;
      }

      if (rows.length <= 0) {
        res.status(200);
        res.json({
          data: "null",
        });
        return;
      }

      res.status(200);
      res.json(rows[0]);
    }
  );
});

app.post("/products", (req, res) => {
  const {
    categoryId,
    categoryName,
    sku,
    name,
    weight,
    width,
    length,
    height,
    image,
    price,
    description,
  } = req.body;

  console.log(req.body);

  connection.query(
    `INSERT INTO products (categoryId, categoryName, sku, name, description, weight, width, length, height, image, price) VALUES (${categoryId}, '${categoryName}', '${sku}', '${name}', '${description}', ${weight}, ${width}, ${length}, ${height}, '${image}', ${price})`,
    (err, rows) => {
      if (err) {
        console.log(err);
        return;
      }

      res.status(200);
      res.json({
        message: "Success Create New Product",
      });
    }
  );
});

function getOffset(currentPage = 1, listPerPage) {
  return (currentPage - 1) * [listPerPage];
}

function setFilterProducts(filter) {
  const { name, categoryName, page, limit } = filter;
  let params = [];
  let filterPagination = "";

  if (name) {
    params.push(`name LIKE '%${name}%'`);
    console.log(params, "aaa");
  }

  if (categoryName) {
    params.push(`categoryName LIKE '%${categoryName}%'`);
  }

  if (page && limit) {
    filterPagination = `LIMIT ${getOffset(page, limit)},${limit}`;
  }

  return params?.length > 0
    ? "WHERE " +
        params?.toString().replace(",", " AND ") +
        " " +
        filterPagination
    : "" + filterPagination;
}

app.listen(3001, () => {
  console.log("App listening on port 3001");
  connection.connect((err) => {
    if (err) {
      console.log(err);
      return;
    }

    console.log("Database connected!");
  });
});
