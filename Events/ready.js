const { ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ready',
    once: true,
    execute: async (client) => {
        console.log(`[${client.user.username}] join.js modülü yüklendi`);

        try {
            
            if (!client.commands) {
                client.commands = new Map();
                
                
                const commandsPath = path.join(__dirname, '../SlashCommands');
                
                
                if (fs.existsSync(commandsPath)) {
                    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
                    
                    for (const file of commandFiles) {
                        const filePath = path.join(commandsPath, file);
                        try {
                            const command = require(filePath);
                            
                            
                            if (command.name && command.description) {
                                client.commands.set(command.name, command);
                                console.log(`✅ Komut yüklendi: ${command.name}`);
                            } else {
                                console.warn(`⚠️ Geçersiz komut yapısı: ${file}`);
                            }
                        } catch (error) {
                            console.error(`❌ Komut yüklenirken hata: ${file}`, error);
                        }
                    }
                } else {
                    console.warn('SlashCommands klasörü bulunamadı!');
                }
            }

            
            const commands = Array.from(client.commands.values()).map(cmd => {
                
                return {
                    name: cmd.name,
                    description: cmd.description || 'Açıklama yok',
                    options: cmd.options || [],
                    dm_permission: cmd.dm_permission === undefined ? false : cmd.dm_permission
                };
            });
            
            if (commands.length > 0) {
                
                await client.application.commands.set(commands);
                console.log(`${commands.length} komut yüklendi!`);
            } else {
                console.warn('Kayıt edilecek komut bulunamadı!');
            }
        } catch (error) {
            console.error('Komut yükleme hatası:', error);
        }

        
        client.user.setActivity({
            name: '🌟 OwO Cash Teslimat',
            type: ActivityType.Playing
        });
    }
};