const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const _ = require(`lodash`)
const db = require('../../config/db/dbConn')
const verifyAuthToken = require(`../authenticate/verifyAuthToken`)
const apiResponse = require(`../../helper/formatResponse`)
const errorCode = require(`../../config/errorCode/errorCode`)
const genericErrorRes = require(`../../utils/errorResponse`).errorResponse
const Category = db.Category;

// Declare this function globally
function authenticateUser(req) {
  const authToken = req.headers.authtoken
  const verifyOptions = {
    expiresIn: '1h',
    algorithm: ['RS256']
  }

  const publicKey = fs.readFileSync(`${__basedir}/config/keys/public.key`, `utf8`)
  const legit = jwt.verify(authToken, publicKey, verifyOptions)
  return legit;
}

// Returns only active records
module.exports.GetCategories = async (req, res) => {
  try {

    let data = authenticateUser(req);

    return Category.findAll({where: { IsActive: 1}}).then(function(result){
      res.send(apiResponse.successFormat(`success`, '', result));
    }).catch(error => {
      res.status(400).send(apiResponse.successFormat(`error`, error, []))
    });

  } catch (e) {
    console.log('e', e)
    res.status(400).send(apiResponse.successFormat(`error`, e, []))
  }
}

// Returns category by specific id
module.exports.GetCategoryById = async (req, res) => {
  try {

    let data = authenticateUser(req);

    return Category.findByPk(req.body.Category_Id).then(function(result){
      res.send(apiResponse.successFormat(`success`, '', result));
    }).catch(error => {
      res.status(400).send(apiResponse.successFormat(`error`, error, []))
    });
  } catch (e) {
    res.status(400).send(apiResponse.successFormat(`error`, e, []))
  }
}

// Add a category and return updated object
module.exports.AddCategory = async (req, res) => {
  try {
    let data = authenticateUser(req);

    const category = req.body;
    category.CreatedBy = data.userId;

    return Category.create(category).then(result => {
      res.status(200).send(apiResponse.successFormat(`success`, `insert successful`, result))
    }).catch(error => {
      console.log('res', error);
      res.status(400).send(apiResponse.successFormat(`error`, error, []))
    });

  } catch (e) {
    res.status(400).send(apiResponse.successFormat(`error`, e, []))
  }
}

// Update a category and return updated object
module.exports.UpdateCategory = async (req, res) => {
  try {
    let data = authenticateUser(req);

    const category = req.body;
    category.UpdatedBy = data.userId;
    category.UpdatedOn = Date.now();

    return Category.update(category, {
      where: {
        Category_Id: req.body.Category_Id,
        IsActive: 1
      }, returning: true
    }).then((result) => {
      console.log('result', result)
      Category.findByPk(req.body.Category_Id).then(doc => {
        if(!doc) {
          // If a category not available throw an error
          return res.status(400).send(apiResponse.successFormat(`error`, 'Record not found', []))
        }
        res.status(200).send(apiResponse.successFormat(`success`, `update successful`, doc))
      })
    }).catch(function(err){
      console.log(err);
      res.status(400).send(apiResponse.successFormat(`error`, 'Error occurred', []))
    });
  } catch (e) {
    res.status(400).send(apiResponse.successFormat(`error`, e, []))
  }
}

// Delete a category and return updated object
module.exports.DeleteCategory = async (req, res) => {
  try {
    let data = authenticateUser(req);

    const category = req.body;
    category.IsActive = 0;
    category.UpdatedOn = Date.now();

    return Category.update(category, {
      where: {
        Category_Id: req.body.Category_Id
      }
    }).then((result) => {
      Category.findByPk(req.body.Category_Id).then(doc => {
        if(!doc) {
          // If a category not available throw an error
          return res.status(400).send(apiResponse.successFormat(`error`, 'Record not found', []))
        }
        res.status(200).send(apiResponse.successFormat(`success`, `update successful`, doc))
      })
    }).catch(error => {
      console.log('res', error);
      res.status(400).send(apiResponse.successFormat(`error`, error, []))
    });
  } catch (e) {
    res.status(400).send(apiResponse.successFormat(`error`, e, []))
  }
}
