# 🧭 Pusula — Test Management

TestRail benzeri, test senaryolarını yönetmek için geliştirilmiş web uygulaması.

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 19, Vite, Ant Design 5 |
| Backend | Node.js, Express |
| Veritabanı | Microsoft SQL Server |

## Özellikler

- **Proje Yönetimi** — Proje oluşturma, düzenleme ve silme
- **Test Senaryoları** — Başlık, açıklama, ön koşul, öncelik, tip ve durum alanları
- **Adım Editörü** — Aksiyon ve beklenen sonuç içeren, sıralı test adımları
- **Filtreleme** — Öncelik, tip ve duruma göre filtreleme; başlık araması
- **İstatistikler** — Proje bazında aktif/taslak/geçersiz senaryo sayıları

## Kurulum

### Gereksinimler

- Node.js 18+
- Microsoft SQL Server (ya da Docker)

### 1. Repoyu klonlayın

```bash
git clone git@github.com:kadiratali/Pusula.git
cd Pusula
```

### 2. Veritabanını başlatın (Docker ile)

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Pusula123!" \
  -p 1433:1433 --name pusula-mssql \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### 3. Server kurulumu

```bash
cd server
npm install
```

`.env` dosyası oluşturun:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=master
DB_USER=sa
DB_PASSWORD=Pusula123!
PORT=3001
```

Tabloları oluşturun:

```bash
npm run init-db
```

Sunucuyu başlatın:

```bash
npm run dev
```

### 4. Client kurulumu

```bash
cd client
npm install
npm run dev
```

Uygulama **http://localhost:5173** adresinde çalışır.

## Proje Yapısı

```
Pusula/
├── server/
│   └── src/
│       ├── config/
│       │   ├── db.js          # MSSQL bağlantısı
│       │   └── initDb.js      # Tablo oluşturma scripti
│       ├── routes/
│       │   ├── projects.js    # Proje API'leri
│       │   └── testCases.js   # Senaryo ve adım API'leri
│       └── index.js
└── client/
    └── src/
        ├── api/               # Axios endpoint fonksiyonları
        └── pages/
            ├── Projects.jsx        # Proje listesi
            ├── ProjectDetail.jsx   # Senaryo listesi
            └── TestCaseDetail.jsx  # Senaryo detay & adım editörü
```

## API Endpointleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/projects` | Tüm projeler |
| POST | `/api/projects` | Proje oluştur |
| PUT | `/api/projects/:id` | Proje güncelle |
| DELETE | `/api/projects/:id` | Proje sil |
| GET | `/api/projects/:pid/cases` | Projedeki senaryolar |
| POST | `/api/projects/:pid/cases` | Senaryo oluştur |
| GET | `/api/cases/:id` | Senaryo + adımlar |
| PUT | `/api/cases/:id` | Senaryo güncelle |
| DELETE | `/api/cases/:id` | Senaryo sil |
| PUT | `/api/cases/:id/steps` | Adımları toplu kaydet |
