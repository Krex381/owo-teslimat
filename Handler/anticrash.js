const anticrashHandler = (bot) => {
  bot.on('error', (err) => { console.log('Yakalanmamış bir hata oluştu:', err); });
    
    process.on('uncaughtExceptionMonitor', (err, origin) => { console.log(err, origin); });
    
    process.on('rejectionHandled', (err) => { console.log(err); });
    
    process.on('warning', (warning) => { console.log(warning); });
    
    process.on('uncaughtException', (error) => { console.log('Yakalanmamış bir hata oluştu:', error); });
    
    process.on('unhandledRejection', (reason) => { console.log(reason); });
    
    process.on('processTicksAndRejections', (request, reason) => { console.log('Yakalanmamış bir ağ hatası oluştu:', reason); });
    
    process.on('exit', (code) => { console.log(`İşlem ${code} koduyla sonlandırıldı`); });
  };
  
   module.exports = anticrashHandler;