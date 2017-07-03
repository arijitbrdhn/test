var express = require('express');
var app = express();
var body = require('body-parser');
var mongoose = require('mongoose');
var multer  = require('multer');
var nodemailer = require('nodemailer');
var session = require('express-session');
var schema = mongoose.Schema;
var url = "mongodb://127.0.0.1:27017/affle";
app.use(body.json());
app.use(body.urlencoded({
	extended:false
}));
/*app.set('trust proxy', 1)  
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))*/
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'arijitbardhan1991@gmail.com',
        pass: 'penelopecruz04'
    }
});

//app.use('/images', express.static(__dirname + '/uploads'));

var userschema=new schema({
	name:{type:String, required:true},
	email:{type:String, unique:true, required:true},
	username:{type:String, unique:true, required:true},
	password:{type:String, required:true},
	age:{type:Number, required:true},
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
		res.send(err);
     console.log("connected");
 }) ;

 var model=mongoose.model('employee',userschema);
 app.post('/signup',upload.any(),function(req,res){
		var uname=req.body.uname;
		var usname=req.body.usname;
		var uEmail=req.body.uEmail;
		var upass=req.body.upass;
		var uage=req.body.uage;
		var uImage = req.files;
		var Url = "http://localhost:8000/images/"+uImage[0].originalname;

		var data=new model({name:uname, username:usname, email:uEmail, password:upass, age:uage, image:Url});
		data.save(function(err){
			if(err)
			  res.send(err);
			res.send(data);
		})
 var mailOptions = {
    from: '"Our Code World " <arijitbardhan1991@gmail.com>', 
    to: uEmail, 
    subject: 'Welcome', 
    text: 'Hiiii... ', 
    html: '<b>Hello user </b><br> Welcome to my server'
};


 transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
})

  app.post('/login',function(req,res){
	var uEmail=req.body.uEmail;
	var pass=req.body.pass;
	//	var Url = "https://localhost:8000/reset/"
    var t1;
    var mailOptions = {
    from: '"Our Code World " <arijitbardhan1991@gmail.com>', 
    to: uEmail, 
    subject: 'Retrieve Password', 
    text: "http://localhost:8000/send"
    /*attachments:[
     {path:"https://localhost:8000/reset"}
    ]*/
   
  };

     app.get('/send',function(req,res){
        var t2 = new Date();
        if (t1.getMinutes()-t2.getMinutes()>10){
            res.send("Your session has expired \n Please try again later");
        }
       else{
        res.sendFile(__dirname+'/resetPwd.html');
     }})
    
     model.findOne({"email":uEmail,"password":pass},function(err,data){
			 if(err)
				res.send(err);
			 if(data==null) {
                 t1 = new Date();
				res.send("eMail or Password is incorrect");
                model.findOne({"email":uEmail},function(err,data){ 
                    if(data!=null){
				transporter.sendMail(mailOptions, function(error, info){
                  if(error){
                return console.log(error);
                   }
          console.log('Message sent: ' + info.response);
        });
          }});
             }  
               else
			  res.send(data);
		  })
    app.post('/reset',function(req,res){

      var Password = req.body.Password;
      var confirmPassword = req.body.confirmPassword;
      if(Password==confirmPassword){
     model.update({"email":uEmail},{$set:{"password":confirmPassword}},function(err){
     	 if(err)
     		res.send(err);
     	 else
     		res.send("Password Changed");
       });
      }
     else {
     res.send("Passwords didn't match")
       }
      })
     })
   app.listen(8000);




