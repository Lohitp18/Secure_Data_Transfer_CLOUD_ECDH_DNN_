# Quick Server Connection Test (PowerShell)
# Tests if server is accessible

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Server Connection Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$urls = @(
    "http://localhost:5000/api/health",
    "http://127.0.0.1:5000/api/health"
)

$found = $false

foreach ($url in $urls) {
    Write-Host "Trying: $url" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "  Status Code: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "  Response: $($response.Content)" -ForegroundColor Green
        
        if ($response.StatusCode -eq 200) {
            Write-Host ""
            Write-Host "  SUCCESS! Server is running and accessible" -ForegroundColor Green
            Write-Host "  Working URL: $url" -ForegroundColor Green
            $found = $true
            break
        }
    }
    catch {
        Write-Host "  Connection failed: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan

if ($found) {
    Write-Host ""
    Write-Host "Server is accessible!" -ForegroundColor Green
    Write-Host ""
    Write-Host "If setup_and_verify.py still fails, try:" -ForegroundColor Yellow
    Write-Host "  1. Check SERVER_URL environment variable" -ForegroundColor Yellow
    Write-Host "  2. Run: `$env:SERVER_URL='http://localhost:5000'" -ForegroundColor Yellow
    Write-Host "  3. Then run: python setup_and_verify.py" -ForegroundColor Yellow
}
else {
    Write-Host ""
    Write-Host "Cannot connect to server!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check if server is running:" -ForegroundColor Yellow
    Write-Host "     Look for: 'Server listening on http://localhost:5000'" -ForegroundColor Yellow
    Write-Host "  2. Start the server:" -ForegroundColor Yellow
    Write-Host "     cd server" -ForegroundColor Yellow
    Write-Host "     npm start" -ForegroundColor Yellow
    Write-Host "  3. Check if port 5000 is in use:" -ForegroundColor Yellow
    Write-Host "     netstat -ano | findstr :5000" -ForegroundColor Yellow
    Write-Host "  4. Try in browser:" -ForegroundColor Yellow
    Write-Host "     http://localhost:5000/api/health" -ForegroundColor Yellow
}

Write-Host ""

