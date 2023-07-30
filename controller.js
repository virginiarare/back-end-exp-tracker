const model = require('./models/model');

//  post: http://localhost:5000/api/categories
// Assuming you have imported the necessary model and named it "model"
async function create_Categories(req, res) {
    try {
      const Create = new model.Categories({
        type: "Income",
        color: "#00A4CCFF",
      });
  
      // Save the document to the database using the save() method
      const savedCategory = await Create.save();
  
      // Respond to the client with the saved document
      res.json(savedCategory);
    } catch (error) {
      // Handle any errors that occurred during the save operation
      res.status(400).json({ message: `Error while creating categories ${error.message}` });
    }
  }
  

//  get: http://localhost:5000/api/categories
async function  get_Categories(req, res){
    let data = await model.Categories.find({})

    let filter = await data.map(v => Object.assign({}, { type: v.type, color: v.color}));
    return res.json(filter);
}

//  post: http://localhost:5000/api/transaction
async function create_Transaction(req, res) {
    if (!req.body) return res.status(400).json("Post HTTP Data not Provided");
  
    const { name, type, amount } = req.body;
  
    try {
      const create = await new model.Transaction({
        name,
        type,
        amount,
        date: new Date(),
      });
  
      // Save the document to the database using the save() method
      const savedTransaction = await create.save();
  
      // Respond to the client with the saved document
      res.json(savedTransaction);
    } catch (error) {
      // Handle any errors that occurred during the save operation
      res.status(400).json({ message: `Error while creating transaction ${error.message}` });
    }
  }

//  get: http://localhost:5000/api/transaction
async function get_Transaction(req, res){
    let data = await model.Transaction.find({});
    return res.json(data);
}

//  delete: http://localhost:5000/api/transaction
async function delete_Transaction(req, res) {
    if (!req.body) return res.status(400).json({ message: "Request body not found" });
  
    try {
      const result = await model.Transaction.deleteOne(req.body);
      if (result.deletedCount === 1) {
        res.json("Record Deleted...!");
      } else {
        res.json("No matching record found to delete");
      }
    } catch (error) {
      res.status(500).json({ message: "Error while deleting Transaction Record" });
    }
  }

//  get: http://localhost:5000/api/labels
async function get_Labels(req, res){

    model.Transaction.aggregate([
        {
            $lookup : {
                from: "categories",
                localField: 'type',
                foreignField: "type",
                as: "categories_info"
            }
        },
        {
            $unwind: "$categories_info"
        }
    ]).then(result => {
        let data = result.map(v => Object.assign({}, { _id: v._id, name: v.name, type: v.type, amount: v.amount, color: v.categories_info['color']}));
        res.json(data);
    }).catch(error => {
        res.status(400).json("Lookup Collection Error");
    })

}

module.exports = {
    create_Categories,
    get_Categories,
    create_Transaction,
    get_Transaction,
    delete_Transaction,
    get_Labels
}