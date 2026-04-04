Write-Host "Test Start" -ForegroundColor Green
$agents = @("harvest_ready")
foreach ($a in $agents) { Write-Host $a }
Write-Host "Test End" -ForegroundColor Green
