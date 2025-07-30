import express from 'express';
import dotenv from "dotenv";
import path from 'path';
import cookieParser from "cookie-parser";
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';

import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';


dotenv.config();
const __dirname = path.resolve();

export async function setupApp(app) {

  // cors setting 
  app.use(cors(
    {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
  ));


  //  middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // const __dirname = path.resolve();

  app.use(express.static('public'));
  app.use(expressLayouts);
  app.set("layout", "");


  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');



  // session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  }));



  // cloudinary config
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,

  });


}