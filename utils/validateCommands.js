const fs = require('fs');
const path = require('path');

function validateCommands() {
    const commandsPath = path.join(__dirname, '../SlashCommands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    console.log('Validating commands...');
    const invalidCommands = [];
    
    for (const file of commandFiles) {
        try {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if (!command.name) {
                invalidCommands.push({ file, reason: 'Missing name property' });
                continue;
            }
            
            if (!command.description) {
                invalidCommands.push({ file, reason: 'Missing description property' });
                continue;
            }
            
            if (command.options && Array.isArray(command.options)) {
                const invalidOptions = command.options.filter(opt => !opt.name || !opt.description || opt.type === undefined);
                if (invalidOptions.length > 0) {
                    invalidCommands.push({ file, reason: 'Invalid option structure' });
                    continue;
                }
            }
            
            console.log(`✅ ${file} - Valid command`);
        } catch (error) {
            invalidCommands.push({ file, reason: `Error loading: ${error.message}` });
        }
    }
    
    if (invalidCommands.length > 0) {
        console.error('\n❌ Invalid commands found:');
        invalidCommands.forEach(cmd => {
            console.error(`- ${cmd.file}: ${cmd.reason}`);
        });
        return false;
    }
    
    console.log('\nAll commands are valid!');
    return true;
}

module.exports = { validateCommands };
