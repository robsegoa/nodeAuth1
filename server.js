var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var passport = require('passport');
var config = require('./config/database');//get db config file
var User = require('./app/models/user');//get the mongoose 
var port = process.env.PORT || 8080;
var jwt = require('jwt-simple');

// get our request parameters
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

// demo Route (GET http://localhost:8080)
app.get('/', function(req, res){
	res.send('hello! The API is at http://localhost:' + port + '/api');
});

mongoose.connect(config.database);

require('./config/passport')(passport);

var apiRoutes = express.Router();

apiRoutes.post('/signup', function(req,res){
	if(!req.body.name || !req.body.password){
		res.json({success: false, msg: 'Please pass name and password.'});
	} else {
		var newUser = new User({
			name: req.body.name,
			password: req.body.password
		});
		newUser.save(function(err){
			if(err){
				res.json({success: false, msg: 'User already exists!'});
			} else {
				res.json({success: true, msg: 'Successful created user!'});
			}
		});
	}
});


apiRoutes.post('/authenticate', function(req,res){
	User.findOne({
		name: req.body.name
	}, function(err, user){
		if(err) throw err;
		
		if(!user){
			return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
		} else {
			user.comparePassword(req.body.password,function(err,isMatch){
				if(isMatch && !err) {
					var token = jwt.encode(user, config.secret);

					res.json({success:true, token: 'JWT' + token });

				} else {
					return res.status(403).send({success:false, msg: 'Authentication failed. Wrong password'});
				}
			})
		}

	})
});


app.use('/api', apiRoutes);

//iniciando servidor
//////////////////////////////////////////////////////
app.listen(port,function(){
	console.log('Servidor rodando na Porta' + port);
})