# Archcelerate - Quick Reference Card

**Production URL:** https://archcelerate.com
**Hosting:** GCP Compute Engine VM (Docker Compose)

---

## 🚀 Common Commands

### Deploy Updates (on VM)
```bash
# SSH to the VM, then:
cd /srv/archcelerate
git pull
./dev.sh up
```

### View Logs (on VM)
```bash
./dev.sh logs
# or
docker compose logs -f app
docker compose logs -f postgres
```

### Run Migrations (on VM)
```bash
./dev.sh migrate
```

### Health Check
```bash
curl https://archcelerate.com/api/health
```

---

## 🗄️ Database

Postgres runs as the `archcelerate-db` container on the VM (pgvector/pgvector:pg16).

### Connect
```bash
docker compose exec postgres psql -U archcelerate -d archcelerate
```

### Enable pgvector
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 🔴 Redis

Redis runs as the `archcelerate-redis` container on the VM.

```bash
docker compose exec redis redis-cli ping
```

---

## 🔐 Secrets

Secrets are provided via `.env.local` on the VM. See `.env.example` for required keys.

---

## 🌐 Domain & SSL

**Domain:** archcelerate.com
**Registrar:** GoDaddy
**SSL:** Managed by a reverse proxy on the VM (e.g., Caddy or nginx + certbot)

### Check DNS
```bash
dig archcelerate.com A +short
```

---

## 🔄 Rollback

```bash
# On VM
cd /srv/archcelerate
git log --oneline -10
git checkout <previous-sha>
./dev.sh up
```

---

## 🆘 Emergency Procedures

### Application Down
1. SSH to VM, run `./dev.sh logs`
2. Check container status: `docker compose ps`
3. Restart: `./dev.sh restart`
4. Health check: `curl https://archcelerate.com/api/health`

### Database Issues
1. `docker compose logs postgres`
2. `docker compose exec postgres pg_isready -U archcelerate`
3. Connect: `docker compose exec postgres psql -U archcelerate -d archcelerate`

---

## 📞 Support

- **Developer Setup:** `README-DEV.md`
- **Main Docs:** `README.md`
- **Scripts:** `scripts/`
