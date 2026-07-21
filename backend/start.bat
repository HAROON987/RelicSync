@echo off
echo Starting RelicSync Backend...
echo.

set JAVA="C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot\bin\java.exe"
set JAR=mysql-connector-j-9.7.0.jar
set BIN=bin

echo [1] Compiling Java source files...
"C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot\bin\javac.exe" -cp %JAR% -d %BIN% src\*.java
if %ERRORLEVEL% neq 0 (
    echo Compilation FAILED. Check errors above.
    pause
    exit /b 1
)
echo Compilation successful!
echo.

echo [2] Starting backend server on port 8080...
%JAVA% -cp "%BIN%;%JAR%" BackendServer
