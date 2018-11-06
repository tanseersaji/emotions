const Express = require('express');
const bodyParser = require('body-parser');
const Twitter = require('twitter');
const speak = require('speakeasy-nlp');
const app = Express();

let urlencodedParser = bodyParser.urlencoded({ extended: false });

let client = new Twitter({
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: ''
  });

app.use(Express.static(__dirname + '/Views'));
app.use(Express.static(__dirname + '/Scripts'));
app.set('view engine', 'jade')


app.get('/',(req, res) => {
    res.sendFile('index.html');
});

app.get('/topic', (req,res) => {
    res.redirect('/');
})

function getSentiment(tweet){

    var score = speak.sentiment.analyze(tweet.text);
    score = score.score;

    let tempJson = {
        text: tweet.text,
        user: tweet.user.id,
        post: tweet.id_str,
        score: score
    };
    return tempJson;
}

app.post('/topic',urlencodedParser,(req,res) => {
    const topic = req.body.topic;
    if (!topic){
        res.redirect('/');
        return;
    }
    client.get('search/tweets',{q: topic, count: 100},(error, tweets, response) => {
        let tweetSentiments = [];
        for (let i = 0; i < tweets.statuses.length; i++){
            if (tweets.statuses[i].lang == 'en'){
                let tempJson = getSentiment(tweets.statuses[i]);
                if (tempJson){
                    tweetSentiments.push(tempJson);
                }
            }
        }    
        res.render('topic',{query: topic,tweets: tweetSentiments});
        console.log(`New search query: ${topic}`);
    });
});

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
