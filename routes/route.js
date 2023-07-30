const routes = require('express').Router();
const controller = require('../controller.js');

routes.route('/categories')
    .post(controller.create_Categories)
    .get(controller.get_Categories)

routes.route('/transaction')
    .post(controller.create_Transaction)
    .get(controller.get_Transaction)
    .delete(controller.delete_Transaction)

routes.route('/labels')
    .get(controller.get_Labels)

module.exports = routes;
