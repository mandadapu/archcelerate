#!/bin/bash

# Safe Docker Commands for Archcelerate
# These commands preserve your data volumes

echo "🐳 Archcelerate - Safe Docker Commands"
echo "======================================"
echo ""

case "$1" in
  start)
    echo "🚀 Starting services..."
    docker-compose up -d
    ;;

  stop)
    echo "🛑 Stopping services (data preserved)..."
    docker-compose down
    ;;

  restart)
    echo "🔄 Restarting services..."
    docker-compose restart
    ;;

  rebuild)
    echo "🔨 Rebuilding app (data preserved)..."
    docker-compose up -d --build
    ;;

  logs)
    echo "📜 Showing logs..."
    docker-compose logs -f
    ;;

  status)
    echo "📊 Service status:"
    docker-compose ps
    echo ""
    echo "💾 Volume status:"
    docker volume ls | grep archcelerate
    ;;

  backup)
    echo "💾 Backing up database..."
    mkdir -p backups
    docker exec archcelerate-db pg_dump -U archcelerate archcelerate > "backups/backup-$(date +%Y%m%d-%H%M%S).sql"
    echo "✅ Backup saved to backups/"
    ;;

  restore)
    if [ -z "$2" ]; then
      echo "❌ Usage: $0 restore <backup-file>"
      echo "Available backups:"
      ls -lh backups/*.sql 2>/dev/null || echo "No backups found"
      exit 1
    fi
    echo "♻️  Restoring database from $2..."
    cat "$2" | docker exec -i archcelerate-db psql -U archcelerate -d archcelerate
    echo "✅ Database restored"
    ;;

  reset)
    echo "⚠️  WARNING: This will DELETE ALL DATA!"
    echo "Are you sure? Type 'yes' to confirm:"
    read -r confirm
    if [ "$confirm" = "yes" ]; then
      echo "🗑️  Stopping and removing volumes..."
      docker-compose down -v
      echo "🔨 Rebuilding..."
      docker-compose up -d --build
      echo "✅ Reset complete. Database is empty."
    else
      echo "❌ Cancelled"
    fi
    ;;

  *)
    echo "Usage: $0 {start|stop|restart|rebuild|logs|status|backup|restore|reset}"
    echo ""
    echo "Commands:"
    echo "  start    - Start all services"
    echo "  stop     - Stop all services (keeps data)"
    echo "  restart  - Restart all services"
    echo "  rebuild  - Rebuild app with new code (keeps data)"
    echo "  logs     - View real-time logs"
    echo "  status   - Check service and volume status"
    echo "  backup   - Backup database to backups/ folder"
    echo "  restore  - Restore database from backup file"
    echo "  reset    - ⚠️  Delete all data and start fresh"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 backup"
    echo "  $0 restore backups/backup-20260204-001500.sql"
    exit 1
    ;;
esac
