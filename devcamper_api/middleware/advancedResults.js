const advancedResults = (Model, populate) => async (req, res, next) => {
  // Adding filters for list fetching
  const reqQuery = { ...req.query };

  let query;
  //Initializing fields to exclude from the search results

  const excludedFields = ["select", "sort", "page", "limit"];

  excludedFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  // Create operators like ($gt|$gte|$in) etc.. for searching
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  query = Model.find(JSON.parse(queryStr));
  // Checking for required fields user wants
  // Data will come like ?select=name,location
  if (req.query.select) {
    //Replacing fields as make it a perfect query for Mongoose
    const fields = req.query.select.split(",").join(" ");

    query = query.select(fields);
  }

  //Checking for sorting options
  // Data will come like ?sort=name or ?sort=-name
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    // If there's no sort then we'll sort it by createdAt
    // in descending order by default
    query = query.sort("-createdAt");
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  const result = await query;

  //Pagination Result

  const pagination = {};

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: result.length,
    pagination,
    data: result,
  };

  next();
};

module.exports = advancedResults;
