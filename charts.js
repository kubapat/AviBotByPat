 const Discord = require('discord.js');
 const {prefix, token} = require('./config.json');
 const client = new Discord.Client();
 const https = require('https');


 exports.sendChart = function(icao,message) {
     icao = icao.toUpperCase();
     var options = {
        hostname: 'vau.aero',
        port: 443,
        path: '/navdb/chart/'+icao+'.pdf',
        method: 'GET'
     };

     https.get(options, (res) => {
        var body = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
           body += JSON.stringify(chunk);
        });

        res.on('end', function() {
           //console.log(body); //DEBUG PURPOSES

           if(body.includes('404 Not Found')) message.channel.send("Charts aren\'t available for this airport");
           else {
              message.channel.send("<@"+message.author.id+">, charts have been sent to you :newspaper:");
              const chartsEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(icao+' charts')
                .addField('Link','Click here to see: [link](https://'+options["hostname"]+options["path"]+')')
                .setFooter('**Legal note** AviBot doesn\'t redistribute or isn\'t a broker in charts exchange, it sends link only. Provided links are publicly accesible via google search. AviBot doesn\'t take any responsibility for the legality of the content available under this address, it rests with the user and the content host. But AviBot obliges itself to disable this functionality in case of any request from the copyrights owner (contact jakubpat@protonmail.com).\n Bear in mind that provided charts might be deprecated.');
              message.author.send(chartsEmbed);
           }
        });

     }).on('error', function(e) {
        console.log("Got error: " + e.message);
     });
 }

 exports.sendNotam = function(icao,message) {
     icao = icao.toUpperCase();
     var options = {
        hostname: 'ourairports.com',
        port: 443,
        path: '/airports/'+icao+'/notams.html',
        method: 'GET'
     };

     https.get(options, (res) => {
        var body = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
           body += JSON.stringify(chunk);
        });

        if(body.includes('Not found')) message.channel.send("There\'s no such airport in our database");
        else {
           message.channel.send("<@"+message.author.id+">, notams have been sent to you");
           const chartsEmbed = new Discord.MessageEmbed()
              .setColor('#0099ff')
              .setTitle(icao+' notams')
              .addField('Link','Click here to download: [link](https://'+options["hostname"]+options["path"]+')')
              .setFooter('Bear in mind that provided notams might be outdated');
           message.author.send(chartsEmbed);
        }

     }).on('error', function(e) {
        console.log("Got error: " + e.message);
     });
 }
