const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const mongo = require('mongodb');
const validatePhoneNumber = require('validate-phone-number-node-js');
const nodemailer = require('nodemailer');
const Nexmo = require('nexmo');

let Visitors = require('./Visitors');

var app = express();
app.set('view engine','ejs');
app.use('/static', express.static('static'))

var urlencodedparser=bodyparser.urlencoded({extended:false});
app.use(bodyparser.json());

mongoose.connect('mongodb://localhost:27017/SummerGeeks', {useNewUrlParser: true,  useUnifiedTopology: true });
let db = mongoose.connection;

db.once('open', function(){
  console.log("Connected to MongoDB...");
});

db.on('error', function(err){
  console.log(err);
});

app.post('/checkout/:id', urlencodedparser,async function(req,res){
  Visitors.updateOne({_id:req.params.id},{$set:{checkout:req.body.time}}, function(err){
    console.log("Stored");
  })
  Visitors.findOne({_id:req.params.id}, function(err, visitor){
    if(err){
      console.log(err);
    }
    const nexmo = new Nexmo({
      apiKey: '---------',
      apiSecret: '---------------',
    });
    var t = new Date(visitor.checkin);
    const from = 'SummerGeeks';
    const to = '91'+visitor.phnum;
    const text = `Hello ${visitor.name}\nYour visit details\nEmail: ${visitor.email}\nPhone Number: ${visitor.vphnum}\nCheck In: ${t.getHours()}:${t.getMinutes()}\nMet with: ${visitor.host.name}\nAddress: ${visitor.host.address}`;

    nexmo.message.sendSms(from, to, text);

    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '*************',
      pass: '************'
    }
  });

  var mailOptions = {
    from: 'wandermate.help@gmail.com',
    to: visitor.email,
    subject: "You have a new Visitor",
    text: "",
    html: `<!DOCTYPE html>
    <html lang="en" dir="ltr">
      <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
      </head>
      <body>
       <div class="jumbotron">
        <h1>Hello, ${visitor.name}</h1>
        <h3>Your visit details</h3>
        <ul>
        <li><b>Email:</b> ${visitor.email}</li>
        <li><b>Phone Number:</b> ${visitor.phnum}</li>
        <li><b>Check In:</b> ${t.getHours()}:${t.getMinutes()}</li>
        <li><b>Email:</b> ${visitor.checkout}</li>
        <li><b>Email:</b> ${visitor.host.name}</li>
        <li><b>Email:</b> ${visitor.host.address}</li>
        </ul>
        <p>Thank You</p>
       </div>
      </body>
    </html>`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  })

  res.render('temp', {msg:'Thank You'});
})

app.post('/', urlencodedparser,async function(req,res){
try{  console.log(req.body);
  var obj = {
    name: req.body.hostname,
    email: req.body.emailh,
    phnum: req.body.hphnum,
    address: req.body.address
  }
  var temp = new Visitors();
  temp.name=req.body.name;
  temp.phnum=req.body.vphnum
  temp.email=req.body.email;
  temp.checkin=new Date();
  temp.checkout="pending";
  temp.host=obj;
  await temp.save();
  var id = temp._id;
  var checkhr = new Date().getHours();
  var checkmin = new Date().getMinutes();
  //console.log(id)
  res.render('temp', {msg:`Welcome ${req.body.name}`})}catch(e){
      console.log(e)
  }



const nexmo = new Nexmo({
  apiKey: '----------',
  apiSecret: '----------------',
});

const from = 'SummerGeeks';
const to = '91'+req.body.hphnum;
const text = `Hello ${req.body.hostname}\nYou have a new visitor\nName: ${req.body.name}\nEmail: ${req.body.email}\nPhone Number: ${req.body.vphnum}\nCheck In: ${checkhr}:${checkmin}`;

nexmo.message.sendSms(from, to, text);

    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '************************',
      pass: '**************'
    }
  });

  var mailOptions = {
    from: 'wandermate.help@gmail.com',
    to: req.body.emailh,
    subject: "You have a new Visitor",
    text: "",
    html: `<!DOCTYPE html>
    <html lang="en" dir="ltr">
      <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
      </head>
      <body>
       <div class="jumbotron">
        <h1>Hello, ${req.body.hostname}</h1>
        <h3>You have a new visitor</h3>
        <ul>
        <li><b>Name:</b> ${req.body.name}</li>
        <li><b>Email:</b> ${req.body.email}</li>
        <li><b>Phone Number:</b> ${req.body.vphnum}</li>
        <li><b>Check In:</b> ${checkhr}:${checkmin}</li>
        </ul>
        <p>Please fill fill the checkout time</p>
        <form action="http://localhost:3000/checkout/${id}" method="POST">
          <div class="col-md-4 mb-3">
            <label for="validationServer01">Check Out Time</label>
            <input name="time" type="text" class="form-control" id="validationServer01" required>
            <input type="submit" class="btn btn-success" name="submit" value="Submit">
            <div class="valid-feedback">
              Please enter in hh:mm 24-hour format
            </div>
          </div>
        </form>
        <p>Thank You</p>
       </div>
      </body>
    </html>`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
});

app.get('/', function(req,res){
  res.render('main')
});

app.listen(3000, function(){
  console.log('Listening on port 3000');
})
