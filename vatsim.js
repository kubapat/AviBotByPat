 const DataHandler = require('vatsim-data-handler');

 const Discord = require('discord.js');

 const {prefix, token} = require('./config.json');
 const client  = new Discord.Client();
 const handler = new DataHandler();

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

  exports.showInfo = function(callsign, message) {
      callsign = callsign.toUpperCase();

      handler.getFlightInfo(callsign).then(el => {
           if(el == undefined) {
                  handler.getControllers().then(data => {
                       var found = false;
                       data.forEach(atc => {
                            if(atc["callsign"] == callsign) {
                                 found = true;
                                 const vatsimMessage = new Discord.MessageEmbed()
                                    .setColor('#0099ff')
                                    .setTitle('Current data for '+callsign)
                                    .addFields(
                                      { name: 'User information:', value: '**Name:** '+atc["member"]["name"]+
                                                            '\n**CID:** '+atc["member"]["cid"]+
                                                            '\n**Server:** '+atc["server"]
                                      }
                                    )
                                    .addFields({
                                       name: 'Operation details:', value: '**Frequency:** '+atc["frequency"]+
                                                                 '\n**ATIS:** '+atc["atis"]
                                    })
                                    .addField('Link','See controller on [VATSIM Map](https://map.vatsim.net)');

                                    message.channel.send(vatsimMessage);
                            }
                       });

                       if(found == false) message.channel.send("User with such callsign isnt active right now");
                  });

           } else {
               const vatsimMessage = new Discord.MessageEmbed()
                             .setColor('#0099ff')
                             .setTitle('Current data for '+callsign)
                             .addFields(
                                 { name: 'User information:', value: '**Name:** '+el["member"]["name"]+
                                                            '\n**CID:** '+el["member"]["cid"]+
                                                            '\n**Server:** '+el["server"]
                                 }
                             )

                             .addFields(
                                 { name: 'Flightplan data', value: '**Departure:** '+el["plan"]["departure"]+
                                                                 '\n**Arrival:** '+el["plan"]["arrival"]+
                                                                 '\n**Aircraft:** '+el["plan"]["aircraft"]+
                                                                 '\n**Flight rules:** '+flightRules[el["plan"]["flight_rules"]]+
                                                                 '\n**Cruising Speed:** '+el["plan"]["cruise_speed"]+
                                                                 '\n**Cruising Level:** '+el["plan"]["altitude"]+
                                                                 '\n**Departure time:** '+el["plan"]["time"]["departure"]+"z"+
                                                                 '\n**Alternate airport:** '+el["plan"]["alternate"]+
                                                                 '\n**Route:** '+el["plan"]["route"]+
                                                                 '\n**Remarks:** '+el["plan"]["remarks"]+
                                                                 '\n**Endurance:** '+el["plan"]["time"]["hours_fuel"]+':'+el["plan"]["time"]["minutes_fuel"]+'h'+
                                                                 '\n**EET:** '+el["plan"]["time"]["hours_enroute"]+':'+el["plan"]["time"]["minutes_enroute"]+'h'
                                 }
                             )

                             .addFields(
                                 { name: 'Current data:', value: '**Latitude: ** '+el["latitude"]+
                                                               '\n**Longitude:** '+el["longitude"]+
                                                               '\n**Altitude:** '+el["altitude"]+'ft'+
                                                               '\n**Heading:** '+el["heading"]+'°'+
                                                               '\n**G/S:** '+el["speed"]+'kts'
                                 }
                             )
                             .addField('Link','See aircraft current position on [Vatsim map](https://map.vatsim.net)');

                             message.channel.send(vatsimMessage);
           }
      });
   }

   exports.showATIS = function(callsign,message) {
                  callsign = callsign.toUpperCase();

                  handler.getControllers().then(data => {
                       var found = false;
                       data.forEach(atc => {
                            if(atc["callsign"] == callsign) {
                                 found = true;
                                 const vatsimMessage = new Discord.MessageEmbed()
                                    .setColor('#0099ff')
                                    .setTitle('ATIS for '+callsign)
                                    .addFields({
                                       name: '**ATIS:**', value: atc["atis"]
                                    })
                                    .addField('Link','See controller on [VATSIM Map](https://map.vatsim.net)');

                                    message.channel.send(vatsimMessage);
                            }
                       });

                       if(found == false) message.channel.send("User with such callsign isnt active right now");
                  });
   }

   exports.showControl = function(icao,message) {
          icao = icao.toUpperCase();
          const vatsimMessage = new Discord.MessageEmbed().setColor('#0099ff');

          var found = false;
          handler.getControllers().then(data => {
                       data.forEach(atc => {
                            if(atc["callsign"].startsWith(icao)) {
                                    found = true;
                                    vatsimMessage.addField(atc["callsign"], '**Frequency:** '+atc["frequency"]);
                            }
                       });

                       if(!found) vatsimMessage.setTitle('No atc services at this airport right now');
                       message.channel.send(vatsimMessage);

          });


   }

