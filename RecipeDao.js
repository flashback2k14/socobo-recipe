function RecipeDao(component, userId) {
    var that = component;
    var id = userId;
    var userUrl = getUserUrl();

    function getUserUrl() {
      return that.url + "recipes/" + id;
    }

    this.add = function (obj) {
      var dataRef = new Firebase(userUrl);
      dataRef.push(obj, function (error) {
        if (error) {
          notify("Sorry a technical error occured while saving your recipe :(");
        } else {
          notify("Element successfully created!");
        }
      });
    };

    this.addImage = function (obj, recipe) {
      var dbUrl = that.url + "recipeImages/" + (recipe.ref);
      alert(dbUrl);
      var dataRef = new Firebase(dbUrl);
      dataRef.push(obj, function (error) {
        if (error) {
          notify("Sorry a technical error occured while saving your recipe :(");
        } else {
          notify("Element successfully created!");
        }
      });
    };

    this.findImage = function(recipe){
      var dbUrl = (recipe.ref) + "/image";
      var image = undefined;
      var dataRef = new Firebase(dbUrl);
      dataRef.once("value", function (snapshot) {
        image = snapshot.val();
      }, function(error){
        notify("Getting image from the database failed");
      });
      return image;
    }

    this.update = function (obj) {
      var reference = "" + obj.ref + "";
      var newObj = {};
      for (var e in obj) {
        if (e != "ref" && e != "info") {
          if(checkProperty(obj, e)){
            newObj[e] = obj[e];
          }
        }
      }
      var dataRef = new Firebase(reference);
      dataRef.set(newObj, function (error) {
        if (error) {
          notify("Sorry a technical error occured while updating your recipe :(");
        } else {
          notify("Element successfully updated!");
        }
      });
      that.recipes = [];
    };

    this.getAll = function(){
      var dataRef = new Firebase(userUrl);
      dataRef.once("value", function (snapshot) {
        var val = snapshot.val();
        for(e in val){
          var recipe = {};
          var source;
          if(checkProperty(val, e)){
            source =  val[e];
            recipe.ref = snapshot.ref() + "/" + e;
            recipe.desc = source.desc;
            recipe.info = source.info;
            recipe.ingredients = [];
            recipe.steps = [];
            recipe.text = source.text;
            fillArrayProperty(source, recipe, "ingredients");
            fillArrayProperty(source, recipe, "steps");
          }else {
            recipe.ref = snapshot.ref() + "/" + e;
            recipe.desc = "no titel";
            recipe.info = "-";
            recipe.ingredients = [];
            recipe.steps = [];
            recipe.text = "no description";
          }
          that.push("recipes", recipe);
        }
      }, function(err){
        notify("Sorry a technical error occured while fetching your recipes :(");
      });
    };

    this.getAndUpdate = function () {
      var dataRef = new Firebase(userUrl);
      dataRef.on("child_added", function (snapshot) {
        new Promise(function (resolve, reject) {
          resolve(snapshot.val());
        }).then(function (val) {
          var recipe = {};
          recipe.ref = snapshot.ref();
          recipe.desc = val.desc;
          recipe.info = val.info;
          recipe.ingredients = [];
          recipe.steps = [];
          recipe.text = val.text;
          fillArrayProperty(val, recipe, "ingredients");
          fillArrayProperty(val, recipe, "steps");
          that.push('recipes', recipe);
        }).catch(function (err) {
          notify(err);
        });
      }, function (err) {
        notify(err);
      });
    };

    this.remove = function (obj, succ, err) {
      if (typeof succ === 'undefined') {
        succ = function () {
          notify("Element successfully removed!");
        }
      }
      if (typeof err === 'undefined') {
        err = function () {
          notify("Sorry a technical error occured while deleting your recipe :(");
        }
      }
      if (typeof succ !== 'function') {
        throw "The callback for success in removeRecipe() is not a function";
      }
      if (typeof err !== 'function') {
        throw "The callback for errors in removeRecipe() is not a function";
      }
      var dataRef = new Firebase("" + obj.ref);
      dataRef.remove(function (error) {
        if (error) {
          err();
        } else {
          succ();
        }
      });
    };

    function checkProperty(obj, propName){
      return obj.hasOwnProperty(propName);
    }

    function fillArrayProperty(source, dest, arrProp){
      if(checkProperty(dest, arrProp)){
        for (var j in source[arrProp]) {
          if(checkProperty(source[arrProp], j)){
            (dest[arrProp]).push(source[arrProp][j]);
          }
        }
      }
    }

    function notify(msg){
      that.$.errorNotification.text=msg;
      that.$.errorNotification.show();
    }
}







