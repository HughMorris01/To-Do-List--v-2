//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.set('strictQuery', false);
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoURL = "mongodb+srv://gfarrell82:GQueen4383@cluster0.4qohyx8.mongodb.net/todolistDB"

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});

mongoose.connect(mongoURL, {useNewUrlParser: true});

const itemSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Eat Breakfast"
})
const item2 = new Item({
  name: "Complete a Module"
})
const item3 = new Item({
  name: "Hit the Gym"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


// Item.deleteMany(function(err){
//   if(err){
//     console.log("Items weren't deleted.")
//   }
//   else {
//     console.log("Items were successfully deleted.")
//   }
// });



app.get("/", function(req, res) {

  const day = 'Today';

  Item.find({}, function(err, foundItems){
    if(err){
          console.log("Error retrieving items.")
        }
        else {

          if(foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err){
              if(err){
                console.log("Items weren't inserted.")
              }
              else {
                console.log("Items were successfully inserted.")
              }
            });
          }
          res.render("list", {listTitle: day, newListItems: foundItems});
        }
  });
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err) {
      if(!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});

  if(listName === "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }
});


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
