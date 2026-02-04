#!/bin/bash

# Development helper script for quick Docker operations
# Usage: ./dev.sh [command]

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_usage() {
    echo -e "${BLUE}AI Architect Accelerator - Development Helper${NC}"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  ${GREEN}quick${NC}         - Quick app rebuild (with cache, ~30s)"
    echo "  ${GREEN}restart${NC}       - Just restart app container (~5s)"
    echo "  ${GREEN}rebuild${NC}       - Full rebuild with no cache (~5min)"
    echo "  ${GREEN}seed${NC}          - Reseed database"
    echo "  ${GREEN}logs${NC}          - Show app logs (follow mode)"
    echo "  ${GREEN}shell${NC}         - Open shell in app container"
    echo "  ${GREEN}up${NC}            - Start all services"
    echo "  ${GREEN}down${NC}          - Stop all services"
    echo "  ${GREEN}status${NC}        - Show container status"
    echo "  ${GREEN}clean${NC}         - Stop and remove all containers/volumes"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh quick          # After changing MDX/seed files"
    echo "  ./dev.sh restart        # Quick restart"
    echo "  ./dev.sh seed           # Reseed database"
    echo "  ./dev.sh logs           # Watch logs"
}

case "$1" in
    quick)
        echo -e "${YELLOW}🔨 Quick rebuild (with cache)...${NC}"
        docker compose build app
        echo -e "${YELLOW}🔄 Restarting app container...${NC}"
        docker compose up -d app --force-recreate
        echo -e "${GREEN}✅ Done! App restarted in ~30s${NC}"
        echo ""
        echo "Check logs: ./dev.sh logs"
        echo "Access app: http://localhost:3000"
        ;;

    restart)
        echo -e "${YELLOW}🔄 Restarting app container...${NC}"
        docker compose restart app
        echo -e "${GREEN}✅ Done! App restarted in ~5s${NC}"
        ;;

    rebuild)
        echo -e "${YELLOW}🔨 Full rebuild (no cache, ~5min)...${NC}"
        echo "⚠️  This will take several minutes!"
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose build app --no-cache
            docker compose up -d app --force-recreate
            echo -e "${GREEN}✅ Done! Full rebuild complete${NC}"
        else
            echo "Cancelled"
        fi
        ;;

    seed)
        echo -e "${YELLOW}🌱 Reseeding database...${NC}"
        docker compose exec app npx prisma db seed
        echo -e "${GREEN}✅ Database seeded${NC}"
        ;;

    logs)
        echo -e "${BLUE}📋 Following app logs (Ctrl+C to exit)...${NC}"
        docker compose logs -f app
        ;;

    shell)
        echo -e "${BLUE}🐚 Opening shell in app container...${NC}"
        docker compose exec app sh
        ;;

    up)
        echo -e "${YELLOW}🚀 Starting all services...${NC}"
        docker compose up -d
        echo -e "${GREEN}✅ All services started${NC}"
        docker compose ps
        ;;

    down)
        echo -e "${YELLOW}⏬ Stopping all services...${NC}"
        docker compose down
        echo -e "${GREEN}✅ All services stopped${NC}"
        ;;

    status)
        echo -e "${BLUE}📊 Container Status:${NC}"
        docker compose ps
        ;;

    clean)
        echo -e "${YELLOW}🧹 Cleaning up containers and volumes...${NC}"
        echo "⚠️  This will delete all data!"
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose down -v
            echo -e "${GREEN}✅ Cleanup complete${NC}"
        else
            echo "Cancelled"
        fi
        ;;

    *)
        print_usage
        exit 1
        ;;
esac
