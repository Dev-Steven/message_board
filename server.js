var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var session = require('express-session');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, './static')));

app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

const flash = require('express-flash');

app.use(flash());

mongoose.connect('mongodb://localhost/message_board');
mongoose.Promise = global.Promise;

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// making the schema
const CommentBoard = new mongoose.Schema({
    commentor: {type: String, required: true},
    comment: {type: String, required: true},
},{timestamps:true});

const MessageBoard = new mongoose.Schema({
    name: {type: String, required: true},
    message: {type: String, required: true},
    comment: [CommentBoard]
},{timestamps:true});


const Comment = mongoose.model('Comment', CommentBoard);
const User = mongoose.model('User', MessageBoard);

// const User = mongoose.model('User');
// const Comment = mongoose.model('Comment');

app.get('/', function(req, res) {
    User.find({}, function(err, post) {
        res.render('index', {all_posts: post});
    })
})

app.post('/post', function(req, res) {
    var post = new User({name: req.body.name, message: req.body.message});
    post.save(function(err) {
        if(err) {
            console.log('something went wrong');
            for(var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/');
        }
        else{
            console.log(post);
            console.log('message added');
            res.redirect('/');
        }
    }) 
})

app.post('/comment/:id', function(req, res) {
    var comment = new Comment({commentor: req.body.commentor, comment: req.body.comment});
    Comment.create(req.body, function(err, data) {
        if(err) {
            console.log('could not post comment');
            for(var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/');
        }
        else {
            console.log(comment);
            console.log('comment added');

            User.findOneAndUpdate({_id: req.params.id}, {$push: {comment: data}}, function(err, data) {
                if(err){
                    console.log("there is a problem");
                }
                else {
                    console.log("it worked?!")
                }
            })

            res.redirect('/')
        }
    })
})

app.listen(8000, function() {
    console.log('listening on port 8000')
})

