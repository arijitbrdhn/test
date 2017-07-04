var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var body = require('body-parser');
var mongoose = require('mongoose');
var multer  = require('multer');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var schema = mongoose.Schema;
var url = "mongodb://127.0.0.1:27017/affle";
var counter = 0;
app.use(body.json());
app.use(body.urlencoded({
	extended:false
}));
//app.use('/login', express.static(__dirname + '/uploads'));

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'arijitbardhan1991@gmail.com',
        pass: 'penelopecruz04'
    }
});

var userschema=new schema({
	email:{type:String, unique:true, required:true},
	username:{type:String, unique:true, required:true},
	password:{type:String, required:true},
	mobile:{type:Number, required:true},
	image:{data:Buffer,contentType:String},
	counter:{type:Number,required:true}
});
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
  cb(null, __dirname+'/uploads/')
  },
  filename: function(req, file, cb) {
  cb(null, file.originalname);
  }
 });
var upload = multer({
 storage: storage
});
mongoose.connect(url,function(err){
	  if(err)
		console.log(err);
     console.log("connected");
 }) ;

 var model=mongoose.model('user',userschema);

 app.get('/',function(req,res){
 	res.sendFile(__dirname + '/login.html')
 })

 app.get('/register',function(req,res){
      res.sendFile(__dirname + '/register.html');
  });
 app.post('/signup',upload.any(),function(req,res){
 		var username = req.body.username;
		var email = req.body.email;
		var password = req.body.password;
		var mobile = req.body.mobile;
		var image = req.files;
    var path = fs.readFileSync(image[0].path);
		//var url = "http://localhost:8000/login/"+image[0].originalname;
		//console.log(image);
      //  var Url = "http://localhost:8000/images/"+ image.originalname;
    /*var dp=new model({image:uImage[0].path});
      dp.save(function(err){
		if(err)
		  res.send(err);
		console.log("Data saved successfully");
		})
		res.redirect(Url);
	});*/
  var myKey = crypto.createCipher('aes-256-ctr','myPassword');
  var myPass = myKey.update(password,'utf8','hex');
  //myPass += myPass.update.final('hex');
  console.log(myPass);
	var doc = new model({username:username, email:email, password:myPass, mobile:mobile, counter:0})
  doc.image.data = path;
  //res.send(reply);
	
		doc.save(function(err){
			if(err)
			res.send(err);
			else{
			fs.appendFile('answerApp.txt', "\n Succesfully Registered "+new Date(), function(err){	
			res.redirect("http://localhost:8000/");
		});
		}
		});
  otp = Math.floor(1000 + Math.random() * 9000);
        //console.log(otp);
  var mailOptions = {
    from: '"Our Code World " <arijitbardhan1991@gmail.com>', 
    to: email, 
    subject: 'Welcome', 
    text: ""+ otp
   };
 transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
      }
    console.log('Message sent: ' + info.response);
  });
 });


app.post('/login',function(req,res){
	var email = req.body.email;
	var password = req.body.password;
  var reply='';
 model.findOne({"email":email,"password":password},function(err,doc){
 
			     if(err)
			         res.send(err);
			     if(doc==null) {
               model.findOne({"email":email},function(err,doc){ 
                   if(doc==null)
				       res.send("user does not exist");
			             else
			         res.send("password does not match");    	
             }); 
            }      
               else{
             reply = " Your username is " + doc.username + "\n Your E-mail id is " + doc.email + "\n Your image is " + doc.image.data + "\n Your mobile number is " + doc.mobile;
             model.findOne({"email":email},function(err,doc){
             url = doc.image;
             var counter = doc.counter;
                if(counter==0){
             model.updateOne({"email":email},{$set:{"counter":1}},function(err,doc){
             res.sendFile(__dirname + "/otp.html"); 	
              })
              }
                else {
             fs.appendFile('answerApp.txt',"\n Succesfully Loggedin"+new Date(),function(err){	
            	 //console.log(url);
               //res.redirect(url);
			         res.write(reply);
			         res.end();
		     });
             }
             })	  
		     }});

app.post('/otp',function(req,res){
	var OTP = req.body.OTP;
	if(otp!=OTP)
	res.send("OTP doesnot match")
	else{
    fs.appendFile('answerApp.txt',"\n Succesfully Loggedin"+new Date(),function(err){	
    	  //console.log(url);
        //res.redirect(url);
	      res.write(reply);
	      res.end();
     });
    }
   });

app.get('/delete',function(req,res){
model.remove({"email":email},function(err,doc){
	if(err)
	res.send(err);	
  fs.appendFile('answerApp.txt',"\n User Removed",function(err){	
	res.send("Your profile has been removed");
     });
	})
  })
 });

app.get('/mail',function(req,res){
      res.sendFile(__dirname+'/getEmail.html');
     });

app.post('/send',function(req,res){
    var email = req.body.email;
    var mailOptions = {
    from: '"Our Code World " <arijitbardhan1991@gmail.com>', 
    to: email, 
    subject: 'Retrieve Password', 
    text: "http://localhost:8000/reset"
  };

  model.findOne({"email":email},function(err,doc){
    if(err)
      res.send(err);
    if(doc==null)
      res.send("Give correct email Id ");
    else{
     transporter.sendMail(mailOptions, function(error, info){
                  if(error){
                return console.log(error);
                   }
               res.send("A message has been sent to your email-Id");
               console.log('Message sent: ' + info.response);
        });
       }});

app.get('/reset',function(req,res){
   res.sendFile(__dirname+'/resetPass.html');
});

app.post('/resetPassword',function(req,res){
  var newPassword = req.body.newPassword;
  var confirmPassword = req.body.confirmPassword;
  var myKey = crypto.createCipher('aes-256-ctr','myPassword');
  var myPass = myKey.update(confirmPassword,'utf8','hex');
     if(newPassword==confirmPassword){
       model.updateOne({"email":email},{$set:{"password":myPass}},function(err){
       if(err)
        res.send(err);
       else
        res.send("Password Changed Succesfully");
       });
      }
     else {
     res.send("Passwords didn't match")
       }
      });
    });

app.listen(8000);























