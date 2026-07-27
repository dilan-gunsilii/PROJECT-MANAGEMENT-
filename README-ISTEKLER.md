# Proje Isterleri (Detayli)

Bu dokuman, proje kod tabaninda ve mevcut dokumantasyonda bulunan tum isterleri tek yerde toplar.

## 1) Kapsam

1. Uygulama, bireysel ve takim bazli proje-gorev yonetimi icin web tabanli bir platform sunar.
2. Mimari iki ana parcadan olusur: backend REST API ve frontend React istemcisi.
3. Uygulama temel olarak su alanlari kapsar: kimlik dogrulama, yetkilendirme, kullanici yonetimi, proje yonetimi, gorev yonetimi, takim calisma alani.

## 2) Roller ve Yetki Modeli

1. Sistemde iki rol vardir: USER ve ADMIN.
2. USER, kendi erisebildigi proje ve gorevlerde islem yapabilir.
3. ADMIN, tum kayitlar uzerinde islem yapabilir.
4. Bazi endpointler sadece ADMIN rolune aciktir (ornek: kullanici listeleme, rol degistirme, kullanici silme).

## 3) Fonksiyonel Isterler - Kimlik ve Oturum

1. Kullanici kaydi yapilabilmelidir.
2. Kullanici email ve sifre ile giris yapabilmelidir.
3. Giris sonrasi JWT token uretilmeli ve istemciye donulmelidir.
4. Istemci token'i localStorage icinde saklamalidir.
5. Uygulama acilisinda token varsa mevcut oturum /users/me ile dogrulanmalidir.
6. Cikis yapildiginda token silinmeli ve ekran login durumuna donmelidir.

## 4) Fonksiyonel Isterler - Kullanici Profili ve Yonetim

1. Giris yapan kullanici kendi profilini gorebilmelidir.
2. Giris yapan kullanici kendi username, email ve opsiyonel sifresini guncelleyebilmelidir.
3. Sistem kullaniciyi username veya email ile resolve edebilmelidir (takim uye ekleme akisi icin).
4. ADMIN tum kullanicilari listeleyebilmelidir.
5. ADMIN tekil kullanici detayini gorebilmelidir.
6. ADMIN kullanici bilgisi guncelleyebilmelidir.
7. ADMIN kullanici rolunu degistirebilmelidir.
8. ADMIN kullanici silebilmelidir.

## 5) Fonksiyonel Isterler - Proje Yonetimi

1. Proje olusturma desteklenmelidir.
2. Proje listeleme desteklenmelidir.
3. Proje detay goruntuleme desteklenmelidir.
4. Proje guncelleme desteklenmelidir.
5. Proje silme desteklenmelidir.
6. USER sadece kendi projelerine erisebilmelidir.
7. ADMIN tum projelere erisebilmelidir.
8. Frontend bireysel alanda proje secimi ve proje adi guncellemesi yapabilmelidir.
9. Frontend takim alaninda proje secimi, proje olusturma ve proje silme yapabilmelidir.

## 6) Fonksiyonel Isterler - Gorev Yonetimi

1. Proje altinda gorev olusturma desteklenmelidir.
2. Proje altinda gorev listeleme desteklenmelidir.
3. Tekil gorev goruntuleme desteklenmelidir.
4. Gorev guncelleme desteklenmelidir.
5. Gorev durumunu patch ile guncelleme desteklenmelidir.
6. Gorev silme desteklenmelidir.
7. Gorevlerin TODO, IN_PROGRESS, DONE durumlari olmalidir.
8. Frontend Kanban board mantigi ile gorevleri kolonlarda gostermelidir.
9. Frontend drag-drop ile gorev kolonu degistirebilmelidir.
10. Durum degisikligi backend id'si sayisal gorevlerde API uzerinden kalici hale getirilmelidir.

## 7) Fonksiyonel Isterler - Takim Calisma Alani

1. Takim gorunumu ayri bir panel olarak sunulmalidir.
2. Takim projesi olusturma akisinda ekip uyeleri belirlenebilmelidir.
3. Takim gorevi olusturma akisinda assignee secilebilmelidir.
4. Takim gorevlerinde gorunurluk listesi (visible user list) tanimlanabilmelidir.
5. Takim gorevleri PUBLIC veya PRIVATE isbirligi modu ile etiketlenebilmelidir.
6. PRIVATE gorevlerde duzenleme/silme/tasima islemleri sadece admin tarafindan yapilabilmelidir.
7. En az bir admin uyenin korunmasi kurali uygulanmalidir.
8. Admin olmayan kullanici, yalnizca kurallara uygun gorunen takim gorevlerini gorebilmelidir.

## 8) API Isterleri (Route Kontrati)

### 8.1 Auth

| Method | Route | Aciklama | Erisim |
|---|---|---|---|
| POST | /auth/register | Yeni kullanici kaydi | Public |
| POST | /auth/login | JWT token alma | Public |

### 8.2 Users

| Method | Route | Aciklama | Erisim |
|---|---|---|---|
| GET | /users/me | Aktif kullanici bilgisi | Authenticated |
| PUT | /users/me | Aktif kullanici guncelleme | Authenticated |
| GET | /users/resolve?identity=... | Username/email ile kullanici bulma | Authenticated |
| GET | /users | Tum kullanicilar | ADMIN |
| GET | /users/{id} | Tekil kullanici | ADMIN |
| PUT | /users/{id} | Kullanici guncelleme | ADMIN |
| DELETE | /users/{id} | Kullanici silme | ADMIN |
| PATCH | /users/{id}/role | Rol degistirme | ADMIN |

### 8.3 Projects

| Method | Route | Aciklama | Erisim |
|---|---|---|---|
| POST | /projects | Proje olusturma | Authenticated |
| GET | /projects | Proje listeleme | Authenticated |
| GET | /projects/{id} | Proje detayi | Authenticated (kural kontrollu) |
| PUT | /projects/{id} | Proje guncelleme | Authenticated (kural kontrollu) |
| DELETE | /projects/{id} | Proje silme | Authenticated (kural kontrollu) |

### 8.4 Tasks

| Method | Route | Aciklama | Erisim |
|---|---|---|---|
| POST | /projects/{projectId}/tasks | Gorev olusturma | Authenticated (kural kontrollu) |
| GET | /projects/{projectId}/tasks | Proje gorevleri | Authenticated (kural kontrollu) |
| GET | /tasks/{id} | Gorev detayi | Authenticated (kural kontrollu) |
| PUT | /tasks/{id} | Gorev guncelleme | Authenticated (kural kontrollu) |
| PATCH | /tasks/{id}/status | Gorev durumu guncelleme | Authenticated (kural kontrollu) |
| DELETE | /tasks/{id} | Gorev silme | Authenticated (kural kontrollu) |

### 8.5 Sistem/Saglik

| Method | Route | Aciklama | Erisim |
|---|---|---|---|
| GET | /api/status | API saglik/status kontrolu | Public |

## 9) Guvenlik Isterleri

1. Tum endpointler varsayilan olarak authentication istemelidir.
2. Sadece /auth/**, /api/status ve h2-console public olmalidir.
3. Session yonetimi stateless olmalidir.
4. JWT filtresi username/password filtresinden once calismalidir.
5. Form login ve HTTP basic devre disi olmalidir.
6. Yetkisiz (unauthenticated) erisimler 401 donmelidir.
7. Yetkisi olmayan (forbidden) erisimler 403 donmelidir.
8. Parolalar BCrypt ile hashlenmelidir.
9. CORS localhost gelistirme senaryolarini desteklemelidir.

## 10) Veri ve Dogrulama Isterleri

1. Register request icinde username, email, password zorunlu olmalidir.
2. Login request email ve password ile calismalidir.
3. Proje olusturmada name zorunlu olmalidir.
4. Gorev olusturmada title ve status zorunlu olmalidir.
5. Gorev status alaninda TODO, IN_PROGRESS, DONE degerleri kullanilmalidir.
6. Validation hatalari field bazli 400 cevabi ile donmelidir.
7. Illegal argument ve benzeri is kurali ihlalleri 400 ile donmelidir.

## 11) Calistirma ve Ortam Isterleri

1. Frontend gelistirme sunucusu npm run dev ile 5173 portunda calisabilmelidir.
2. Backend 8080 portunda calisabilmelidir.
3. run-backend.bat, postgres container baslatmayi denemeli ve backend jar'i calistirmalidir.
4. run-frontend.bat, frontend dev server'i baslatmalidir.
5. run-all.bat, backend ve frontend'i ayri pencerelerde baslatmalidir.
6. docker-compose ile postgres servisi tanimli olmalidir.
7. Backend varsayilan datasource H2 in-memory olarak calisabilmeli, env ile PostgreSQL'e gecilebilmelidir.

## 12) Baslangic Verisi Isteri

1. Gelistirme kolayligi icin admin seed kullanicisi bulunmalidir.
2. Seed kullanici email: admin@taskmanager.local
3. Seed kullanici sifre: Admin123!
4. Seed mekanizmasi, ayni email varsa tekrar kayit olusturmamalidir.

## 13) UI/UX Isterleri

1. Uygulama login ve dashboard ekranlari arasinda net bir akis sunmalidir.
2. Dashboard iki ana moda sahip olmalidir: Bireysel ve Takim.
3. Bireysel modda arama, proje secimi, yeni proje ve yeni gorev olusturma islemleri olmali.
4. Gorev olusturma modalinda alt gorev/checklist girisi desteklenmeli.
5. Takim modunda ekip uyeleri, proje secimi ve gorev kolonlari gorunur olmalidir.
6. Koyu tema, sari ana vurgu ve mavi ikincil vurgu korunmalidir.

## 14) Test ve Dogrulama Isterleri

1. En az bir smoke test auth + project + task zincirini dogrulamalidir.
2. Smoke test su akisi dogrulamalidir: register -> login -> /users/me -> project create -> task create -> task status patch -> task delete -> project delete.
3. Test profili H2 ile calisabilmeli ve dis database bagimliligini azaltmalidir.

## 15) Mevcut Durum Notu (Onemli)

1. Kod tabaninda bazi dashboard view isimleri (projelerim, yonetim) tanimli olsa da bu ekranlar su anda placeholder durumundadir.
2. Frontend request katmaninda kullanilan endpointler su an agirlikla auth, users/me, users/resolve, project create/delete, task delete, task status patch akislarina baglidir.
3. Bu dokuman, projede bulunan isterleri kod + dokuman kaynaklarina gore derler; roadmap maddeleriyle karistirilmamasi icin placeholder alanlar ayrica notlanmistir.

## 16) Kaynaklar

1. docs/00-project-brief.md
2. docs/01-worklog.md
3. docs/02-uygulama-olusturma-sureci.md
4. backend/src/main/java/com/taskmanager/**
5. backend/src/test/java/com/taskmanager/ApiSmokeTests.java
6. backend/src/main/resources/application.yml
7. frontend/src/App.tsx
8. frontend/src/app/types.ts
9. frontend/src/app/constants.ts
10. run-all.bat, run-backend.bat, run-frontend.bat
