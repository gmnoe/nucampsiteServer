const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
            console.log({favorite})
            req.body.forEach(campsite => {
                if (!favorite.campsites.includes(campsite._id)) {
                    favorite.campsites.push(campsite._id)
                }
            });
            favorite.save()
            .then(fav => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav)
            })
        } else {
            Favorite.create({ user: req.user._id })
            .then(favorite => {
                req.body.forEach(campsite => {
                    if (!favorite.campsites.includes(campsite._id)) {
                        favorite.campsites.push(campsite._id)
                    }
                })
                favorite.save()
                .then(fav => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav)
            })
            .catch(err => next(err))
            })
        }
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
    .then(response => {
        if (response) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        } else {
            res.setHeader('Content-Type', 'text/plain')
            res.end('You do not have any favorites to delete.');
        }
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({ user: req.user._id }).then(favorite => {
      if (favorite) {
        if (!favorite.campsites.includes(req.params.campsiteId)) {
          favorite.campsites.push(req.params.campsiteId)
        } else {
            res.statusCode = 200
            res.end('That campsite is already in the list of favorites!')
        }
        favorite.save().then(fav => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(fav)
        })
      } else {
        Favorite.create({ user: req.user._id })
          .then(favorite => {
            if (!favorite.campsites.includes(req.params.campsiteId)) {
              favorite.campsites.push(req.params.campsiteId)
            }
            favorite.save().then(fav => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(fav)
            })
          })
          .catch(err => next(err))
      }
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if(favorite) {
            const index = favorite.campsites.indexOf(req.params.campsiteId)
            if (index > 0) {
                favorite.campsites.splice(index, 1)
            }
            favorite.save()
            .then(fav => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav)
            })
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('There are no favorites to be deleted.')
        }
    })
})

module.exports = favoriteRouter;