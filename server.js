var express = require('express');
var morgan = require('morgan');
var path = require('path');
// Nodejs hashing library 
var crypto = require('crypto');
var bodyParser = require('body-parser');
//check for JSON data in POST request
app.use(bodyParser.json());
var app = express();
app.use(morgan('combined'));

// USING POST-GRES FOR DATABASE CONNECTIVITY
var Pool = require('pg').Pool;

var config = {
	user: 'nikhilsingh050',
	database: 'nikhilsingh050',
	host:'db.imad.hasura-app.io',
	port: '5432',
	password: process.env.DB_PASSWORD
};

var pool = new Pool(config);

//RETURNS HTML PAGE AS A STRING
function createTemplate(data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content= data.content;
    
    var htmlTemplate = `
    <html>
        <head>
            <title>
                ${title}
            </title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link href="/ui/style.css" rel="stylesheet" />
        </head>
        <body>
            <div class="container">
                <div>
                    <a href="/">Home</a>
                </div>
                <hr/>
                <h3>
                    ${heading}
                </h3>
                <div>
                    ${date.toDateString()}
                </div>
                <div>
                    ${content}
                </div>
            </div>
        </body>
    </html>
    `;
    return htmlTemplate;
}

//WHEN THIS ENDPOINT IS REACHED THE FIVEN FUNCTION IS EXECUTED
app.get('/articles/:articleName', function(req, res) {
	pool.query("SELECT * FROM article WHERE title = '" + req.params.articleName + "'", function(err, result) {
		if (err) {
			res.status(500).send(err.toString());
		}
		else {
			if(result.rows.length === 0) {
				res.status(404).send('Article not found');

			}
			else {
				var articleData = result.rows[0];
				res.send(createTemplate(articleData));
			}
		}
	});
});

function hash(input, salt) {
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');              // password based key derivation function
    return ["pbkdf2", "1000", salt, hashed.toString('hex')].join('$');
}

app.get('/hash/:input', function(req, res){
    var hashedString = hash(req.params.input, 'this-is-a-random-string');
    res.send(hashedString);
});

// when the POST request is received, extract the username and pass from the request body and insert into database
app.post('/create-user', function(req, res){
   // JSON POST REQUEST
   // {"username": "nikhil", "password": "password"}
   var username = req.body.username;
   var password = req.body.password;
   var salt= crypto.randomBytes(128).toString('hex');
   var dbString = hash(password, salt);
   pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString], function(err, result) {
       if(err) {
           res.status(500).send(err.toString());
       }
       else {
           res.send('User created successfully: '+username);
       }
   });
});

//LOGGING THE USER IN
app.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    pool.query('SELECT * FROM "user" WHERE username = $1', [username], function(err, result) {
       if(err) {
           res.status(500).send(err.toString());
       }
       else {
           if(result.rows.length ===0 ) {
               res.send(403).send('username/password not valid');
           }
           else {
               // MATCH USERNAME AND PASSWORD FROM DB
               var dbString = result.rows[0].password;
               var salt = dbString.split('$')[2];           //3rd element of array of splitted parts
               var hasdhedPassword = hash(password, salt);  //Creating Hash based on submitted password
               if(hashedPassword === dbString) {
                   res.send("Login Successful");
                   
                   //SET A SESSION
                   
               }
               else {
                   res.send(403).send('Invalid username or password!!');
               }
           }
       }
   });
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});



// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
