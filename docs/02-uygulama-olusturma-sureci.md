# Uygulamanın Oluşturulma Süreci

Bu doküman, uygulamanın sıfırdan nasıl kurulduğunu ve hangi sırayla geliştirildiğini slaytta anlatmak için hazırlanmıştır. Akış, önce fikir ve mimari kararlarla başladı, sonra backend ve frontend iskeletleri oluşturuldu, en son da güvenlik, CRUD işlemleri ve arayüz iyileştirmeleri tamamlandı.

## 1. Başlangıç Noktası: İhtiyacın Netleştirilmesi

İlk adımda uygulamanın ne yapacağı belirlendi. Hedef, ekiplerin ve bireysel kullanıcıların proje ve görevlerini yönetebileceği bir web uygulaması oluşturmaktı.

Bu aşamada şu temel ihtiyaçlar çıkarıldı:

- Kullanıcı kayıt ve giriş akışı
- JWT tabanlı yetkilendirme
- Proje ve görev yönetimi
- USER ve ADMIN rollerine göre erişim kontrolü
- Kanban benzeri görev görünümü

Bu bölüm önemliydi çünkü sonraki tüm klasör yapısı, endpoint tasarımı ve arayüz kararları bu ihtiyaçlara göre şekillendi.

## 2. Mimari Karar: Projeyi İki Ana Katmana Ayırma

İlk büyük yapısal karar proje kökünü ikiye bölmek oldu:

- `backend`: Spring Boot REST API katmanı
- `frontend`: React tabanlı kullanıcı arayüzü

Bu ayrım sayesinde:

- Sunucu tarafı ve istemci tarafı birbirinden bağımsız geliştirildi.
- API odaklı ilerlemek daha kolay oldu.
- Frontend ile backend farklı hızlarda büyüyebildi.
- Kod okunabilirliği ve bakım kolaylığı arttı.

## 3. Görsel Yönün Belirlenmesi

Uygulamanın tasarım dili baştan netleştirildi. Seçilen yön şu şekildeydi:

- Koyu arka plan
- Sarı ana vurgu
- Mavi yardımcı vurgu
- Yüksek kontrastlı kartlar
- Dashboard hissi veren modern bir düzen

Bu karar sadece görsel tercih değildi; aynı zamanda uygulamanın tüm ekranlarında tutarlı bir ürün hissi oluşturmak için alındı.

## 4. İlk İskeletin Kurulması

Bu aşamada hedef, uygulamanın sadece klasör yapısını değil, çalışabilir ilk temel akışını kurmaktı. Yani henüz tüm özellikler bitmeden, proje açıldığında nereden başlayacağı belli olan bir iskelet oluşturuldu.

Bu iskeletin kurulması önemliydi çünkü sonraki tüm geliştirme adımları artık boş bir klasöre değil, yönü belli bir uygulama çatısına eklendi.

### Backend iskeleti

- Spring Boot tabanlı bir Maven projesi açıldı ve backend için standart Java proje düzeni kuruldu.
- Uygulamanın giriş noktası olan ana sınıf oluşturuldu; böylece Spring Boot uygulaması ayağa kalkabilir hale geldi.
- `application.yml` ile ilk ortam ayarları tanımlandı. Bu dosya daha sonra veritabanı, güvenlik ve port ayarlarının merkezi oldu.
- Backend kodu tek bir klasörde tutulmadı; sorumluluklara göre ayrı paketler açıldı:
	- `domain`: veri modelleri
	- `repository`: veritabanı erişimi
	- `service`: iş mantığı
	- `security`: oturum ve yetkilendirme
	- `web`: HTTP katmanı ve endpoint'ler

Bu ayrım, kodun baştan düzenli büyümesini sağladı.

### Frontend iskeleti

- Vite + React + TypeScript başlangıç yapısı oluşturuldu; böylece hızlı geliştirme ve güçlü tip desteği birlikte geldi.
- İlk giriş noktaları `main.tsx` ve `App.tsx` olarak kuruldu. `main.tsx` sadece uygulamayı başlatan nokta oldu, asıl ekran mantığı `App.tsx` içinde toplandı.
- İlk CSS dosyaları eklendi ve koyu tema, sarı-mavi vurgu dili için temel görsel zemin hazırlandı.
- Arayüz tarafında tek sayfa yerine dashboard mantığı düşünüldü; yani kullanıcı giriş yaptıktan sonra panel düzenine geçecek şekilde temel akış kuruldu.

Bu aşamada amaç, güzel görünen ama henüz tamamlanmamış bir ekran değil; sonraki modülleri taşıyabilecek sağlam bir başlangıç oluşturmak oldu.

Bu aşamanın amacı tam ürün çıkarmak değil, çalışabilir bir iskelet kurmaktı.

## 5. Backend Derleme Sorununu Aşma

İlk teknik engel backend tarafında çıktı. Sistem ortamında Maven doğrudan bulunamadığı için backend derlemesi ilk aşamada çalışmadı.

Bu sorunu çözmek için çalışma alanına yerel bir Maven dağıtımı eklendi ve backend derleme süreci bu yerel araçla devam ettirildi.

Bu adım önemliydi çünkü:

- Kurulum bağımlılığı yerel ortamdan çıkarıldı.
- Backend tekrar üretilebilir hale geldi.
- Sonraki tüm geliştirme adımları derleme ile doğrulanabildi.

## 6. Veri Modelinin Kurulması

İskelet hazır olunca gerçek veri yapıları tanımlandı.

Temel domain nesneleri oluşturuldu:

- `User`
- `Project`
- `Task`
- `BaseEntity`

Bu model uygulamanın omurgası oldu. Çünkü kullanıcı, proje ve görev ilişkileri bu katmanda netleştirildi.

Burada repository katmanı da hazırlandı. Böylece veritabanı erişimi servis katmanından ayrıldı ve kod daha temiz hale geldi.

## 7. Kimlik Doğrulama ve JWT Akışı

Sonraki ana aşama güvenlikti.

Şu parçalar eklendi:

- `POST /auth/register`
- `POST /auth/login`
- BCrypt şifreleme
- JWT üretimi ve doğrulaması
- `GET /users/me`

Bu bölümde amaç sadece giriş yapmak değildi. Token içine kullanıcı bilgilerini taşıyıp oturum yönetimini güvenli hale getirmekti.

Ek olarak principal yapısı düzeltilerek token içinden `userId`, `username` ve `role` bilgileri alınabilir hale getirildi.

## 8. Güvenlik Kuralları ve Erişim Kontrolü

JWT akışından sonra güvenlik katmanı netleştirildi.

Bu aşamada şu kurallar uygulandı:

- Form login kapatıldı.
- HTTP Basic kapatıldı.
- Yetkisiz erişimler için 401 döndürme davranışı belirlendi.
- Rol veya yetki ihlallerinde 403 döndürülmesi sağlandı.
- CORS ve stateless session yapısı ayarlandı.

Bu yapı, frontend ve backend’in sadece API üzerinden konuştuğu temiz bir mimari kurdu.

## 9. Proje ve Görev CRUD Yapısının Eklenmesi

Kimlik doğrulama tamamlandıktan sonra asıl iş alanı geliştirildi.

Eklenen endpoint’ler:

- `POST /projects`
- `GET /projects`
- `GET /projects/{id}`
- `PUT /projects/{id}`
- `DELETE /projects/{id}`
- `POST /projects/{projectId}/tasks`
- `GET /projects/{projectId}/tasks`
- `GET /tasks/{id}`
- `PUT /tasks/{id}`
- `PATCH /tasks/{id}/status`
- `DELETE /tasks/{id}`

Bu bölümde erişim davranışı da rol bazlı kuruldu:

- USER sadece kendi proje ve görev alanlarına erişti.
- ADMIN tüm kayıtlar üzerinde işlem yapabildi.

Bu aşama uygulamanın işlevsel çekirdeğini oluşturdu.

## 10. Frontend Kimlik Akışının Bağlanması

Backend hazır olunca frontend gerçek API’lerle konuşturuldu.

Burada yapılanlar:

- Kayıt ve giriş formları eklendi.
- JWT token `localStorage` içinde saklandı.
- `/users/me` çağrısıyla aktif oturum doğrulandı.
- Giriş sonrası kullanıcı dashboard’a geçirildi.
- Çıkış yapınca tekrar login ekranına dönüldü.

Bu adım önemliydi çünkü artık uygulama sadece statik ekranlar değil, çalışan bir ürün akışı sunuyordu.

## 11. Canlı Doğrulama ve Smoke Test

İlk çalışan sürüm hazır olunca gerçek isteklerle doğrulama yapıldı.

Test edilen akışlar:

- Kullanıcı kaydı
- Kullanıcı girişi
- Mevcut kullanıcı bilgisi alma (`/users/me`)

Bu testler sayesinde auth zincirinin uçtan uca çalıştığı doğrulandı.

## 12. Kullanıcı Yönetimi ve Admin Alanı

Sonra yönetim tarafı tamamlandı.

Eklenen işlemler:

- Kullanıcı listeleme
- Kullanıcı detay görüntüleme
- Rol değiştirme
- Kullanıcı silme

Frontend tarafında da admin paneli açıldı ve bu işlemler arayüzden kullanılabilir hale getirildi.

Bu kısım özellikle ADMIN rolünün sistem içindeki farklı yetkisini görünür hale getirdi.

## 13. Dev Başlangıç Verisi ve Yönetim Testi

Testi kolaylaştırmak için uygulama açılışında dev amaçlı bir admin kullanıcı seed edildi.

Bu sayede:

- Admin ile giriş yapılabildi.
- Kullanıcı listesi görüntülenebildi.
- Rol değiştirme ve silme akışları test edildi.

Bu aşama ürünün sadece çalıştığını değil, yönetim senaryolarını da desteklediğini gösterdi.

## 14. Frontend’i Daha Okunur Hale Getirme

İlk büyük işlevler tamamlandıktan sonra frontend yapısı daha düzenli hale getirildi.

Son durumda yapılan ilk bölme:

- Ortak tipler `frontend/src/app/types.ts` içine taşındı.
- Ortak sabitler `frontend/src/app/constants.ts` içine taşındı.
- Token okuma işlemi `frontend/src/app/storage.ts` içine alındı.

Bu, App dosyasını daha küçük parçalara ayırmanın ilk güvenli adımı oldu.

## 15. Son Durum

Proje sonunda şu yapı ortaya çıktı:

- JWT destekli kullanıcı sistemi
- Role dayalı yetkilendirme
- Proje ve görev CRUD akışları
- Admin kullanıcı yönetimi
- Modern, koyu temalı bir dashboard arayüzü
- Frontend ve backend arasında çalışan canlı entegrasyon

## Slaytta Nasıl Anlatılabilir?

Kısa bir sunum akışı için şu sıra kullanılabilir:

1. İhtiyaçların belirlenmesi
2. Mimari karar ve klasör ayrımı
3. Görsel tasarım yönü
4. Backend ve frontend iskeletinin kurulması
5. Maven/derleme sorunlarının çözülmesi
6. Domain model ve repository katmanı
7. Auth + JWT akışı
8. Güvenlik kuralları
9. Proje ve görev CRUD
10. Frontend entegrasyonu
11. Smoke test ve doğrulama
12. Admin yönetimi
13. Son refactor ve okunabilirlik

Bu yapı, uygulamanın nasıl büyüdüğünü teknik ama anlaşılır bir sırayla anlatmak için uygundur.
