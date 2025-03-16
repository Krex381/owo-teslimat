const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = (client) => {
    
    client.commands = new Collection();
    
    
    const commandsPath = path.join(__dirname, '../SlashCommands');
    
    
    if (!fs.existsSync(commandsPath)) {
        console.error('SlashCommands directory does not exist!');
        return;
    }
    
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    console.log(`Loading ${commandFiles.length} commands...`);
    
    for (const file of commandFiles) {
        try {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            
            if (command.name && command.description) {
                client.commands.set(command.name, command);
                console.log(`✅ Loaded command: ${command.name}`);
            } else {
                console.warn(`⚠️ Invalid command structure in ${file}. Missing name or description.`);
            }
        } catch (error) {
            console.error(`❌ Failed to load command from ${file}:`, error);
        }
    }
    
    console.log(`Successfully loaded ${client.commands.size} commands.`);
};
