#!/bin/bash
# Helper script to create a new feature branch

if [ -z "$1" ]; then
    echo "Usage: ./scripts/new-feature.sh <feature-name>"
    echo "Example: ./scripts/new-feature.sh add-linkedin-oauth"
    exit 1
fi

FEATURE_NAME=$1
BRANCH_NAME="feature/$FEATURE_NAME"

# Ensure we're on main and up to date
git checkout main
git pull origin main

# Create and checkout new feature branch
git checkout -b "$BRANCH_NAME"

echo "✅ Created feature branch: $BRANCH_NAME"
echo ""
echo "Next steps:"
echo "  1. Make your changes"
echo "  2. Commit: git commit -m 'your message'"
echo "  3. Push: git push -u origin $BRANCH_NAME"
echo "  4. Create PR on GitHub"
