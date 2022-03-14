var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' })
});

// PLAYBACK CONTROLS
router.post('/play', function (req, res) {
  cmd.run('mpc play');
  res.send('Play pausing/resuming');
})

router.post('/play/:spotifyUri', function (req, res) {
  console.log(req.params.spotifyUri);
  cmd.run('mpc clear');
  cmd.run(`mpc add ${req.params.spotifyUri}`);
  cmd.run('mpc play');
  res.send(`Playing ${req.params.spotifyUri}`);
})

router.post('/pause', function (req, res ){
  cmd.run('mpc pause');
  res.send('Music paused.');
})

router.post('/next', function (req, res ){
  cmd.run('mpc next');
  res.send('Playing next song.');
})

// If song progress is < 3 seconds, play revious song. Otherwise, restart current song
router.post('/prev', function (req, res ){
  cmd.get(
      'mpc',
      function(err, data, stderr) {
          if (!err) {
              // This is spoty even when run directly from the command line
              //  Event running mpc prev from the command line just restarts the current song
              // matches 1:11/2:22
              var timePlayedOne = data.match(/\d{1,2}[:]\d{1,2}[/]\d{1,2}[:]\d{1,2}/)[0];

              // gets the "1:11" portion to left of "/" and splits it into hours and minutes '[1,11]'
              var timePlayedTwo = timePlayedOne.split('/')[0].split(":");

              // converts "hours:minutes" to minutes
              var totalTimePlayed = parseInt(timePlayedTwo[0]) * 60 + parseInt(timePlayedTwo[1]);

              if (totalTimePlayed < 4){
                  cmd.run('mpc prev');
                  res.send('Playing previous song.');
              }
              else {
                  cmd.run('mpc seek 0%');
                  res.send('Restarting current song.');
              }
          } else {
              res.send('Error: ', err);
          }
      }
  );
})

router.post('/volume/:newVolume', function (req, res ){
  cmd.run(`mpc volume ${req.params.newVolume}`);
  res.send(`Volume set to ${req.params.newVolume}`);
})

router.get('/getCurrentTrackDetails', function (req, res ){
  cmd.get(
      'mpc',
      function(err, data, stderr) {
          if (!err) {
              res.send(data);
          } else {
              res.send('Error: ', err);
          }
      }
  )
})

// mpc has seperate pause and stop commands. I'm not sure what the difference is. So, we may not need this one.
router.post('/stop', function (req, res ){
  cmd.run('mpc stop');
  res.send('Music stopped.');
})

module.exports = router
