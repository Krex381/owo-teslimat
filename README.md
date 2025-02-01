# 🎮 OwO Cash Teslimat Sistemi

## 📋 Özellikler
- Otomatik OwO Cash teslimatı
- Akıllı bakiye yönetimi ve bölünmüş transfer
- Güvenli kod sistemi
- Detaylı kayıt tutma
- Kullanıcı bazlı kod yönetimi
- Anlık stok takibi

## ⚙️ Kurulum

1. `config.json` dosyasını düzenleyin:
   ```json
   {
     "token": "BOT_TOKEN",
     "ownerID": "SIZIN_ID",
     "account_tokens": ["TOKEN1", "TOKEN2", "TOKEN3"],
     "owo_channel_id": "KANAL_ID",
     "owo_id": "408785106942164992",
     "per_token_per_cash": "all"
   }
   ```

2. Gerekli modülleri yükleyin:
   ```bash
   npm i
   ```

3. Botu başlatın:
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

## ⚠️ Önemli Notlar
- Bot token'ınızı kimseyle paylaşmayın
- OwO Cash hesaplarınızın token'larını güvenli tutun
- Sistem sorunlarında logları kontrol edin
- İşlemler sırasında botun çevrimiçi olduğundan emin olun
- Birden fazla hesap kullanırken bakiyeleri düzenli kontrol edin

## 🆘 Hata Çözümleri
1. **Kod Kullanılamıyor**
   - Kodun size ait olduğundan emin olun
   - Kodun daha önce kullanılmadığını kontrol edin
   - Bot'un çevrimiçi olduğunu doğrulayın

2. **Teslimat Yapılamıyor**
   - Stok durumunu `/stok` ile kontrol edin
   - Hesaplarda yeterli bakiye olduğundan emin olun
   - Transfer limitlerini kontrol edin

3. **Stok Görüntülenemiyor**
   - Hesap tokenlarının geçerli olduğunu kontrol edin
   - OwO botunun çevrimiçi olduğunu doğrulayın
   - Kanal izinlerini kontrol edin
