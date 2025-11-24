#!/bin/bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Checking backend health..."
curl -s http://localhost:3000/api/health 2>&1 | head -20 || echo "Backend not responding"
echo ""
echo "Checking backend logs..."
docker logs university_backend --tail 30 2>&1 | tail -20
