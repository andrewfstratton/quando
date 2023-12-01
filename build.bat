set GO111MODULE=on
set CGO_ENABLED=1
go build -o quando.exe -ldflags -H=windowsgui .
@ECHO Note: the quando.exe has been built for safe usage, i.e. without keyboard control, etc.
@ECHO Use .\build_full.bat to include UNSAFE keyboard and mouse control