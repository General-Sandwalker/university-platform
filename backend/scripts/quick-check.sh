#!/bin/bash
# Quick health check
cd /home/greed/Desktop/Projects/university-platform/backend
docker ps | grep university
curl -s http://localhost:3000/api/health
