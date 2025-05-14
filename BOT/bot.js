require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');

function initializeBot({ mongoUri, botToken }) {
    const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

    client.once('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
        startScheduler(client);
    });

    async function startScheduler(client) {
        setInterval(async () => {
            try {
                const res = await Booking.find({ scheduleTime: { $lte: new Date() }, isActive: true });

                await Booking.updateMany({ scheduleTime: { $lte: new Date() }, isActive: true }, { $set: { isActive: false } });

                const mentorGroups = res.reduce((groups, booking) => {
                    const mentorId = booking.mentorId;
                    if (!groups[mentorId]) groups[mentorId] = [];
                    groups[mentorId].push(booking.menteeId);
                    return groups;
                }, {});

                for (const mentorId in mentorGroups) {
                    const mentees = mentorGroups[mentorId];

                    const guild = client.guilds.cache.first();
                    if (guild) {
                        const tempChannel = await guild.channels.create({
                            name: `temp-chat-${Date.now()}`,
                            type: 0,
                            permissionOverwrites: [
                                {
                                    id: guild.id,
                                    deny: [PermissionsBitField.Flags.ViewChannel],
                                }
                            ]
                        });

                        const allParticipants = [mentorId, ...mentees];
                        for (const userId of allParticipants) {
                            try {
                                const member = await guild.members.fetch(userId); // Use the numeric snowflake ID
                                if (member) {
                                    await tempChannel.permissionOverwrites.create(member, {
                                        ViewChannel: true,
                                        SendMessages: true
                                    });
                                }
                            } catch (error) {
                                console.error(`Error adding user ${userId} to chat room:`, error);
                            }
                        }

                        // ✅ Fixed mention syntax here
                        tempChannel.send(
                            `Mentor <@${mentorId}> and Mentees ${mentees.map(id => `<@${id}>`).join(', ')} have been added to this chat room!`
                        );
                    }
                }
            } catch (err) {
                console.error('Error fetching scheduled rooms:', err);
            }
        }, 10000); // Every 10s
    }

    client.on('guildMemberAdd', (member) => {
        const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'general');
        if (welcomeChannel) {
            welcomeChannel.send(`Welcome to the server, ${member}!`);
        }
    });

    client.on('messageCreate', async (message) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        if (message.content.startsWith('!create-room')) {
            const [command, ...userMentions] = message.content.split(' ');

            try {
                const tempChannel = await message.guild.channels.create({
                    name: `temp-chat-${Date.now()}`,
                    type: 0,
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        }
                    ]
                });

                const greetedUsers = [];
                for (const mention of userMentions) {
                    const userId = mention.replace(/[<@!>]/g, ''); // This strips out the '@' and '!' symbols to get the numeric ID

                    if (!isNaN(userId)) {
                        try {
                            const member = await message.guild.members.fetch(userId); // Use numeric ID here
                            if (member) {
                                await tempChannel.permissionOverwrites.create(member, {
                                    ViewChannel: true,
                                    SendMessages: true
                                });
                                greetedUsers.push(`<@${member.id}>`);
                            }
                        } catch (error) {
                            console.error('Error fetching member:', error);
                        }
                    } else {
                        message.channel.send(`Invalid user mention: ${mention}`);
                    }
                }

                if (greetedUsers.length > 0) {
                    tempChannel.send(`Hello ${greetedUsers.join(', ')}, welcome to your temporary chat room!`);
                }

                message.channel.send(`Created a temporary chat room: ${tempChannel}`);

            } catch (error) {
                console.error('Error creating the chat room:', error);
                message.channel.send('There was an error creating the chat room.');
            }
        }

        if (message.content.startsWith('!close-room')) {
            if (message.channel.name.startsWith('temp-chat-')) {
                const mentorRole = message.guild.roles.cache.find(role => role.name === 'Mentor');
                if (!mentorRole || !message.member.roles.cache.has(mentorRole.id)) {
                    return message.channel.send("You don't have permission to close this room. Only mentors can do that.");
                }

                try {
                    const generalChannel = message.guild.channels.cache.find(channel => channel.name === 'general');
                    if (generalChannel) {
                        generalChannel.send(`Temporary chat room ${message.channel.name} is being closed by ${message.member.displayName}.`);
                    }

                    await message.channel.delete();
                } catch (error) {
                    console.error('Error deleting the chat room:', error);
                }
            } else {
                message.channel.send('This command can only be used in a temporary chat room.');
            }
        }
    });

    client.login(botToken);

    process.on('exit', () => {
        mongoose.connection.close();
    });
}

module.exports = initializeBot;
