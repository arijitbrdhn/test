var express = require('express');
var app = express();
var body = require('body-parser');
var mongoose = require('mongoose');
var multer  = require('multer');
var nodemailer = require('nodemailer');
var schema = mongoose.Schema;
var url = "mongodb://127.0.0.1:27017/affle";

app.use(body.json());
app.use(body.urlencoded({
	extended:false
}));
//app.use('/signup', express.static(__dirname + '/uploads'));

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
	image:{data:Buffer,type:String}
});
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
  cb(null, 'uploads/')
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
		var image = req.body.image;
		var data=new model({username:username, email:email, password:password, mobile:mobile, image:image});
		data.save(function(err){
			if(err)
			  res.send(err);
			res.send('You are registered');
		});
 //otp = Math.floor(1000 + Math.random() * 9000);
        //console.log(otp);
  var mailOptions = {
    from: '"Our Code World " <arijitbardhan1991@gmail.com>', 
    to: email, 
    subject: 'Welcome', 
    text: "http://localhost:8000/"
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
    var otp = req.body.otp;
 model.findOne({"email":email,"password":password},function(err,data){
			 if(err)
				res.send(err);
			 if(data==null) {
               model.findOne({"email":uEmail},function(err,data){ 
                    if(data==null)
				res.send("user does not exist");
			        else
			    res.send("password does not match");    	
          }); 
         }      
               else
			  res.send(data);
		  })       
           });

app.listen(8000);












