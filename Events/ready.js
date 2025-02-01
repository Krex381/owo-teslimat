module.exports = {
  name: 'ready',
  async execute(bot) {
    await bot.application.commands.set(bot.arrayOfSlashCommands);

    await bot.user.setPresence({ activities: [{ name: 'By Krex', type: 5 }], status: 'idle' });
  },
};

    // Aktivite Türleri:
    // 0 = OYNUYOR
    // 1 = YAYINDA
    // 2 = DİNLİYOR
    // 3 = İZLİYOR
    // 4 = ÖZEL DURUM
    // 5 = YARIŞIYOR