const logReg = require("../models/logReg.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailer = require('../helper/mailer')

const fs = require("fs");

class logRegController {
  async userAuth(req, res, next) {
    try {
      if (!_.isEmpty(req.user)) {
        next();
      } else {
        res.redirect("/show-login");
      }
    } catch (err) {
      throw err;
    }
  }

  async showRegistrationForm(req, res) {
    try {
      res.render("registration", {
        title: "Registration",
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      throw err;
    }
  }

  async register(req, res) {
    try {
      req.body.fullname =
        (req.body.firstname) + " " + (req.body.lastname);
        // `${req.body.firstname} + ${req.body.lastname}`
      let is_email_exists = await logReg.findOne({ email: req.body.email });
      if (!_.isEmpty(is_email_exists)) {
        req.flash("error", "this email is already exists");
        return res.redirect("/");
      }

      if (req.body.password !== req.body.confirm_password) {
        req.flash("error", "password and confirm password should be same");
        return res.redirect("/");
      }

      req.body.password = bcrypt.hashSync(
        req.body.password,
        bcrypt.genSaltSync(10)
      );
         console.log(req.body);

      req.body.image = req.file.filename;

    //   console.log(req.body, "after");

      let register = await logReg.create(req.body);
      console.log("register saved data", register);

      if (!_.isEmpty(register) && register._id) {
        let is_mail_send = await mailer.sendMail(process.env.EMAIL,req.body.email,'email submitted',`hiw ${req.body.fullname} your data 
        submitted with ${req.body.password} password`)
        console.log('mail sending', is_mail_send);
        req.flash("success", "your registration is sucessfully done");
        return res.redirect("/");
      } else {
        req.flash("error", "something went wrong ");
        return res.redirect("/");
      }
    } catch (err) {
      console.log(err);
    }
  }

  async showLoginForm(req, res) {
    try {
      res.render("login", {
        title: "Login",
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      throw err;
    }
  }

  async login(req, res) {
    try {
      console.log(req.body);
      let is_user_exists = await logReg.findOne({ email: req.body.email });
      if (_.isEmpty(is_user_exists)) {
        req.flash("error", "Email is not exists!");
        return res.redirect("/show-login");
      }

      const hash_password = is_user_exists.password;
      // console.log(hash_password);
      if (bcrypt.compareSync(req.body.password, hash_password)) {
        let token = jwt.sign(
          {
            id: is_user_exists._id,
          },
          "MYS3CR3TK3Y",
          { expiresIn: "2d" }
        );

        res.cookie("user_token", token);
        res.redirect("/dashboard");
      } else {
        req.flash("error", "Bad credentials!");
        return res.redirect("/show-login");
      }
    } catch (err) {
      throw err;
    }
  }

  // dashboard path

  async dashboard(req, res) {
    
    try {
      // console.log(req.user.id);
      let all_data = await logReg.findOne({_id:req.user.id})
      console.log("data", all_data);
      
      res.render("dashboard", {
        title: "Dashboard",
        all_data
      });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new logRegController();
