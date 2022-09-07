'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');

const { engine: handlebars } = require('express-handlebars');

function loadRoutes(server, routeDir){
    const routes = fs.readdirSync(routeDir).filter(file => file.endsWith(".js"));
    
    routes.forEach(r => {
        const route = require(path.join(routeDir, r));
        server.use(route.root, route.router);
    });
}

function initHandlebars(server, extension, opts, dir){
    opts.extname ??= `.${extension}`;
    server.engine(extension, handlebars(opts));
    server.set('view engine', extension);
    server.set('views', dir);
}

const defaultConfig = {
    dir: __dirname,
    routeDir: 'routes',
    viewDir: 'views'
}

module.exports = (config) => {
    config = {...defaultConfig, ...config};

    const server = new express();
    server.use(express.json());
    server.use(express.urlencoded({
        extended: true
    }));

    //add common utils to the server
    server.loadRoutes = (dir) => {
        loadRoutes(server, dir ?? path.join(config.dir, config.routeDir));
    }

    server.useHandlebars = (extension, opts, dir) => {
        initHandlebars(server, extension, opts, dir ?? path.join(config.dir, config.viewDir));
    }

    server.addStaticDir = (dir) => {
        server.use('/', express.static(dir));
    }

    server

    return server;
}