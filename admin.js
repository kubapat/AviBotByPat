 const Discord = require('discord.js');
 const {prefix, token} = require('./config.json');
 const client = new Discord.Client();
 const https = require('https');

 const { JsonDB } = require('node-json-db');
 const { Config } = require('node-json-db/dist/lib/JsonDBConfig')


 exports.changePrefix = function(newPrefix,message) {
     var db = new JsonDB(new Config("Prefixes", true, false, '/'));
     if(!message.member.hasPermission("MANAGE_GUILD")) {
           message.channel.send(":no_entry: You need to have 'Manage Server' permission in order to change the prefix!");
           return;
     }

     db.push("/"+message.guild.id.toString(),newPrefix);
     message.channel.send("Yay! :partying_face: You've successfully changed the AviBot's prefix to **"+newPrefix+"**");
 }

 exports.setStatus = function(client) {
     client.user.setActivity(client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)+" users on "+client.guilds.cache.size+" servers", { type: 'LISTENING'})
       .catch(console.error);
 }
