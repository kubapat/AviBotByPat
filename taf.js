 const Discord = require('discord.js');
 const {prefix, token} = require('./config.json');
 const client = new Discord.Client();
 const https = require('https');

 exports.showTaf = function(icao, message) {
     var options = {
        hostname: 'www.aviationweather.gov',
        port: 443,
        path: '/adds/tafs/?station_ids='+icao+'&std_trans=translated&submit_both=Get+TAFs+and+METARs',
        method: 'GET'
     };

     https.get(options, (res) => {
         var body = '';
         res.setEncoding('utf8');
         res.on('data', function(chunk) {
             body += JSON.stringify(chunk);
         });

         res.on('end', function() {
             if(!body.includes('TAF')) message.channel.send("TAF not available for this airport");
             else {
               var tafIndex = body.indexOf('TAF');
               body = body.slice(tafIndex);
               tafIndex = body.indexOf("</STRONG>");
               var taf = body.substring(0,tafIndex);

               var periodIndex = body.indexOf('<STRONG>');
               body = body.slice(periodIndex);
               periodIndex = body.indexOf('<TD');
               body = body.slice(periodIndex+19);
               periodIndex = body.indexOf("</TD>");
               var period = body.substring(0,periodIndex);

               var breakIndex = body.indexOf('FROM:');
               body = body.slice(breakIndex);

               var windIndex = body.indexOf('<STRONG>');
               body = body.slice(windIndex);
               windIndex = body.indexOf('<TD');
               body = body.slice(windIndex+19);
               windIndex = body.indexOf("</TD>");
               var wind = body.substring(0,windIndex);

               var visIndex = body.indexOf('<STRONG>');
               body = body.slice(visIndex);
               visIndex = body.indexOf('<TD');
               body = body.slice(visIndex+19);
               visIndex = body.indexOf("</TD>");
               var visibility = body.substring(0,visIndex);

               var ceilIndex = body.indexOf('<STRONG>');
               body = body.slice(ceilIndex);
               ceilIndex = body.indexOf('<TD');
               body = body.slice(ceilIndex+19);
               ceilIndex = body.indexOf("</TD>");
               var ceiling = body.substring(0,ceilIndex)

               var cloudIndex = body.indexOf('<STRONG>');
               body = body.slice(cloudIndex);
               cloudIndex = body.indexOf('<TD');
               body = body.slice(cloudIndex+19);
               cloudIndex = body.indexOf("</TD>");
               var clouds = body.substring(0,cloudIndex)

               var weathIndex = body.indexOf('<STRONG>');
               body = body.slice(weathIndex);
               weathIndex = body.indexOf('<TD');
               body = body.slice(weathIndex+19);
               weathIndex = body.indexOf("</TD>");
               var weather = body.substring(0,weathIndex)

               const tafMessage = new Discord.MessageEmbed()
                  .setColor('#0099ff')
                  .setTitle('TAF report for '+icao.toUpperCase())
                  .addField('RAW format',taf.replace(/\\n/g,''), true)
                  .addFields(
                      { name: 'Readable report', value: '**Forecast Period:**'+period.replace(/\\n/g,'').replace(/&#160;/g,' ')+
                                                         '\n**Wind:**'+wind.replace(/\\n/g,'').replace(/&#160;/g,' ').replace(/&#46;/g, '.').replace(/&#47;/g, '/').replace(/<BR>/g, ' ')+
                                                         '\n**Visibility:**'+visibility.replace(/\\n/g,'').replace(/&#160;/g,' ')+
                                                         '\n**Ceiling:**'+ceiling.replace(/\\n/g,'')+
                                                         '\n**Clouds:**'+clouds.replace(/\\n/g,'').replace(/<BR>/g, ' ')+
                                                         '\n**Weather:**'+weather.replace(/\\n/g,'').replace(/&#160;/g,' ')}
                  )
                  .setFooter('This data come from official NOAA Aviation Weather Center, but don\'t take it as a source for official weather briefing. Please obtain a weather briefing from the appropriate agency');

               message.channel.send(tafMessage);
             }
         });
     }).on('error', function(e) {
        console.log("Got error: " + e.message);
     });

 }
