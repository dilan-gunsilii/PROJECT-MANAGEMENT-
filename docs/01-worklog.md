# Geliştirme Günlüğü

## Aşama 1 - Gereksinim Okuması

- Kimlik doğrulama, kullanıcı yönetimi, proje yönetimi ve görev yönetimi başlıkları ayrıştırıldı.
- Yetki kuralları USER ve ADMIN olarak netleştirildi.
- Validation ve HTTP durum kodları not edildi.

## Aşama 2 - Mimari Karar

- Proje iki klasöre ayrıldı: `backend` ve `frontend`.
- Backend için Spring Boot tabanlı REST API yaklaşımı seçildi.
- Frontend için React tabanlı, koyu temalı ve sarı-mavi ağırlıklı bir dashboard tasarımı planlandı.

## Aşama 3 - İlk İskelet

- Kök seviye proje açıklaması eklendi.
- Backend için Maven/Spring Boot başlangıç yapısı oluşturuldu.
- Frontend için Vite + React + TypeScript başlangıç yapısı ve sarı-mavi görsel tema kuruldu.

## Aşama 4 - Doğrulama

- Frontend üretim derlemesi başarıyla geçti.
- Backend derlemesi bu ortamda çalıştırılamadı; `mvn` PATH üzerinde bulunmadı ve sistemde kurulu Maven tespit edilmedi.
- Bir sonraki backend adımı için Maven wrapper ya da Maven kurulu bir ortam gerekecek.

## Aşama 5 - Maven ile Devam

- Yerel bir Maven dağıtımı çalışma alanına indirildi ve backend bu yolla derlendi.
- JPA domain modeli eklendi: `User`, `Project`, `Task`, `BaseEntity`.
- Repository katmanı ve basit bir sağlık endpoint'i hazırlandı.
- Maven derlemesi yeni backend dosyalarıyla da başarıyla geçti.

## Aşama 6 - Kimlik Doğrulama

- `POST /auth/register` ve `POST /auth/login` endpoint'leri eklendi.
- BCrypt şifreleme ve JWT üretimi/ doğrulaması kuruldu.
- Token içine `userId`, `username` ve `role` bilgileri taşınacak şekilde principal akışı düzeltildi.
- `GET /users/me` endpoint'i eklendi.
- JWT ve güvenlik katmanı yeniden derlenerek doğrulandı.

## Aşama 7 - API Güvenlik Davranışı

- JWT secret ve token süresi uygulama ayarlarına taşındı.
- Form login ve HTTP basic kapatıldı.
- Yetkisiz erişimler için 401, yetkisiz rol/erişim için 403 dönecek şekilde güvenlik zinciri netleştirildi.
- Backend tekrar derlendi ve temiz geçti.

## Aşama 8 - Proje ve Görev CRUD

- `POST /projects`, `GET /projects`, `GET /projects/{id}`, `PUT /projects/{id}`, `DELETE /projects/{id}` eklendi.
- `POST /projects/{projectId}/tasks`, `GET /projects/{projectId}/tasks`, `GET /tasks/{id}`, `PUT /tasks/{id}`, `PATCH /tasks/{id}/status`, `DELETE /tasks/{id}` eklendi.
- USER erişimi sahip olduğu projeler ve görevler üzerinden, ADMIN erişimi tüm kayıtlar üzerinden çalışacak şekilde kuruldu.
- Proje ve görev servisleri derleme ile doğrulandı.

## Aşama 9 - Frontend Kimlik Akışı

- React arayüzüne kayıt ve giriş formları eklendi.
- Frontend, backend auth endpoint'lerine bağlandı.
- JWT token localStorage'da saklanıyor ve `/users/me` ile aktif oturum doğrulanıyor.
- Başarılı giriş sonrası aktif kullanıcı kartı gösteriliyor ve çıkış yapılabiliyor.

## Aşama 10 - Canlı Smoke Test

- Backend jar olarak çalıştırıldı.
- `POST /auth/register`, `POST /auth/login` ve `GET /users/me` istekleri gerçek HTTP çağrılarıyla test edildi.
- Test sonucunda kayıt mesajı, JWT token ve aktif kullanıcı bilgisi beklenen şekilde döndü.

## Aşama 11 - Kullanıcı Yönetimi

- `GET /users`, `GET /users/{id}`, `PUT /users/{id}`, `DELETE /users/{id}` ve `PATCH /users/{id}/role` endpoint'leri eklendi.
- `/users/me` artık kullanıcıyı veritabanından döndürüyor.
- Frontend'de admin için kullanıcı listesi, rol seçimi ve silme aksiyonları eklendi.
- Backend ve frontend yeniden derlenerek doğrulandı.

## Aşama 12 - Admin Smoke Test

- Uygulama başlangıcına dev amaçlı bir admin kullanıcı seed edildi.
- Admin oturumu ile `/users` listesi doğrulandı.
- Normal kullanıcı üzerinde rol değiştirme ve silme akışları canlı backend üzerinde test edildi.
- Kullanıcı yönetimi uçtan uca çalışır durumda doğrulandı.




