# Development Quick Reference

## Quick Commands

Use the `./dev.sh` helper script for common tasks:

```bash
./dev.sh quick      # Quick rebuild (~30s) - Use after MDX/seed changes
./dev.sh restart    # Fast restart (~5s) - Use for quick checks
./dev.sh seed       # Reseed database
./dev.sh logs       # Watch app logs
./dev.sh status     # Check containers
```

## When to Use What

| Scenario | Command | Time |
|----------|---------|------|
| Changed MDX content | `./dev.sh quick` | ~30s |
| Changed seed script | `./dev.sh quick` | ~30s |
| App needs restart | `./dev.sh restart` | ~5s |
| Need to reseed DB | `./dev.sh seed` | ~10s |
| Check if running | `./dev.sh status` | instant |

## Full Command Reference

```bash
./dev.sh quick      # Quick app rebuild (with cache)
./dev.sh restart    # Just restart app container
./dev.sh rebuild    # Full rebuild with no cache (~5min)
./dev.sh seed       # Reseed database
./dev.sh logs       # Show app logs (follow mode)
./dev.sh shell      # Open shell in app container
./dev.sh up         # Start all services
./dev.sh down       # Stop all services
./dev.sh status     # Show container status
./dev.sh clean      # Stop and remove all (destructive)
```

## Development Workflow

### Making Changes to Content

1. Edit MDX files in `content/`
2. Quick rebuild:
   ```bash
   ./dev.sh quick
   ```
3. Check logs if needed:
   ```bash
   ./dev.sh logs
   ```

### Updating Seed Data

1. Edit `prisma/seed.ts`
2. Rebuild and reseed:
   ```bash
   ./dev.sh quick
   ./dev.sh seed
   ```

### Debugging

```bash
# Watch logs
./dev.sh logs

# Open shell in container
./dev.sh shell

# Check container status
./dev.sh status
```

## Tips

- **Keep DB/Redis running**: Don't use `./dev.sh down` unless needed
- **Use cache**: Only use `./dev.sh rebuild` when dependencies change
- **Quick iterations**: Use `./dev.sh restart` for fastest checks
