#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# SOBERANO API & WEB SUITE - INICIALIZADOR SOBERANO
# ═══════════════════════════════════════════════════════════════════════════════

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "👑 Iniciando API Soberano na porta 8000..."
echo "🔗 Endpoints Ativos:"
echo "   - POST http://localhost:8000/api/v1/auth/activate"
echo "   - POST http://localhost:8000/api/v1/auth/verify"
echo "   - POST http://localhost:8000/api/v1/licenses/generate"
echo "   - POST http://localhost:8000/api/v1/licenses/revoke"
echo "   - POST http://localhost:8000/api/v1/licenses/reset-hwid"
echo "   - Web App / Dashboard: http://localhost:8000"

php artisan serve --host=0.0.0.0 --port=8000
