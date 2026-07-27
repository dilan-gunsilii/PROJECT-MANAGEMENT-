# Backend

Bu klasör Spring Boot REST API katmanını barındırır.

## Planlanan Alanlar

- Authentication
- User yönetimi
- Project yönetimi
- Task yönetimi
- Security ve JWT
- Validation ve global exception handling

## PostgreSQL Kurulumu

Varsayılan çalışma ortamı PostgreSQL kullanır. Lokal kurulum için `backend/docker-compose.yml` içindeki servisi başlatabilir veya aşağıdaki ortam değişkenlerini verebilirsin:

- `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/taskmanager`
- `SPRING_DATASOURCE_USERNAME=taskmanager`
- `SPRING_DATASOURCE_PASSWORD=taskmanager`
- `APP_JWT_SECRET=...`
- `APP_JWT_EXPIRATION_MS=86400000`

Bu değerleri `backend/.env` dosyasında da tutabilirsin; Docker Compose aynı dosyayı otomatik okur.

Testler `test` profili ile H2 üzerinde çalışır; bu sayede `mvn test` canlı PostgreSQL gerektirmez.
