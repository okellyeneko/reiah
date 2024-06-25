package main

import (
	"github.com/denartha10/SummerProjectGOTH/db"
	"github.com/denartha10/SummerProjectGOTH/handlers"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {

	// INTEND ON REPLACING THIS LATER ON WITH THE POSTGRES DB
	err := db.InitDB("sqlite3", "db/application.db")
	if err != nil {
		panic("Failed to start application database, " + err.Error())
	}

	e := echo.New()

	//For CORS restrictions
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
	}))

	// HOME PAGE
	e.GET("/", handlers.HandleHome, handlers.CustomAuthMiddleware, middleware.Logger())

	// MAP PAGE
	e.GET("/map", handlers.HandleMap, handlers.CustomAuthMiddleware, middleware.Logger())

	// SETTINGS PAGE
	e.GET("/settings", handlers.HandleSettings, handlers.CustomAuthMiddleware, middleware.Logger())
	e.PATCH("/settings/:userid", handlers.HandleUpdateUserSettings, handlers.CustomAuthMiddleware, middleware.Logger())

	// DASHBOARD PAGE
	e.GET("/dashboard", handlers.HandleDashboard, handlers.CustomAuthMiddleware, middleware.Logger())

	//LOGIN AND REGISTER PAGE
	e.GET("/login", handlers.HandleLoginPage, middleware.Logger())
	e.POST("/login", handlers.HandleLoginAttempt, middleware.Logger())
	e.GET("/register", handlers.HandleRegisterPage, middleware.Logger())
	e.POST("/register", handlers.HandleRegisterAttempt, middleware.Logger())

	// Routes
	e.GET("/", handlers.HandleHome, handlers.CustomAuthMiddleware)

	// API DATA ROUTES
	e.GET("/api/amenities", handlers.ServeAmenitiesData)
	e.GET("/api/businesses", handlers.ServeBusinessData)
	e.GET("/api/prices", handlers.ServeRealEstatePriceData)
	e.GET("/api/historic-prices", handlers.ServeHistoricRealEstatePrices)
	e.GET("/api/neighbourhoods", handlers.ServeNeighbourhoods)

	// Mount the public folder at the publci address for accessing css and static files
	e.Static("/public", "public")
	e.Logger.Fatal(e.Start("0.0.0.0:8000"))
}
