 const Discord = require('discord.js');
 const request = require("request")
 const https   = require('https');

 const {prefix, token} = require('./config.json');
 const client = new Discord.Client();

 function bearingToIdent(bearing) {
        if(bearing<10) return "36";

        bearing = parseInt(bearing/10,10);
        if(bearing<10) return "0"+bearing;
        else return bearing;
 }

 exports.rwyInUse = function(icao,message) {
        icao = icao.toUpperCase();

        var link = "https://api.flightplandatabase.com/nav/airport/"+icao;

        request({
            url: link,
            json: true
        }, function (error, response, airportData) {

            if(!error && response.statusCode != undefined && response.statusCode == 200) {
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
					if(!body.includes('METAR text:')) message.channel.send("Cannot get active rwy due to lack of wind's data");
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
						var wind = body.substring(0,windIndex).replace(/\\n/g,'').replace(/&#160;/g,' ').replace(/&#46;/g, '.').replace(/&#47;/g, '/').replace(/<BR>/g, ' ');

						if(!wind.includes("degree")) message.channel.send("Wind is calm, so any rwy can be used there!");
						else {
							windIndex = wind.indexOf('(');
							wind = wind.slice(windIndex+1);
							windIndex = wind.indexOf('d');
							var wind = parseInt(wind.substring(0,windIndex),10);

							var ok = '',num=0;

							airportData["runways"].forEach(rwy => {
                                				 var bearing = parseInt(rwy["bearing"],10);
                              					 if(bearing >= wind && (bearing-wind <= 90 || ((360-bearing)+wind) <= 90)) { ok+=rwy["ident"]+' '; num+=1; }
				                                 if(bearing < wind && (wind-bearing <= 90 || ((360-wind)+bearing) <= 90)) { ok+=rwy["ident"]+' '; num+=1; }
	                        				 //if(Math.abs(parseInt(rwy["bearing"],10)-wind)<=90) ok+=rwy["ident"]+' '; //(bearingToIdent(parseInt(rwy["bearing"],10))+' ');
							});

							if(ok == '') message.channel.send("Cannot find active runway clearly");
							else if(num == 1) message.channel.send("Based on wind only, suitable rwy is "+ok);
							else  message.channel.send("Based on wind only, suitable rwys are "+ok);
						}

					}
				 });
				}).on('error', function(e) {
					console.log("Got error: " + e.message);
				});
			} else message.channel.send("Sorry, but rwy data is unavailable for this airport");
        })

 }

 exports.showNavAids = function(id,message) {
		id = id.toUpperCase();
		var link = "https://api.flightplandatabase.com/search/nav?q="+id;

        request({
            url: link,
            json: true
        }, function (error, response, navAid) {
            if(!error && response.statusCode != undefined && response.statusCode == 200) {
               const aids = new Discord.MessageEmbed().setColor('#0099ff').setTitle('Found NavAids');
               var found = false;

               navAid.forEach(navaid => {
                   if(navaid["type"] != "APT" && navaid["ident"] == id) {
                      var name = navaid["ident"];
                      if(navaid["name"]!='' && navaid["name"] != null) name += '('+navaid["name"]+')';

                      aids.addField(name,navaid["lat"]+','+navaid["lon"]);
                      found = true;
                   }
               });

               if(found) message.channel.send(aids);
               else message.channel.send("Didn't find such NavAid");
            } else message.channel.send("Didn't find such NavAid");
         })


 }

 exports.showNATs = function(message) {
		var link = "https://api.flightplandatabase.com/nav/NATS";

        request({
            url: link,
            json: true
        }, function (error, response, NATS) {
             if(!error && response.statusCode != undefined) {
                 const aids = new Discord.MessageEmbed().setColor('#0099ff').setTitle('Active NATS');

                 var available=false;
                 NATS.forEach(nat => {
                        var nodes="**Route:** ";
                        nat["route"]["nodes"].forEach(node => {
                             nodes+=node["ident"]+'('+node["lat"]+","+node["lon"]+') ';
                        });

                        nodes+='\n**West Levels:** ';
                        var found = false;
                        nat["route"]["westLevels"].forEach(level => {
                             found = true;
                             nodes+='FL'+level+' ';
                        });

                        if(!found) nodes+='Not available';

                        nodes+='\n**East Levels:** ';
                        found = false;
                        nat["route"]["eastLevels"].forEach(level => {
                             found = true;
                             nodes+='FL'+level+' ';
                        });

                        if(!found) nodes+='Not available';
                        nodes+='\n**Track Avaibility:** '+nat["validFrom"]+' to '+nat["validTo"]

                        aids.addField(nat["ident"],nodes);
                        available = true;
                 });

                 if(available) message.channel.send(aids);
                 else message.channel.send("No NATs data found");
             } else message.channel.send("No NATs data found TIMEOUT");
        })

 }
