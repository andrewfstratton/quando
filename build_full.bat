set GO111MODULE=on
set CGO_ENABLED=1
go build -o quando.exe -ldflags -H=windowsgui -tags=full .
@ECHO Note: the quando.exe has been built for UNSAFE usage, i.e. scripts can control the keyboard and mouse
@ECHO Use .\build.bat safe usage