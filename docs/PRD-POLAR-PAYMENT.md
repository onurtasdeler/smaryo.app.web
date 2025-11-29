# PRD: Polar Ödeme Entegrasyonu

**Proje**: VerifyNumber Web
**Versiyon**: 1.0
**Tarih**: 29 Kasım 2024
**Durum**: Aktif Geliştirme

---

## 1. Genel Bakış

### 1.1 Amaç
VerifyNumber platformuna Polar ödeme altyapısı entegre edilerek kullanıcıların güvenli bir şekilde bakiye yüklemesi sağlanacaktır. Kullanıcılar kredi/banka kartı ile ödeme yaparak TRY cinsinden bakiye satın alabilecek ve bu bakiyeyi SMS doğrulama hizmetleri için kullanabilecektir.

### 1.2 Hedefler
- Güvenli ve hızlı ödeme deneyimi
- Otomatik bakiye yükleme (webhook ile)
- Bonus sistemi ile kullanıcı teşviki
- Gerçek zamanlı bakiye güncellemesi
- Ödeme geçmişi ve takibi

### 1.3 Kapsam
| Dahil | Hariç |
|-------|-------|
| Tek seferlik bakiye yükleme | Abonelik sistemi |
| Kredi/Banka kartı ödemeleri | Kripto para ödemeleri |
| Bonus sistemi | İade/Refund işlemleri (v1) |
| Ödeme geçmişi | Fatura kesimi |
| Webhook entegrasyonu | Çoklu para birimi |

---

## 2. Kullanıcı Hikayeleri

### 2.1 Bakiye Yükleme
```
Kullanıcı olarak,
Hesabıma bakiye yüklemek istiyorum,
Böylece SMS doğrulama hizmetlerini satın alabilirim.
```

**Kabul Kriterleri:**
- [ ] Kullanıcı önceden tanımlı paketlerden birini seçebilir
- [ ] Kullanıcı özel tutar girebilir (min ₺10)
- [ ] Bonus oranları görüntülenir
- [ ] Toplam alınacak kredi hesaplanır
- [ ] Ödeme sayfasına yönlendirilir
- [ ] Başarılı ödemede bakiye otomatik güncellenir

### 2.2 Bonus Sistemi
```
Kullanıcı olarak,
Daha yüksek tutarlarda bonus almak istiyorum,
Böylece daha fazla hizmet kullanabilirim.
```

**Kabul Kriterleri:**
- [ ] Bonus oranları açıkça görüntülenir
- [ ] Tutar değiştikçe bonus dinamik hesaplanır
- [ ] Toplam kredi (tutar + bonus) gösterilir

### 2.3 Ödeme Güvenliği
```
Kullanıcı olarak,
Ödemelerimin güvenli olduğunu bilmek istiyorum,
Böylece kart bilgilerimi güvenle girebilirim.
```

**Kabul Kriterleri:**
- [ ] Polar'ın güvenli ödeme sayfası kullanılır
- [ ] Kart bilgileri sistemimizde saklanmaz
- [ ] SSL/TLS şifreleme aktif

---

## 3. Fonksiyonel Gereksinimler

### 3.1 Bakiye Paketleri

| Paket ID | Tutar (₺) | Bonus (%) | Toplam Kredi (₺) |
|----------|-----------|-----------|------------------|
| balance_100 | 100 | 5% | 105 |
| balance_250 | 250 | 10% | 275 |
| balance_500 | 500 | 15% | 575 |
| balance_1000 | 1000 | 20% | 1200 |

**Özel Tutar Kuralları:**
- Minimum: ₺10
- Maximum: ₺10.000
- Bonus hesaplama aynı kademeli yapıda

### 3.2 Ödeme Akışı

```
┌─────────────────────────────────────────────────────────────────┐
│                        ÖDEME AKIŞI                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. KULLANICI                    2. FRONTEND                     │
│  ┌──────────┐                    ┌──────────────┐                │
│  │ Tutar    │ ──────────────────>│ /topup       │                │
│  │ Seçimi   │                    │ Hesaplama    │                │
│  └──────────┘                    └──────┬───────┘                │
│                                         │                        │
│  3. API                                 │                        │
│  ┌──────────────────────────────────────▼───────┐                │
│  │ POST /api/checkout                           │                │
│  │ - userId, packageId/customAmount             │                │
│  │ - Polar checkout session oluştur             │                │
│  │ - Metadata: userId, amount, bonus, total     │                │
│  └──────────────────────────────────────┬───────┘                │
│                                         │                        │
│  4. POLAR                               │                        │
│  ┌──────────────────────────────────────▼───────┐                │
│  │ Checkout sayfası                             │                │
│  │ - Kart bilgileri                             │                │
│  │ - 3D Secure                                  │                │
│  │ - Ödeme işleme                               │                │
│  └──────────────────────────────────────┬───────┘                │
│                                         │                        │
│  5. WEBHOOK                             │                        │
│  ┌──────────────────────────────────────▼───────┐                │
│  │ POST /api/webhook/polar                      │                │
│  │ - checkout.confirmed / order.created         │                │
│  │ - Metadata'dan userId, totalCredits al       │                │
│  │ - Firebase balance güncelle                  │                │
│  │ - Transaction kaydet                         │                │
│  └──────────────────────────────────────┬───────┘                │
│                                         │                        │
│  6. REALTIME                            │                        │
│  ┌──────────────────────────────────────▼───────┐                │
│  │ Firebase onValue()                           │                │
│  │ - Bakiye değişikliği algıla                  │                │
│  │ - UI otomatik güncelle                       │                │
│  └──────────────────────────────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 API Endpoints

#### POST /api/checkout
**Request:**
```typescript
{
  packageId?: string      // Önceden tanımlı paket ID
  customAmount?: number   // Özel tutar (₺)
  userId: string          // Firebase UID
  email?: string          // Kullanıcı email
}
```

**Response (Success):**
```typescript
{
  checkoutUrl: string     // Polar ödeme sayfası URL
  checkoutId: string      // Checkout session ID
  amount: number          // Ödeme tutarı
  bonusPercent: number    // Bonus yüzdesi
  totalCredits: number    // Toplam kredi
}
```

**Response (Error):**
```typescript
{
  error: string           // Hata mesajı (Türkçe)
}
```

#### POST /api/webhook/polar
**Polar Event Types:**
- `checkout.created` - Checkout oluşturuldu (log only)
- `checkout.confirmed` - Ödeme onaylandı → Bakiye güncelle
- `order.created` - Sipariş oluştu → Bakiye güncelle

**Webhook Payload:**
```typescript
{
  type: string
  data: {
    id: string
    metadata: {
      userId: string
      amount: string
      bonusPercent: string
      bonusAmount: string
      totalCredits: string
      packageId: string
    }
  }
}
```

### 3.4 Firebase Veri Yapısı

```
users/
  {userId}/
    profile/
      email: string
      displayName: string
      balance: number        // TRY cinsinden bakiye
      createdAt: string
      lastLoginAt: string
    balance_transactions/
      {transactionId}/
        type: "topup"
        amount: number       // Ödenen tutar
        bonusAmount: number  // Bonus tutarı
        totalCredits: number // Toplam kredi
        previousBalance: number
        newBalance: number
        checkoutId: string
        packageId: string
        source: "polar"
        createdAt: string    // ISO 8601
```

---

## 4. Teknik Gereksinimler

### 4.1 Bağımlılıklar

```json
{
  "@polar-sh/sdk": "^0.41.5",
  "@polar-sh/nextjs": "^0.9.0",
  "@polar-sh/checkout": "^0.1.14",
  "firebase": "^11.0.0",
  "firebase-admin": "^13.6.0"
}
```

### 4.2 Environment Variables

```env
# Polar Configuration
POLAR_ACCESS_TOKEN=          # Polar API erişim tokeni
POLAR_WEBHOOK_SECRET=        # Webhook imza doğrulama
POLAR_PRODUCT_ID=            # Polar'da oluşturulan ürün ID
POLAR_PRICE_ID=              # Fallback price ID

# Firebase Admin (Webhook için)
FIREBASE_SERVICE_ACCOUNT_KEY= # JSON formatında service account

# App Configuration
NEXT_PUBLIC_APP_URL=         # Success redirect için base URL
```

### 4.3 Güvenlik Gereksinimleri

| Gereksinim | Uygulama |
|------------|----------|
| Webhook doğrulama | POLAR_WEBHOOK_SECRET ile HMAC imza kontrolü |
| Kart bilgisi | Sistemde saklanmaz, Polar PCI-DSS uyumlu |
| Firebase erişimi | Service account ile server-side erişim |
| API güvenliği | Server-side API routes, client token yok |
| Rate limiting | Polar tarafında uygulanır |

### 4.4 Hata Yönetimi

| Hata Kodu | Mesaj | Aksiyon |
|-----------|-------|---------|
| 400 | "Kullanıcı kimliği gerekli" | userId eksik |
| 400 | "Geçersiz paket seçimi" | packageId geçersiz |
| 400 | "Minimum yükleme tutarı ₺10" | amount < 10 |
| 500 | "Ödeme oturumu oluşturulurken hata" | Polar API hatası |
| 500 | "Webhook işleme hatası" | Firebase güncelleme hatası |

---

## 5. UI/UX Gereksinimleri

### 5.1 Bakiye Yükleme Sayfası (/topup)

```
┌─────────────────────────────────────────────────────────────┐
│  Bakiye                                                      │
│  Bakiye Yükle                                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Mevcut Bakiye                                              │
│  ₺1.250,00                                                  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Tutar Seçin                                                │
│                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  ₺100   │ │  ₺250   │ │  ₺500   │ │ ₺1000   │           │
│  │  +%5    │ │  +%10   │ │  +%15   │ │  +%20   │           │
│  │         │ │ popüler │ │         │ │         │           │
│  └─────────┘ └────■────┘ └─────────┘ └─────────┘           │
│                                                              │
│  veya özel tutar girin                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ₺ │ Tutar girin (min ₺10)                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Bonus: ₺100+ → +%5  ₺250+ → +%10  ₺500+ → +%15           │
│         ₺1000+ → +%20                                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Toplam Bakiye              │  ┌─────────────────────────┐  │
│  ₺275,00                    │  │     ₺250 Yükle    →    │  │
│  +₺25 bonus                 │  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Başarı Sayfası (/topup/success)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                          ✓                                   │
│                                                              │
│                   Ödeme Başarılı!                           │
│                                                              │
│              Bakiyeniz güncellendi                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Yüklenen: ₺250,00                                  │    │
│  │  Bonus: +₺25,00                                     │    │
│  │  ─────────────────────────                          │    │
│  │  Toplam: ₺275,00                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Yeni Bakiye: ₺1.525,00                                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Aktivasyona Git    →                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 State Yönetimi

| State | Açıklama | UI Etkisi |
|-------|----------|-----------|
| idle | Başlangıç durumu | Form aktif |
| processing | Ödeme işleniyor | Loading spinner, form disabled |
| success | Ödeme başarılı | Success sayfasına redirect |
| error | Hata oluştu | Hata mesajı göster |

---

## 6. Test Gereksinimleri

### 6.1 Birim Testleri

```typescript
// Bonus hesaplama testleri
describe('calculateBonus', () => {
  it('₺100 için %5 bonus hesaplamalı', () => {
    expect(calculateBonus(100)).toEqual({ bonus: 5, total: 105, rate: 5 })
  })

  it('₺250 için %10 bonus hesaplamalı', () => {
    expect(calculateBonus(250)).toEqual({ bonus: 25, total: 275, rate: 10 })
  })

  it('₺99 için bonus olmamalı', () => {
    expect(calculateBonus(99)).toEqual({ bonus: 0, total: 99, rate: 0 })
  })
})
```

### 6.2 Entegrasyon Testleri

| Test | Beklenen Sonuç |
|------|----------------|
| Checkout oluşturma | Polar URL döner |
| Webhook imza doğrulama | Geçersiz imza reddedilir |
| Bakiye güncelleme | Firebase balance artar |
| Transaction kaydı | balance_transactions'a yazılır |

### 6.3 E2E Test Senaryoları

1. **Başarılı Ödeme Akışı**
   - Kullanıcı giriş yapar
   - /topup sayfasına gider
   - ₺250 paket seçer
   - Ödeme yapar (Polar sandbox)
   - Success sayfası görüntülenir
   - Bakiye ₺275 artar

2. **Özel Tutar ile Ödeme**
   - Kullanıcı ₺750 girer
   - %15 bonus hesaplanır
   - Toplam ₺862.50 gösterilir

---

## 7. Geliştirme Fazları

### Faz 1: Temel Entegrasyon (Mevcut ✓)
- [x] Polar SDK kurulumu
- [x] Checkout API endpoint
- [x] Webhook handler
- [x] Firebase bakiye güncelleme
- [x] Temel UI

### Faz 2: Geliştirmeler
- [ ] Ödeme geçmişi sayfası
- [ ] Email bildirim entegrasyonu
- [ ] Transaction detay görüntüleme
- [ ] Hata durumlarında retry mekanizması

### Faz 3: İleri Özellikler
- [ ] İade/Refund desteği
- [ ] Fatura oluşturma
- [ ] Promosyon kodu desteği
- [ ] Abonelik sistemi

---

## 8. Metrikler ve KPI'lar

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| Ödeme başarı oranı | >95% | Başarılı/Toplam checkout |
| Ortalama ödeme süresi | <30sn | Checkout → Success arası |
| Webhook işleme süresi | <5sn | Webhook → Balance update |
| Hata oranı | <2% | Hata sayısı/Toplam işlem |

---

## 9. Riskler ve Azaltma

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Polar API kesintisi | Düşük | Yüksek | Hata mesajı + retry |
| Webhook kayıpları | Düşük | Yüksek | Polar retry mekanizması |
| Duplicate payment | Düşük | Orta | checkoutId kontrolü |
| Firebase write hatası | Düşük | Yüksek | Transaction rollback |

---

## 10. Ekler

### 10.1 Polar Dashboard Gereksinimleri

1. **Ürün Oluşturma**
   - Tip: One-time payment
   - İsim: "VerifyNumber Bakiye"
   - Fiyat: Pay-what-you-want (Custom amount)

2. **Webhook Ayarları**
   - URL: `https://yourdomain.com/api/webhook/polar`
   - Events: checkout.confirmed, order.created

3. **Sandbox Test**
   - Test kartları ile ödeme simülasyonu
   - Webhook test gönderimi

### 10.2 Dosya Yapısı

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/route.ts      # Checkout oluşturma
│   │   └── webhook/polar/route.ts # Webhook handler
│   └── (dashboard)/
│       └── topup/
│           ├── page.tsx           # Bakiye yükleme UI
│           └── success/page.tsx   # Başarı sayfası
├── lib/
│   ├── polar.ts                   # Polar SDK client
│   └── utils.ts                   # calculateBonus()
└── types/
    └── polar.ts                   # Tip tanımları
```

---

**Onay:**
- [ ] Ürün Sahibi
- [ ] Teknik Lider
- [ ] QA Mühendisi
