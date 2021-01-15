 const Discord = require('discord.js');
 const {prefix, token} = require('./config.json');
 const client = new Discord.Client();
 const https = require('https');


 exports.showMetar = function(icao, message) {
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
             if(!body.includes('METAR text:')) message.channel.send("METAR not available for this airport");
             else {
               var metarIndex = body.indexOf('METAR text:');
               body = body.slice(metarIndex);
               metarIndex = body.indexOf("<STRONG>");
               body = body.slice(metarIndex+8);
               metarIndex = body.indexOf("</STRONG>");
               var metar = body.substring(0,metarIndex);



               var stationIndex = body.indexOf('<STRONG>');
               body = body.slice(stationIndex);
               stationIndex = body.indexOf('<TD');
               body = body.slice(stationIndex+19);
               stationIndex = body.indexOf("</TD>");
               var station = body.substring(0,stationIndex);

               var tempIndex = body.indexOf('<STRONG>');
               body = body.slice(tempIndex);
               tempIndex = body.indexOf('<TD');
               body = body.slice(tempIndex+19);
               tempIndex = body.indexOf("</TD>");
               var temp = body.substring(0,tempIndex);

               var dewIndex = body.indexOf('<STRONG>');
               body = body.slice(dewIndex);
               dewIndex = body.indexOf('<TD');
               body = body.slice(dewIndex+19);
               dewIndex = body.indexOf("</TD>");
               var dew = body.substring(0,dewIndex);

               var pressIndex = body.indexOf('<STRONG>');
               body = body.slice(pressIndex);
               pressIndex = body.indexOf('<TD');
               body = body.slice(pressIndex+19);
               pressIndex = body.indexOf("</TD>");
               var pressure = body.substring(0,pressIndex);

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

               const metarMessage = new Discord.MessageEmbed()
                  .setColor('#0099ff')
                  .setTitle('METAR report for '+icao.toUpperCase())
                  .addField('RAW format',metar.replace(/\\n/g,''), true)
                  .addFields(
                      { name: 'Readable report', value: '**Station:**'+station.replace(/\\n/g,'').replace(/&#160;/g,' ')+
                                                         '\n**Temperature:**'+temp.replace(/&deg;/g, '°').replace(/&#46;/g, '.').replace(/\\n/g,'').replace(/&#45;/g,'-')+
                                                         '\n**Dewpoint:**'+dew.replace(/\\n/g,'').replace(/&deg;/g, '°').replace(/&#46;/g, '.').replace(/&#160;/g,' ').replace(/&#37;/g, '%').replace(/&#45;/g,'-')+
                                                         '\n**Pressure:**'+pressure.replace(/\\n/g,'').replace(/&#160;/g,' ').replace(/&#46;/g, '.').replace(/&#160/g,' ').replace(/<BR>/g, ' ').replace(/&#45;/g,'-')+
                                                         '\n**Wind:**'+wind.replace(/\\n/g,'').replace(/&#160;/g,' ').replace(/&#46;/g, '.').replace(/&#47;/g, '/').replace(/<BR>/g, ' ')+
                                                         '\n**Visibility:**'+visibility.replace(/\\n/g,'').replace(/&#160;/g,' ').replace(/&#46;/g, '.')+
                                                         '\n**Ceiling:**'+ceiling.replace(/\\n/g,'')+
                                                         '\n**Clouds:**'+clouds.replace(/\\n/g,'').replace(/<BR>/g, ' ')+
                                                         '\n**Weather:**'+weather.replace(/\\n/g,'').replace(/&#160;/g,' ').replace(/<BR>/g, ' ').replace(/&#33;/g, '!').replace(/&#34;/g, '"').replace(/&#36;/g, '$')}
                  )
                  .setFooter('This data come from official NOAA Aviation Weather Center, but don\'t take it as a source for official weather briefing. Please obtain a weather briefing from the appropriate agency');

               message.channel.send(metarMessage);
             }
         });
     }).on('error', function(e) {
        console.log("Got error: " + e.message);
     });

 }

