@echo off
chcp 65001 >nul
echo ========================================
echo 📸 旅游照片扫描工具
echo ========================================
echo.
echo 正在扫描照片...
echo.

REM 获取照片列表
dir /b "images\hobbies\travel\*.jpg" 2>nul > temp_photos.txt
dir /b "images\hobbies\travel\*.png" 2>nul >> temp_photos.txt
dir /b "images\hobbies\travel\*.jpeg" 2>nul >> temp_photos.txt

REM 统计数量
for /f %%A in ('type temp_photos.txt ^| find /c /v ""') do set count=%%A

echo 找到 %count% 张照片
echo.
echo 照片列表：
echo ========================================
type temp_photos.txt
echo ========================================
echo.
echo 注意：由于系统限制，此脚本仅用于查看照片列表
echo 请将照片文件名告诉我，我会帮您更新配置文件
echo.
pause

REM 清理临时文件
del temp_photos.txt
