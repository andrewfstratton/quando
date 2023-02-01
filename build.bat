set GO111MODULE=on
set CGO_ENABLED=1
go build -o quando.exe -ldflags -H=windowsgui -tags=full .