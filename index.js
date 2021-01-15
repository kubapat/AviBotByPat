 const Discord = require('discord.js');

 var express = require('express');
 //var db = require('quick.db')
 var app = express();
 const fs = require('fs');

 const metar   = require('./metar.js');
 const taf     = require('./taf.js');
 const charts  = require('./charts.js');
 const ivao    = require('./ivao.js');
 const vatsim  = require('./vatsim.js');
 const airport = require('./airport.js');
 const admin   = require('./admin.js');

 const {prefix, token} = require('./config.json');
 const client = new Discord.Client();


 const { JsonDB } = require('node-json-db');
 const { Config } = require('node-json-db/dist/lib/JsonDBConfig')


 let port = process.env.PORT;

 function isAlphaNumeric(str) {
  if(str == undefined) return false;
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    if(str[i] == '_') continue;
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
 };

 if(port == null || port == "") {
       port = 8000;
 }

 app.listen(port);

 client.once('ready', () => {
      console.log('Ready for flight');
      admin.setStatus(client);
      let status = setInterval(function() { admin.setStatus(client); },600000); //every 10mins
      //let filek = setInterval(function() { ivao.filek(client); },1200000); //every 20mins
 })

 client.on('message', message => {
      var db = new JsonDB(new Config("Prefixes", true, false, '/'));
      if(message.author.bot || message.channel.type === "dm") return;

      try {
           var serverPrefix = db.getData("/"+message.guild.id.toString());
           //if(!Object.keys(serverPrefix).length) db.push("/"+message.guild.id.toString(),prefix);
           console.log("found "+serverPrefix);
      } catch(err) {
           var serverPrefix = prefix;
           db.push("/"+message.guild.id.toString(),prefix);
      };

      const args = message.content.slice(serverPrefix.length).trim().split(/ +/g);
      const command = args.shift().toLowerCase();
      if((args[0] == undefined && command != "help") || (!isAlphaNumeric(args[0]) && command != "setprefix")) return;

      if(!message.content.startsWith(serverPrefix)) return;
      else if(command == "metar") {
           let icao = args[0];
           metar.showMetar(icao,message);
           if(icao.toUpperCase() == "EPRZ") message.channel.send("https://demotywatory.pl/uploads/201409/1409925253_lzd80t_fb_plus.jpg");
      } else if(command == "taf") {
           let icao = args[0];
           taf.showTaf(icao, message);
      } else if(command == "charts") {
           let icao = args[0];
           charts.sendChart(icao,message);
      } else if(command == "notams") {
           let icao = args[0];
           charts.sendNotam(icao,message);
      } else if(command == "briefing") {
           let icao = args[0];
           metar.showMetar(icao, message);
           taf.showTaf(icao, message);
           charts.sendChart(icao,message);
      } else if(command == "ivao") {
           let callsign = args[0];
           ivao.showInfo(callsign,message);
      } else if(command == "atis") {
           let callsign = args[0];
           if(args[1] == undefined || !isAlphaNumeric(args[1])) return;
           let network  = args[1];

           if(network == undefined || (network.toUpperCase() != "IVAO" && network.toUpperCase() != "VATSIM")) message.channel.send("Invalid network parameter. Use: "+serverPrefix+"atis [CALLSIGN] [NETWORK], where network should be ivao or vatsim");
           else if(network.toUpperCase() == "IVAO") ivao.showATIS(callsign,message);
           else if(network.toUpperCase() == "VATSIM")  message.channel.send("VATSIM support is temporarily disabled!"); //vatsim.showATIS(callsign,message);
           else message.channel.send("Invalid network parameter. Use: "+serverPrefix+"atis [CALLSIGN] [NETWORK], where network should be ivao or vatsim");
      } else if(command == "control") {
           let icao     = args[0];
           let network  = args[1];
           if(args[1] == undefined || !isAlphaNumeric(args[1])) return;

           if(network == undefined || (network.toUpperCase() != "IVAO" && network.toUpperCase() != "VATSIM")) message.channel.send("Invalid network parameter. Use: "+serverPrefix+"control [CALLSIGN] [NETWORK], where network should be ivao or vatsim");
           else if(network.toUpperCase() == "IVAO") ivao.showControl(icao,message);
           else if(network.toUpperCase() == "VATSIM") message.channel.send("VATSIM support is temporarily disabled!"); // vatsim.showControl(icao,message);
           else message.channel.send("Invalid network parameter. Use: "+serverPrefix+"control [CALLSIGN] [NETWORK], where network should be ivao or vatsim");
      } else if(command == "airport") {
           let icao     = args[0];
           ivao.showArrDep(icao,message);
      } else if(command == "active") {
           let icao     = args[0];
           airport.rwyInUse(icao,message);
      } else if(command == "vatsim") {
           //let callsign = args[0];
           //vatsim.showInfo(callsign,message);
           message.channel.send("VATSIM support is temporarily disabled!");
      } else if(command == "navaid") {
           let id       = args[0];
           airport.showNavAids(id,message);
      } else if(command == "nats" && args[0] == "all") {
           airport.showNATs(message);
      } else if(command == "stats") {
           if(message.author.id != "296008952838094848") { //If not executed by JakubPat#9816
                message.channel.send("You're unauthorized to use that command");
                return;
           }
           let type = args[0];
           if(type == "servers") message.channel.send("Currently helping on "+client.guilds.cache.size+" servers :slight_smile:");
           else if(type == "audience") message.channel.send("Helping "+client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)+" freak people :stuck_out_tongue:");
      } else if(command == "setprefix") {
           if(args[1]) {
                message.channel.send("The prefix should be only :one: word!");
                return;
           }

           admin.changePrefix(args[0],message);
      } else if(command == "slawek" && args[0] == "losuj") {
           fs.readFile("wulgaryzmy.json", (err, fileContent) => {
             var data;
             if(!err ) {
                data = JSON.parse(fileContent);
                const keys = Object.keys(data);

                const randIndex = Math.floor(Math.random() * data.length);
				message.channel.send("Sławek to "+data[randIndex]);
             }
           });
      } else {
            const helpMessage = new Discord.MessageEmbed()
                                         .setColor('#0099ff')
                                         .setTitle('AviBot usage')
                                         .addField(
                                                       'Weather commands', '**'+serverPrefix+'metar [ICAO]** - returns current METAR report for airport with given [ICAO] code'+
                                                                         '\n**'+serverPrefix+'taf [ICAP]** - returns current TAF report for airport with given [ICAO] code'
                                         )
                                         .addField(
                                                       'Airport ops commands', '**'+serverPrefix+'charts [ICAO]** - sends latest charts of airport with [ICAO] code to user'+
                                                                             '\n**'+serverPrefix+'notams [ICAO]** - sends latest notams of airport with [ICAO] code to user'+
                                                                             '\n**'+serverPrefix+'active [ICAO]** - returns runways suitable for use based on metar wind direction for airport with [ICAO]'+
                                                                             '\n**'+serverPrefix+'briefing [ICAO]** - combined '+serverPrefix+'metar, '+serverPrefix+'taf and '+serverPrefix+'charts command'
                                         )
                                         .addField(
                                                      'Virtual networks commands', '**'+serverPrefix+'ivao [CALLSIGN]** - returns data of active user with [CALLSIGN] on IVAO network'+
                                                                                 '\n**'+serverPrefix+'vatsim [CALLSIGN]** - returns data of active user with [CALLSIGN] on vatsim network'+
                                                                                 '\n**'+serverPrefix+'atis [CALLSIGN] [NETWORK]** - returns ATIS for controller with [CALLSIGN] on IVAO or VATSIM depending on [NETWORK] parameter (IVAO/VATSIM)'+
                                                                                 '\n**'+serverPrefix+'control [ICAO] [NETWORK]** - returns list of logged controllers on airport [ICAO] on IVAO or VATSIM depending on [NETWORK] parameter (IVAO/VATSIM)'+
                                                                                 '\n**'+serverPrefix+'airport [ICAO]** - returns arrivals and departures for airport with [ICAO] on IVAO network'
                                         )
                                         .addField(
                                                      'Navigation commands', '**'+serverPrefix+'navaid [NAME]** - returns name and position of given NavAid'+
                                                                             '\n**'+serverPrefix+'nats all** - returns all current NATs (North Atlatic Tracks)'
                                         )
                                         .addField(
                                                      'Admin commands','**'+serverPrefix+'setprefix [PREFIX]** - establishes new server custom prefix as [PREFIX]'
                                         )
                                         .setFooter('In case of errors/bugs or development ideas contact me via mail on jakubpat@protonmail.com');

          message.channel.send(helpMessage);
      }
 })

 client.login(token);
