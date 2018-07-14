FROM golang:1.10.3-alpine3.7 as builder
MAINTAINER Rosco Pecoltran <rosco.pecoltran@msn.com>
LABEL copyright="Rosco Pecoltran"

RUN apk add --no-cache --no-progress ca-certificates git mercurial
WORKDIR /go/src/github.com/sniperkit/vue-element-admin-chrome/service
COPY . .

RUN go generate ./static
RUN CGO_ENABLED=0 go install ./cmd/snk-server

FROM alpine:3.7
MAINTAINER Rosco Pecoltran <rosco.pecoltran@msn.com>
LABEL copyright="Rosco Pecoltran"

WORKDIR /app
COPY --from=builder /go/bin/snk-server /app/snk-server
COPY --from=builder /etc/ssl/certs /etc/ssl/certs
ENTRYPOINT ["/app/snk-server"]
