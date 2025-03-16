# 🎮 OwO Cash Teslimat Sistemi

## 📋 Özellikler
- Otomatik OwO Cash teslimatı
- Akıllı bakiye yönetimi ve bölünmüş transfer
- Güvenli kod sistemi
- Detaylı kayıt tutma
- Kullanıcı bazlı kod yönetimi
- Anlık stok takibi
- Otomatik sunucuya girme ve çıkma
- Optimize edilmiş bakiye kontrolü
- Otomatik OwO Cash transferi
- Güvenli token yönetimi

## ⚙️ Kurulum

1. `config.js` dosyasını düzenleyin:
   ```javascript
   module.exports = {
       bot: {
           token: "BOT_TOKEN", // Discord botunuzun tokeni
           id: "BOT_ID", // Botunuzun ID'si
           secret: "BOT_SECRET" // Bot OAuth2 Secret (Discord Developer Portal'dan)
       },
       owo_channel_id: "KANAL_ID", // OwO botunu kullanacağınız kanal ID'si
       owo_id: "408785106942164992", // OwO botunun ID'si (değiştirmeyin)
       ownerID: "SIZIN_ID", // Sizin Discord ID'niz
       per_token_per_cash: "all", // "all" veya belirli bir miktar
   
       web: {
           url: "http://localhost:3001", // Web Adresi (redirect olarak ayarlayın)
           port: 3001, // Web Port
       }
   }
   ```

2. `tokens/tokenler.txt` dosyasını oluşturun ve her satıra bir hesap tokeni ekleyin:
   ```
   TOKEN1
   TOKEN2
   TOKEN3
   ...
   ```

3. Gerekli modülleri yükleyin:
   ```bash
   npm i
   ```

4. Botu başlatın:
   ```bash
   node index.js
   ```

## 🔍 Komutlar

### `/olustur`
- 🎯 **Kullanım**: `/olustur kullanici:@kullanici miktar:1000`
- 📝 **Açıklama**: Belirtilen kullanıcı için OwO Cash kodu oluşturur
- ⚠️ **Not**: Sadece bot sahibi kullanabilir

### `/teslimat`
- 🎯 **Kullanım**: `/teslimat kod:XXXX-XXXX-XXXX-XXXX`
- 📝 **Açıklama**: Kodu kullanarak OwO Cash'i teslim alırsınız
- ✨ **Yeni Özellik**: Akıllı transfer sistemi
  - Büyük miktarlar için otomatik bölünmüş transfer
  - En uygun hesaptan transfer
  - İlerleme durumu takibi
  - Otomatik sunucuya katılma ve çıkma

### `/stok`
- 🎯 **Kullanım**: `/stok`
- 📝 **Açıklama**: Tüm hesapların güncel OwO Cash bakiyelerini gösterir
- 🔄 **Özellik**: Anlık bakiye kontrolü

### `/kodlar`
- 🎯 **Kullanım**: `/kodlar kullanici:@kullanici`
- 📝 **Açıklama**: Kod geçmişini görüntüler
- 🔄 **Özellik**: Yenile butonu ile anlık güncelleme

## 🔐 Güvenlik Önlemleri
1. Kodlar benzersiz ve 20 karakterden oluşur
2. Her kod sadece belirtilen kullanıcı tarafından kullanılabilir
3. Kullanılmış kodlar tekrar kullanılamaz
4. Tüm işlemler kayıt altına alınır
5. Stok kontrolleri ve transfer güvenliği

## ⚡ Akıllı Transfer Sistemi
- Büyük miktarlar için otomatik bölünmüş transfer
- Hesap bakiyelerine göre akıllı dağıtım
- Transfer durumu anlık takip
- Hata durumunda otomatik telafi

## 🚀 Yeni Özellikler
- **Otomatik Sunucuya Girme**: Hesaplar otomatik olarak sunucuya katılır ve işlem bittikten sonra ayrılır
- **Optimize Bakiye Kontrolü**: Bakiye sorguları optimize edilmiş ve mükerrer kontroller kaldırılmıştır
- **Akıllı Token Yönetimi**: Tokenler daha güvenli şekilde yönetilir ve saklanır
- **Discord.js v14 Uyumluluğu**: En son Discord API özellikleriyle uyumlu
- **Performans İyileştirmeleri**: Daha hızlı ve daha güvenilir teslimat işlemi

## ⚠️ Önemli Notlar
- Bot token'ınızı kimseyle paylaşmayın
- OwO Cash hesaplarınızın token'larını güvenli tutun
- Sistem sorunlarında logları kontrol edin
- İşlemler sırasında botun çevrimiçi olduğundan emin olun
- Birden fazla hesap kullanırken bakiyeleri düzenli kontrol edin
- Teslimat sırasında botun sunucuya giriş ve çıkış yapmasına izin verin

## 🆘 Hata Çözümleri
1. **Kod Kullanılamıyor**
   - Kodun size ait olduğundan emin olun
   - Kodun daha önce kullanılmadığını kontrol edin
   - Bot'un çevrimiçi olduğunu doğrulayın

2. **Teslimat Yapılamıyor**
   - Stok durumunu `/stok` ile kontrol edin
   - Hesaplarda yeterli bakiye olduğundan emin olun
   - Transfer limitlerini kontrol edin
   - Sunucu ayarlarında botların katılmasına izin verildiğinden emin olun

3. **Stok Görüntülenemiyor**
   - Hesap tokenlarının geçerli olduğunu kontrol edin
   - OwO botunun çevrimiçi olduğunu doğrulayın
   - Kanal izinlerini kontrol edin

4. **Sunucuya Giriş/Çıkış Sorunları**
   - Sunucu davet ayarlarını kontrol edin
   - Botların sunucuya giriş izninin olduğunu doğrulayın
   - Token'ların geçerliliğini kontrol edin
   - Discord API sınırlamalarını göz önünde bulundurun
