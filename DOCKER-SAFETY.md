# ⚠️  Docker Data Safety Guide

## 🚨 CRITICAL: Preventing Data Loss

### ❌ NEVER Run These Commands (They Delete Your Data)

```bash
docker-compose down -v              # ❌ Deletes volumes!
docker-compose down --volumes       # ❌ Same as above!
docker system prune -a --volumes    # ❌ Wipes everything!
docker volume prune                 # ❌ Deletes unused volumes!
docker volume rm archcelerate_*     # ❌ Manual deletion!
```

### ✅ ALWAYS Use These Safe Commands

```bash
# Use the safe wrapper script:
./docker-safe-commands.sh stop      # ✅ Stops services, keeps data
./docker-safe-commands.sh restart   # ✅ Restarts services
./docker-safe-commands.sh rebuild   # ✅ Rebuilds app, keeps data

# Or use docker-compose without -v:
docker-compose down                 # ✅ Safe - keeps volumes
docker-compose restart              # ✅ Safe
docker-compose up -d --build        # ✅ Safe - rebuilds code
```

## 💾 Backup Strategy

### Automatic Daily Backups (Recommended)

Add to crontab:
```bash
# Edit crontab
crontab -e

# Add this line for daily backups at 2 AM:
0 2 * * * cd /path/to/archcelerate && ./docker-safe-commands.sh backup
```

### Manual Backup

```bash
# Backup now
./docker-safe-commands.sh backup

# Creates: backups/backup-YYYYMMDD-HHMMSS.sql
```

### Restore from Backup

```bash
# List available backups
ls -lh backups/

# Restore specific backup
./docker-safe-commands.sh restore backups/backup-20260204-001500.sql
```

## 🔍 Check Volume Status

```bash
# Check if volumes exist
docker volume ls | grep archcelerate

# Check volume size
docker system df -v | grep archcelerate

# Inspect volume details
docker volume inspect archcelerate_postgres_data
```

## 🛡️ Protection Mechanisms

### 1. Named Volumes (Already Configured)

Your `docker-compose.yml` uses named volumes:
```yaml
volumes:
  postgres_data:
    name: archcelerate_postgres_data  # Explicit name prevents conflicts
```

### 2. External Volumes (Optional - Maximum Protection)

For maximum protection, make volumes external:

```bash
# Create volumes manually
docker volume create archcelerate_postgres_data
docker volume create archcelerate_redis_data

# Update docker-compose.yml:
volumes:
  postgres_data:
    name: archcelerate_postgres_data
    external: true  # ✅ Cannot be deleted by docker-compose down -v
  redis_data:
    name: archcelerate_redis_data
    external: true  # ✅ Maximum protection
```

Now even `docker-compose down -v` won't delete them!

### 3. Volume Backup to Host

Mount a backup directory:
```yaml
# Add to postgres service in docker-compose.yml:
volumes:
  - postgres_data:/var/lib/postgresql/data
  - ./backups/postgres:/backups  # Auto-backup to host
```

## 🔄 Common Workflows

### Update Code Without Losing Data

```bash
git pull origin main
./docker-safe-commands.sh rebuild
```

### Stop for the Night

```bash
./docker-safe-commands.sh stop
```

### Start in the Morning

```bash
./docker-safe-commands.sh start
```

### Complete Reset (⚠️  Deletes Everything)

```bash
# Backup first!
./docker-safe-commands.sh backup

# Then reset
./docker-safe-commands.sh reset
```

## 📊 Volume Health Monitoring

```bash
# Check volume usage
docker system df -v

# Expected sizes:
# - postgres_data: ~500MB - 2GB (when seeded)
# - redis_data: ~10-50MB
```

## 🚨 If You Accidentally Deleted Volumes

### Option 1: Restore from Backup
```bash
./docker-safe-commands.sh restore backups/latest-backup.sql
```

### Option 2: Reseed Database
```bash
# Inside the app container
docker exec -it archcelerate-app sh
npx tsx prisma/seed-all-weeks.ts
```

### Option 3: Fresh Start
```bash
./docker-safe-commands.sh reset
# Then manually seed or restore
```

## 📝 Daily Checklist

**Before shutting down:**
- [ ] Backup database: `./docker-safe-commands.sh backup`
- [ ] Stop safely: `./docker-safe-commands.sh stop`

**Before updates:**
- [ ] Backup: `./docker-safe-commands.sh backup`
- [ ] Pull code: `git pull`
- [ ] Rebuild: `./docker-safe-commands.sh rebuild`

**Weekly:**
- [ ] Check volume health: `docker system df -v`
- [ ] Clean old backups: `rm backups/backup-older-than-week.sql`

## 🎯 Quick Reference

| Task | Safe Command |
|------|--------------|
| Stop everything | `./docker-safe-commands.sh stop` |
| Start everything | `./docker-safe-commands.sh start` |
| Restart services | `./docker-safe-commands.sh restart` |
| Update code | `./docker-safe-commands.sh rebuild` |
| Backup database | `./docker-safe-commands.sh backup` |
| Restore database | `./docker-safe-commands.sh restore <file>` |
| View logs | `./docker-safe-commands.sh logs` |
| Check status | `./docker-safe-commands.sh status` |

---

**Remember**: When in doubt, backup first! 💾

```bash
./docker-safe-commands.sh backup
```
