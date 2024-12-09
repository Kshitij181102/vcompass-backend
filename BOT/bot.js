require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const mongoose = require('mongoose');
const Booking = require('../models/Booking'); 
const options = {
    timeZone: 'Asia/Kolkata', // Time zone for IST
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // Use 24-hour format
};

// Initialize Discord Bot Client with required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI2, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to Bot"))
.catch(err => console.error("MongoDB connection error:", err));

// Event: Bot Ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // Start the scheduler
    startScheduler();
});

// Function to start checking the database for scheduled times and updating `isActive`
async function startScheduler() {
    setInterval(async () => {
        try {
            // Fetch active sessions where the scheduled time is in the past or right now
            const res = await Booking.find({ scheduleTime: { $lte: new Date() }, isActive: true });

          

            // Deactivate past scheduled sessions by setting isActive = false
            await Booking.updateMany({ scheduleTime: { $lte: new Date() }, isActive: true }, { $set: { isActive: false } });
            
            // Group bookings by mentor and handle multiple mentees
            const mentorGroups = res.reduce((groups, booking) => {
                const mentorId = booking.mentorId;
                if (!groups[mentorId]) groups[mentorId] = [];
                groups[mentorId].push(booking.menteeId);
                return groups;
            }, {});

            for (const mentorId in mentorGroups) {
                const mentees = mentorGroups[mentorId];

                // Get the guild (server)
                const guild = client.guilds.cache.first(); // Adjust to select the correct guild
                if (guild) {
                    // Create a temporary chat room
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

                    // Add mentor and mentees to the temporary chat room
                    const allParticipants = [mentorId, ...mentees];
                    for (const userId of allParticipants) {
                        try {
                            const member = await guild.members.fetch(userId);
                            if (member) {
                                await tempChannel.permissionOverwrites.create(member, { ViewChannel: true, SendMessages: true });
                            }
                        } catch (error) {
                            console.error(`Error adding user ${userId} to chat room:`, error);
                        }
                    }

                    // Notify in the channel
                    tempChannel.send(`Mentor @${mentorId} and Mentees ${mentees.map(id => `@${id}`).join(', ')} have been added to this chat room!`);
                }
            }
        } catch (err) {
            console.error('Error fetching scheduled rooms:', err);
        }
    }, 10000); // Check every 10 seconds (10000 ms)
}

// Event: Greet new members
client.on('guildMemberAdd', (member) => {
    const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'general'); // Modify to your welcome channel
    if (welcomeChannel) {
        welcomeChannel.send(`Welcome to the server, ${member}!`);
    }
});

// Command to create a temporary chat room
client.on('messageCreate', async (message) => {
    // Ensure only admins can use the command to create rooms
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    // Create room command (e.g., !create-room @user1 @user2)
    if (message.content.startsWith('!create-room')) {
        const [command, ...userMentions] = message.content.split(' ');

        try {
            // Create a temporary text channel
            const tempChannel = await message.guild.channels.create({
                name: `temp-chat-${Date.now()}`,
                type: 0,  // 0 is for text channels
                permissionOverwrites: [
                    {
                        id: message.guild.id, // Deny @everyone from accessing it
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    }
                ]
            });

            // Add the mentioned users to the temporary chat room and greet them
            const greetedUsers = [];
            for (const mention of userMentions) {
                const userId = mention.replace(/[<@!>]/g, '');  // Get user ID from mention

                // Check if the userId is valid
                if (!isNaN(userId)) {  // Ensure it's a number
                    try {
                        const member = await message.guild.members.fetch(userId);
                        if (member) {
                            await tempChannel.permissionOverwrites.create(member, { ViewChannel: true, SendMessages: true });
                            greetedUsers.push(member.displayName);  // Store user names for greeting
                        }
                    } catch (error) {
                        console.error('Error fetching member:', error);
                    }
                } else {
                    message.channel.send(`Invalid user mention: ${mention}`);
                }
            }

            // Greet all users added to the channel
            if (greetedUsers.length > 0) {
                tempChannel.send(`Hello ${greetedUsers.join(', ')}, welcome to your temporary chat room!`);
            }

            // Notify in the general chat
            message.channel.send(`Created a temporary chat room: ${tempChannel}`);

        } catch (error) {
            console.error('Error creating the chat room:', error);
            message.channel.send('There was an error creating the chat room.');
        }
    }

    // Command to close the room within the room itself, but only mentors can close
    if (message.content.startsWith('!close-room')) {
        // Check if the message was sent in a temporary room
        if (message.channel.name.startsWith('temp-chat-')) {
            // Verify if the user has the "Mentor" role
            const mentorRole = message.guild.roles.cache.find(role => role.name === 'Mentor');
            if (!mentorRole || !message.member.roles.cache.has(mentorRole.id)) {
                return message.channel.send("You don't have permission to close this room. Only mentors can do that.");
            }

            try {
                // Notify in a different channel before deleting the chat room
                const generalChannel = message.guild.channels.cache.find(channel => channel.name === 'general'); // Modify to your general channel
                if (generalChannel) {
                    generalChannel.send(`Temporary chat room ${message.channel.name} is being closed by ${message.member.displayName}.`);
                }

                // Delete the channel in which the message was sent
                await message.channel.delete();
            } catch (error) {
                console.error('Error deleting the chat room:', error);
            }
        } else {
            message.channel.send('This command can only be used in a temporary chat room.');
        }
    }
});

// Log in to Discord with your bot token
client.login(process.env.BOT_TOKEN);

// Make sure to close the database connection on exit
process.on('exit', () => {
    mongoose.connection.close();
});
