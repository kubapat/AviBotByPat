 const Discord = require('discord.js');
 const {Whazzup} = require('ivao-whazzup');

 const {prefix, token} = require('./config.json');
 const client = new Discord.Client();

 const pilotRatings = ["FS1","FS2","FS3","PP","SPP","CP","ATP","SFI","CFI"];
 const atcRatings   = ["AS1","AS2","AS3","ADC","APC","ACC","SEC","SAI","CAI"];
 const flightRules = {
                        "I": "IFR",
                        "V": "VFR",
                        "Y": "IFR to VFR",
                        "Z": "VFR to IFR"
                     };
 const flightType =  {
                        "S": "Scheduled",
                        "N": "Non-scheduled",
                        "G": "General Aviation",
                        "M": "Military",
                        "X": "Unspecified"
                     };


 function convertTime(minutes) {
          minutes = parseInt(minutes,10);
          var mins  = minutes%60;
          var hours = parseInt(minutes/60,10);

          return hours+":"+mins+"h";
 }


 exports.showInfo = function(callsign, message) {
          callsign = callsign.toUpperCase();
          try {
          Whazzup.fetchData().then(data => {
               var found = false;
               data["pilots"].forEach(el => {
                     if(el["callsign"] == callsign) {
                          found = true;
                          const ivaoMessage = new Discord.MessageEmbed()
                             .setColor('#0099ff')
                             .setTitle('Current data for '+callsign)
                             .addFields(
                                 { name: 'User information:', value: '**VID:** '+el["vid"]+
                                                            '\n**Software:** '+el["softwareName"]+' '+el["softwareVersion"]+
                                                            '\n**Rating:** '+pilotRatings[el["rating"]-2]
                                 }
                             )

                             .addFields(
                                 { name: 'Flightplan data', value: '**Departure:** '+el["departure"]+
                                                                 '\n**Arrival:** '+el["arrival"]+
                                                                 '\n**Aircraft:** '+el["aircraft"]+
                                                                 '\n**Flight rules:** '+flightRules[el["flightRules"]]+
                                                                 '\n**Flight type:** '+flightType[el["flightType"]]+
                                                                 '\n**Cruising Speed:** '+el["cruisingSpeed"]+
                                                                 '\n**Cruising Level:** '+el["cruisingLevel"]+
                                                                 '\n**Departure time:** '+el["departureTime"]+"z"+
                                                                 '\n**Alternate airport:** '+el["alternate"]+
                                                                 (el["alternate2"] != '' ? '\n**2nd alternate airport:** '+el["alternate2"] : '')+
                                                                 '\n**Route:** '+el["route"]+
                                                                 '\n**Remarks:** '+el["remarks"]+
                                                                 '\n**Endurance:** '+convertTime(el["endurace"])+
                                                                 '\n**EET:** '+convertTime(el["enrouteTime"])
                                 }
                             )

                             .addFields(
                                 { name: 'Current data:', value: '**Latitiude: ** '+el["latitiude"]+
                                                               '\n**Longtitude:** '+el["longtitude"]+
                                                               '\n**Altitude:** '+el["altitude"]+'ft'+
                                                               '\n**Heading:** '+el["heading"]+'°'+
                                                               '\n**Squawk:** '+el["squawk"]+
                                                               '\n**G/S:** '+el["groundSpeed"]+'kts'
                                 }
                             )
                             .addField('Link','See aircraft current position on [IVAO Webeye](https://webeye.ivao.aero)');

                             message.channel.send(ivaoMessage);
                     }
               });

               data["atcs"].forEach(el => {
                     if(el["callsign"] == callsign) {
                          found = true;
                          const ivaoMessage = new Discord.MessageEmbed()
                             .setColor('#0099ff')
                             .setTitle('Current data for '+callsign)
                             .addFields(
                                 { name: 'User information:', value: '**VID:** '+el["vid"]+
                                                            '\n**Software:** '+el["softwareName"]+' '+el["softwareVersion"]+
                                                            '\n**Rating:** '+atcRatings[el["rating"]-2]
                                 }
                             )

                             .addFields(
                                 { name: 'Operation details:', value: '**Frequency:** '+el["frequency"]+
                                                                 '\n**ATIS:** '+el["atis"].replace(/^�/g, ' ')
                                 }
                             )
                             .addField('Link','See controller on [IVAO Webeye](https://webeye.ivao.aero)');

                             message.channel.send(ivaoMessage);
                     }
               });

               if(!found) message.channel.send("User with this callsign isnt active right now");

          });
        } catch(e) {
           message.channel.send("User with this callsign isnt active right now");
           if(e != undefined) console.log(e);
        }

 }

 exports.showATIS = function(callsign,message) {
          callsign = callsign.toUpperCase();
          Whazzup.fetchData().then(data => {
               data["atcs"].forEach(el => {
                     if(el["callsign"] == callsign) {
                          const ivaoMessage = new Discord.MessageEmbed()
                             .setColor('#0099ff')
                             .setTitle('ATIS for '+callsign)
                             .addFields(
                                 { name: 'ATIS', value: el["atis"].replace(/^�/g, ' ') }
                             )
                             .addField('Link','See controller on [IVAO Webeye](https://webeye.ivao.aero)');

                             message.channel.send(ivaoMessage);
                     }
               });

          }).catch(error => console.error(error));

 }

 exports.showControl = function(icao,message) {
          icao = icao.toUpperCase();
          const ivaoMessage = new Discord.MessageEmbed().setColor('#0099ff');

          var found = false;
          try {
          Whazzup.fetchData().then(data => {
               data["atcs"].forEach(el => {
                     if(el["callsign"].startsWith(icao)) {
                          found = true;
                          ivaoMessage.addField(el["callsign"], '**Rating:** '+atcRatings[el["rating"]-2]+
                                                                    '\n**Frequency:** '+el["frequency"]);
                     }
               });

               if(!found) ivaoMessage.setTitle('No atc services at this airport right now');

               message.channel.send(ivaoMessage);
          });
          } catch (e) {
               message.channel.send('No atc services at this airport right now');
               if(e != undefined) console.log(e);
          }
 }

 exports.showArrDep = function(icao,message) {
          icao = icao.toUpperCase();
          const ivaoDep = new Discord.MessageEmbed().setColor('#0099ff').setTitle('Departures');
          const ivaoArr = new Discord.MessageEmbed().setColor('#009ff').setTitle('Arrivals');

          Whazzup.fetchData().then(data => {
               data["pilots"].forEach(el => {
                     if(el["departure"] == icao) ivaoDep.addField(el["callsign"],el["aircraft"]+' | '+el["arrival"],true);
                     if(el["arrival"] == icao) ivaoArr.addField(el["callsign"],el["aircraft"]+' | '+el["departure"],true);
               });

               message.channel.send(ivaoDep);
               message.channel.send(ivaoArr);
          }).catch();
 }

