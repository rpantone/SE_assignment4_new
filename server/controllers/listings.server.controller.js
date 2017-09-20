
/* Dependencies */
var mongoose = require('mongoose'), 
    Listing = require('../models/listings.server.model.js');

/*
  In this file, you should use Mongoose queries in order to retrieve/add/remove/update listings.
  On an error you should send a 404 status code, as well as the error message. 
  On success (aka no error), you should send the listing(s) as JSON in the response.

  HINT: if you are struggling with implementing these functions, refer back to this tutorial 
  from assignment 3 https://scotch.io/tutorials/using-mongoosejs-in-node-js-and-mongodb-applications
 */

/* Create a listing */
exports.create = function(req, res) {

  /* Instantiate a Listing */
  var listing = new Listing(req.body);

  /* save the coordinates (located in req.results if there is an address property) */
  if(req.results) {
    listing.coordinates = {
      latitude: req.results.lat, 
      longitude: req.results.lng
    };
  }

  /* Then save the listing */
  listing.save(function(err) {
    if(err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      res.json(listing);
    }
  });
};

/* Show the current listing */
exports.read = function(req, res) {
  /* send back the listing as json from the request */
  res.json(req.listing);
};

/* Update a listing */
exports.update = function(req, res){
  /*update function*/
  var listing = req.listing;
  /*insert new stuff*/
  Listing.findOneAndUpdate( /* use this function to do what we want */
  {_id: listing._id},
  {code: req.body.code,  /* recall the grouping of these */
  name: req.body.name,
  address: req.body.address, /* coordinates are all one */
  coordinates: {latitude: req.results.lat, longitute: req.results.lng}},
	  function(err, l){if(err){res.status(400).send(err); /* check for errors */
		}else{Listing.findById(l._id, function(err, l){ /* check find by id function */
				if(err){  /* again, another error check if not */
					res.status(400).send(err);
				}
				else{ /* else do dis */
					res.json(l);
			    }});}});
};

/* Delete a listing */
exports.delete = function(req, res, next) { /*note the next parameter*/
  var listing = req.listing;
  /* Remove the article
     Luckily, there's an easy function for this */
  Listing.findOneAndRemove( /* this will remove for us*/
  {code: listing.code}, /* appropriate code */
  function(err, listing){ /* if there's a problem */
      if(err){res.status(400).send(err); /* log it */
		  console.log(err); 
	  }else{res.status(200); /* and if not */
		  next();
	  }});
};

/* Retreive all the directory listings, sorted alphabetically by listing code */
exports.list = function(req, res, next) { /*again, we use next*/
  Listing.find(/*it's easy with the find command*/
     {},
     null,
     {sort: {code: 1}}, /* this will do what we want*/
     function(err, listing){
  	   if(err){ /*simply check if there's an error*/
		  res.status(400).send(err);
	   }else{/*or not*/
		  res.json(listing);
	   }});
};

/* 
  Middleware: find a listing by its ID, then pass it to the next request handler. 

  HINT: Find the listing using a mongoose query, 
        bind it to the request object as the property 'listing', 
        then finally call next
 */
exports.listingByID = function(req, res, next, id) {
  Listing.findById(id).exec(function(err, listing) {
    if(err) {
      res.status(400).send(err);
    } else {
      req.listing = listing;
      next();
    }
  });
};