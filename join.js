const fs = require("fs");
const fetch = require("node-fetch");
const config = require("./config.js");
const path = require("path");

async function startDelivery(deliveryData) {
    try {
        let i = 0;
        const delay = 1000;

        console.log(`[Neptune Developments] Sunucu üyeleri kontrol ediliyor...`);
        const guildMembers = new Set();
        
        let after = '';
        let hasMore = true;
        
        while (hasMore) {
            try {
                const response = await fetch(
                    `https://discord.com/api/v10/guilds/${deliveryData.guildId}/members?limit=1000${after ? `&after=${after}` : ''}`,
                    {
                        headers: {
                            authorization: `Bot ${config.bot.token}`,
                        },
                    }
                );

                if (response.status === 429) {
                    const retryAfter = response.headers.get('retry-after') || 5;
                    console.log(`[Neptune Developments] Hız limiti aşıldı. ${retryAfter} saniye sonra tekrar deneniyor...`);
                    await new Promise(r => setTimeout(r, retryAfter * 1000));
                    continue;
                }

                const members = await response.json();
                if (!Array.isArray(members) || members.length === 0) {
                    hasMore = false;
                    continue;
                }

                members.forEach(member => guildMembers.add(member.user.id));
                after = members[members.length - 1].user.id;
            } catch (err) {
                console.error('[Neptune Developments] Üye listesi alınamadı:', err.message);
                hasMore = false;
            }
        }

        console.log(`[Neptune Developments] ${guildMembers.size} mevcut üye tespit edildi.`);
        console.log(`[Neptune Developments] ${deliveryData.memberCount} ${deliveryData.memberType} üye ekleniyor...`);

        const tokenFile = path.join(__dirname, './tokens/tokenler.txt');
        const allTokens = fs.readFileSync(tokenFile, "utf8").split(/\r?\n/).filter(token => token.trim());
        
        const neededTokens = allTokens.slice(0, deliveryData.memberCount);
        
        if (neededTokens.length < deliveryData.memberCount) {
            console.error(`[Neptune Developments] Yetersiz token. Gerekli: ${deliveryData.memberCount}, Mevcut: ${neededTokens.length}`);
            return 0;
        }

        console.log(`[Neptune Developments] ${neededTokens.length} token kullanılacak`);

        for (let j = 0; j < neededTokens.length; j++) {
            const token = neededTokens[j];
            const result = await processToken(token, deliveryData, guildMembers, j);
            
            if (result === 'success') {
                i++;
                console.log(`[Neptune Developments] Token ${j + 1}/${neededTokens.length} başarıyla katıldı`);
            } else {
                console.log(`[Neptune Developments] Token ${j + 1}/${neededTokens.length} başarısız oldu: ${result}`);
            }

            await new Promise(r => setTimeout(r, delay));
        }

        return i;
    } catch (err) {
        console.error("[Neptune Developments - Hata]:", err.message);
        return 0;
    }
}

async function processBatch(batch, deliveryData, guildMembers, currentCount) {
    let successCount = 0;
    const retryTokens = [];
    
    // Initial attempt
    for (const token of batch) {
        if (currentCount + successCount >= deliveryData.memberCount) break;
        
        try {
            const result = await processToken(token, deliveryData, guildMembers, currentCount + successCount);
            if (result === 'retry') retryTokens.push(token);
            if (result === 'success') successCount++;
        } catch (error) {
            console.error(`[Neptune Developments] Token Hatası: ${error.message}`);
        }
    }

    // Retry logic
    for (const token of retryTokens) {
        if (currentCount + successCount >= deliveryData.memberCount) break;
        
        try {
            const result = await processToken(token, deliveryData, guildMembers, currentCount + successCount, true);
            if (result === 'success') successCount++;
        } catch (error) {
            console.error(`[Neptune Developments] Token Retry Hatası: ${error.message}`);
        }
    }

    return { successCount };
}

async function processToken(token, deliveryData, guildMembers, currentCount, isRetry = false) {
    try {
        const base64UserId = token.split('.')[0];
        const userId = Buffer.from(base64UserId, 'base64').toString();
        
        const isMember = await checkIfMember(userId, deliveryData.guildId, isRetry);
        if (isMember) {
            console.log(`[Neptune Developments] Kullanıcı zaten sunucuda: ${userId}`);
            guildMembers.add(userId);
            return 'skip';
        }

        // Add playing status via API call
        try {
            await fetch('https://discord.com/api/v9/users/@me/settings', {
                method: 'PATCH',
                headers: {
                    authorization: token,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    custom_status: {
                        text: "OwO Cash Delivery",
                        emoji_name: "💰"
                    }
                })
            });
            console.log(`[Neptune Developments] ${userId} için durum ayarlandı`);
        } catch (statusErr) {
            console.warn(`[Neptune Developments] Durum ayarlanamadı:`, statusErr.message);
        }

        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=${encodeURIComponent(config.web.url)}&response_type=code&scope=identify%20guilds.join&guild_id=${deliveryData.guildId}`;

        const response = await fetch(authUrl, {
            headers: {
                authorization: token,
                "content-type": "application/json"
            },
            body: JSON.stringify({ permissions: "0", authorize: true }),
            method: "POST"
        });

        // Handle rate limits
        if (response.status === 429) {
            const retryAfter = response.headers.get('retry-after') || 5;
            if (!isRetry) return 'retry';
            console.log(`[Neptune Developments] ${userId} için hız limiti aşıldı. ${retryAfter} saniye sonra tekrar deneniyor...`);
            await new Promise(r => setTimeout(r, retryAfter * 1000));
            return processToken(token, deliveryData, guildMembers, currentCount, true);
        }

        const data = await response.json();
        if (data?.location) {
            const joinResult = await fetch(data.location).then(x => x.json());
            if (joinResult.joined) {
                guildMembers.add(userId);
                console.log(`[Neptune Developments] ${deliveryData.memberType === 'online' ? '🟢' : '⚫'} ${currentCount + 1}/${deliveryData.memberCount} - Üye başarıyla eklendi`);
                return 'success';
            }
        }
        return 'fail';
    } catch (err) {
        console.error(`[Neptune Developments] Token Hatası: ${err.message}`);
        return 'error';
    }
}

async function checkIfMember(userId, guildId, isRetry = false) {
    try {
        const response = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
            headers: {
                authorization: `Bot ${config.bot.token}`,
            },
        });

        if (response.status === 429) {
            const retryAfter = response.headers.get('retry-after') || 5;
            if (!isRetry) {
                console.log(`[Neptune Developments] Üye kontrolü hız limiti. ${retryAfter} saniye sonra tekrar deneniyor...`);
                await new Promise(r => setTimeout(r, retryAfter * 1000));
                return checkIfMember(userId, guildId, true);
            }
            return true;
        }

        return response.ok;
    } catch (error) {
        console.error(`[Neptune Developments] Üye kontrol hatası: ${error.message}`);
        return true;
    }
}

async function verifyToken(token) {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: { authorization: token }
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

module.exports = { startDelivery };