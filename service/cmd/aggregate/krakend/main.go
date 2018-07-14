package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	// external
	jwt_lib "github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/contrib/cache"
	"github.com/gin-gonic/contrib/jwt"
	"github.com/gin-gonic/contrib/secure"
	"github.com/gin-gonic/gin"
	"gopkg.in/gin-contrib/cors.v1"

	"github.com/gregjones/httpcache"

	"github.com/birkelund/boltdbcache"            // provides a BoltDB implementation (based on the bbolt fork).
	"github.com/die-net/lrucache"                 // provides an in-memory cache that will evict least-recently used entries.
	"github.com/die-net/lrucache/twotier"         // allows caches to be combined, for example to use lrucache above with a persistent disk-cache.
	"github.com/gregjones/httpcache/diskcache"    // provides a filesystem-backed cache using the diskv library.
	"github.com/gregjones/httpcache/leveldbcache" // provides a filesystem-backed cache using leveldb.
	"github.com/gregjones/httpcache/memcache"     // provides memcache implementations, for both App Engine and 'normal' memcache servers.

	"github.com/devopsfaith/krakend/config"
	"github.com/devopsfaith/krakend/logging"
	"github.com/devopsfaith/krakend/proxy"
	krakendgin "github.com/devopsfaith/krakend/router/gin"
)

func main() {

	// default
	port := flag.Int("p", 0, "Port of the service")
	logLevel := flag.String("l", "ERROR", "Logging level")
	debug := flag.Bool("d", false, "Enable the debug")
	configFile := flag.String("c", "/etc/krakend/configuration.json", "Path to the configuration filename")

	// cors
	allowedHosts := flag.String("hosts", "127.0.0.1:8080,example.com,ssl.example.com", "Comma-separated list of allowed hosts")
	allowedOrigins := flag.String("cors-origins", "http://example.com", "Comma-separated list of CORS allowed origins")
	allowedMethods := flag.String("cors-methods", "HEAD,GET,POST,PUT,PATCH,DELETE", "Comma-separated list of CORS allowed methods")
	allowedHeaders := flag.String("cors-headers", "Origin,Authorization,Content-Type", "Comma-separated list of CORS allowed headers")
	exposedHeaders := flag.String("cors-headers-exposed", "Content-Length", "Comma-separated list of CORS exposed headers")
	corsTTL := flag.Duration("cors-ttl", 12*time.Hour, "Max age for the CORS layer")

	// jwt
	jwtSecret := flag.String("jwt-secret", "KrakenDrulez123.4567890!", "Secret for signing jwt")
	jwtIssuer := flag.String("jwt-issuer", "http://example.com/", "Issuer for the jwt")
	jwtPort := flag.Int("jwt-port", 8090, "Port for the jwt generator api")
	jwsTTL := flag.Duration("jwt-ttl", 1*time.Hour, "Expiration for the JWT")

	flag.Parse()

	parser := config.NewParser()
	serviceConfig, err := parser.Parse(*configFile)
	if err != nil {
		log.Fatal("ERROR:", err.Error())
	}
	serviceConfig.Debug = serviceConfig.Debug || *debug
	if *port != 0 {
		serviceConfig.Port = *port
	}

	logger, err := logging.NewLogger(*logLevel, os.Stdout, "[KRAKEND]")
	if err != nil {
		log.Fatal("ERROR:", err.Error())
	}

	// run the dummy jwt generator http service in a dedicated goroutine
	go runJWTGeneratorHTTPService("/token", *jwtSecret, *jwtIssuer, *jwsTTL, *jwtPort)

	store := cache.NewInMemoryStore(time.Minute)
	tp := httpcache.NewMemoryCacheTransport()
	client := http.Client{Transport: tp}

	routerFactory := krakendgin.NewFactory(krakendgin.Config{
		Engine:       gin.Default(),
		ProxyFactory: customProxyFactory{logger, proxy.DefaultFactory(logger)},
		Middlewares: []gin.HandlerFunc{
			secure.Secure(secure.Options{
				AllowedHosts:          strings.Split(*allowedHosts, ","),
				SSLRedirect:           false,
				SSLHost:               "ssl.example.com",
				SSLProxyHeaders:       map[string]string{"X-Forwarded-Proto": "https"},
				STSSeconds:            315360000,
				STSIncludeSubdomains:  true,
				FrameDeny:             true,
				ContentTypeNosniff:    true,
				BrowserXssFilter:      true,
				ContentSecurityPolicy: "default-src 'self'",
			}),
			limit.MaxAllowed(20),
			cors.New(cors.Config{
				AllowOrigins:     strings.Split(*allowedOrigins, ","),
				AllowMethods:     strings.Split(*allowedMethods, ","),
				AllowHeaders:     strings.Split(*allowedHeaders, ","),
				ExposeHeaders:    strings.Split(*exposedHeaders, ","),
				AllowCredentials: true,
				MaxAge:           *corsTTL,
			}),
			jwt.Auth(*jwtSecret),
		},
		Logger: logger,
		HandlerFactory: func(configuration *config.EndpointConfig, proxy proxy.Proxy) gin.HandlerFunc {
			return cache.CachePage(store, configuration.CacheTTL, krakendgin.EndpointHandler(configuration, proxy))
		},
	})

	routerFactory.New().Run(serviceConfig)
}

// customProxyFactory adds a logging middleware wrapping the internal factory
type customProxyFactory struct {
	logger  logging.Logger
	factory proxy.Factory
}

// New implements the Factory interface
func (cf customProxyFactory) New(cfg *config.EndpointConfig) (p proxy.Proxy, err error) {
	p, err = cf.factory.New(cfg)
	if err == nil {
		p = proxy.NewLoggingMiddleware(cf.logger, cfg.Endpoint)(p)
	}
	return
}

// runJWTGeneratorHTTPService sets up and runs a dummy http service with a single endpoint ready to create signed JWT
// issued for the received resource id
func runJWTGeneratorHTTPService(resource, jwtSecret, jwtIssuer string, jwsTTL time.Duration, jwtPort int) {
	engine := gin.Default()
	engine.GET(fmt.Sprintf("%s/:id", resource), func(c *gin.Context) {
		token := jwt_lib.New(jwt_lib.GetSigningMethod("HS256"))
		token.Claims = jwt_lib.MapClaims{
			"Id":  c.Param("id"),
			"iss": jwtIssuer,
			"exp": time.Now().Add(jwsTTL).Unix(),
		}
		tokenString, err := token.SignedString([]byte(jwtSecret))
		if err != nil {
			c.JSON(500, gin.H{"message": "Could not generate token"})
		}
		c.JSON(200, gin.H{"token": tokenString})
	})
	log.Fatal(engine.Run(fmt.Sprintf(":%d", jwtPort)))
}
