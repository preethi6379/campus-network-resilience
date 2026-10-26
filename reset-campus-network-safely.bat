@echo off
setlocal
title Campus Network - Safe Simulation Reset

echo ============================================================
echo   CAMPUS NETWORK RESILIENCE - SAFE SIMULATION RESET
echo ============================================================
echo.
echo This script uses the running app's Undo API.
echo It does NOT delete, recreate, or edit the database file directly.
echo It does NOT stop or restart the API.
echo.
echo It will undo recorded operations until the app says there is
echo nothing left to undo. This can undo older recorded simulation
echo actions too, not just actions from the current browser session.
echo The audit/history records are retained by the app.
echo.
choice /C YN /N /M "Continue? Press Y to reset simulation changes, or N to cancel: "
if errorlevel 2 exit /b 0

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$base='http://localhost:5000';" ^
  "try { $h=Invoke-RestMethod -Uri ($base+'/api/health') -TimeoutSec 4; if ($h.status -ne 'HEALTHY') { throw 'API health check did not return HEALTHY' } } catch { Write-Host ''; Write-Host 'ERROR: API is not reachable at http://localhost:5000.' -ForegroundColor Red; Write-Host 'Start the app normally, then run this reset again.'; exit 2 };" ^
  "$count=0; $limit=200;" ^
  "while ($count -lt $limit) {" ^
  "  try { $r=Invoke-RestMethod -Method Post -Uri ($base+'/api/operations/undo') -ContentType 'application/json' -Body '{}' -TimeoutSec 8 } catch { Write-Host ('ERROR calling Undo API: '+$_.Exception.Message) -ForegroundColor Red; exit 3 };" ^
  "  if ($r.result -eq 'NO_OPERATION_TO_UNDO') { break };" ^
  "  if ($r.result -eq 'UNDONE') { $count++; Write-Host ('Undid operation '+$count+': '+$r.undone_action) } else { Write-Host ('Stopped: API returned '+$r.result); break };" ^
  "};" ^
  "if ($count -ge $limit) { Write-Host 'Safety limit reached (200 operations). Run again only if you still need to undo more.' -ForegroundColor Yellow }" ^
  "elseif ($count -eq 0) { Write-Host 'Nothing was available to undo. No changes were made.' }" ^
  "else { Write-Host ''; Write-Host ('Done. Undid '+$count+' recorded operation(s).') -ForegroundColor Green; Write-Host 'Refresh the app to reload the displayed network.' }"

set "RC=%ERRORLEVEL%"
echo.
if not "%RC%"=="0" (
  echo Reset did not complete successfully. The database was not deleted by this script.
) else (
  echo Finished. Refresh your browser to reload the network view.
)
echo.
pause
exit /b %RC%
