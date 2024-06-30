package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
)

// ---------------------------------------
type Amenity struct {
	Borough            string  `json:"BOROUGH"`
	Name               string  `json:"NAME"`
	FacilityType       string  `json:"FACILITY_TYPE"`
	FacilityDesc       string  `json:"FACILITY_DESC"`
	Zipcode            int     `json:"ZIP_CODE"`
	Longitude          float64 `json:"LNG"`
	Latitude           float64 `json:"LAT"`
	Count              int     `json:"COUNT"`
	DistanceToFacility float64 `json:"DISTANCE_TO_FACILITY"`
}

type AmenityFilterParams struct {
	Borough      string `query:"borough"`
	Zipcode      int    `query:"zipcode"`
	FacilityType string `query:"facilitytype"`
	FacilityDesc string `query:"facilitydesc"`
	Name         string `query:"name"`
}

func filterAmenities(a []Amenity, f *AmenityFilterParams) []Amenity {
	var filtered []Amenity //
	for _, amenity := range a {
		if f.Borough != "" && amenity.Borough != f.Borough {
			continue
		}
		if f.Zipcode != 0 && amenity.Zipcode != f.Zipcode {
			continue
		}
		if f.FacilityType != "" && amenity.FacilityType != f.FacilityType {
			continue
		}
		if f.FacilityDesc != "" && amenity.FacilityDesc != f.FacilityDesc {
			continue
		}
		if f.Name != "" && amenity.Name != f.Name {
			continue
		}
		filtered = append(filtered, amenity)
	}
	return filtered
}

func ServeAmenitiesData(c echo.Context) error {
	var p AmenityFilterParams // Create a variable that is of type AmenityFilterParams
	if err := c.Bind(&p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid filter parameters")
	} // bind it to the request with proper error message if so

	file, err := os.Open("public/cleaned_amenities_data2.json") // open the json file
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to open the amenities file: "+err.Error())
	}

	defer file.Close() // defer its closing to the end of the function scope

	var amenities []Amenity                                          // an array of amenitys
	if err := json.NewDecoder(file).Decode(&amenities); err != nil { // Create a decoder from the file and decode the dson into an array of amenities
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to parse the amenities file")
	}

	filteredAmenities := filterAmenities(amenities, &p) // filter the amenities using zipcode and borough
	return c.JSON(http.StatusOK, filteredAmenities)     // return the json
}

// ---------------------------------------
type Businesses struct {
	TaxiZone     int     `json:"taxi_zone"`
	BusinessType string  `json:"business_type"`
	Zipcode      int     `json:"Zip Code"`
	Longitude    float64 `json:"Longitude"`
	Latitude     float64 `json:"Latitude"`
	Counts       int     `json:"Counts"`
}

type BusinessesFilterParams struct {
	TaxiZone     int    `query:"taxizone"`
	BusinessType string `query:"businesstype"`
	Zipcode      int    `query:"zipcode"`
}

func filterBusinesses(a []Businesses, f *BusinessesFilterParams) []Businesses {
	var filtered []Businesses
	for _, business := range a {
		if f.TaxiZone != 0 && business.TaxiZone != f.TaxiZone {
			continue
		}
		if f.Zipcode != 0 && business.Zipcode != f.Zipcode {
			continue
		}
		if f.BusinessType != "" && business.BusinessType != f.BusinessType {
			continue
		}
		filtered = append(filtered, business)
	}
	return filtered
}

func ServeBusinessData(c echo.Context) error {
	var p BusinessesFilterParams // Create a variable that is of type BusinessesFilterParams
	if err := c.Bind(&p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid filter parameters")
	} // bind it to the request with proper error message if so

	file, err := os.Open("public/cleaned_business_data.json") // open the json file
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to open the business file: "+err.Error())
	}

	defer file.Close() // defer its closing to the end of the function scope

	var business []Businesses                                       // an array of business
	if err := json.NewDecoder(file).Decode(&business); err != nil { // Create a decoder from the file and decode the dson into an array of business
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to parse the business file")
	}

	filteredBusiness := filterBusinesses(business, &p) // filter the business
	return c.JSON(http.StatusOK, filteredBusiness)     // return the json
}

// ---------------------------------------
// REAL ESTATE
type Prices struct {
	Zipcode         int     `json:"zipcode"`
	HomeValue       float64 `json:"avg_home_value"`
	HouseholdIncome float64 `json:"median_household_income"`
	MedianAge       float64 `json:"median_age"`
	Latitude        float64 `json:"lat"`
	Longitude       float64 `json:"lng"`
}

type PricesFilterParams struct {
	Zipcode         int     `query:"zipcode"`
	HomeValue       float64 `query:"homevalue"`
	HouseholdIncome float64 `query:"income"`
	MedianAge       float64 `query:"age"`
}

func filterPrices(a []Prices, f *PricesFilterParams) []Prices {
	var filtered []Prices
	for _, prices := range a {
		if f.Zipcode != 0 && prices.Zipcode != f.Zipcode {
			continue
		}
		if f.HomeValue != 0 && prices.HomeValue != f.HomeValue {
			continue
		}
		if f.HouseholdIncome != 0 && prices.HouseholdIncome != f.HouseholdIncome {
			continue
		}
		if f.MedianAge != 0 && prices.MedianAge != f.MedianAge {
			continue
		}
		filtered = append(filtered, prices)
	}
	return filtered
}

func ServeRealEstatePriceData(c echo.Context) error {
	var p PricesFilterParams
	if err := c.Bind(&p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid filter parameters")
	}

	file, err := os.Open("public/historic_real_estate_prices.json")
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to open the real_estate_price_data file: "+err.Error())
	}
	defer file.Close()

	var prices []Prices
	if err := json.NewDecoder(file).Decode(&prices); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to parse the prices file "+err.Error())
	}

	filteredPrices := filterPrices(prices, &p)
	return c.JSON(http.StatusOK, filteredPrices)
}

// ---------------------------------------
// HISTORIC REAL ESTATE
type HistoricRealEstatePriceData struct {
	Zipcode int                `json:"zipcode"`
	Dates   map[string]float64 `json:"historicprices"`
}

type RawHistoricRealEstatePriceData struct {
	Zipcode int `json:"zipcode"`
}

type HistoricFilterParams struct {
	Zipcode    int    `query:"zipcode"`
	AggreateBy string `query:"aggregateBy"`
}

func filterHistoricPrices(a []HistoricRealEstatePriceData, f *HistoricFilterParams) []HistoricRealEstatePriceData {
	var filtered []HistoricRealEstatePriceData
	for _, prices := range a {
		if f.Zipcode != 0 && prices.Zipcode != f.Zipcode {
			continue
		}
		filtered = append(filtered, prices)
	}
	return filtered
}

func average(f []float64) float64 {
	var sum float64 = 0
	for _, num := range f {
		sum += num
	}
	return sum / float64(len(f))
}

func aggregateToYear(data map[string]float64) map[string]float64 {
	newData := make(map[int][]float64)
	for dateString, value := range data {
		date, err := time.Parse("2006-01-02", dateString)
		if err != nil {
			continue
		}

		_, ok := newData[date.Year()]
		if ok {
			newData[date.Year()] = append(newData[date.Year()], value)
		} else {
			newData[date.Year()] = []float64{value}
		}
	}

	returnData := make(map[string]float64)
	for year, priceList := range newData {
		returnData[strconv.Itoa(year)] = average(priceList)
	}

	return returnData
}

func aggregateHistoricPrices(historic []HistoricRealEstatePriceData, f *HistoricFilterParams) []HistoricRealEstatePriceData {
	var aggregatedPrices []HistoricRealEstatePriceData
	if f.AggreateBy == "year" {
		for _, price := range historic {
			aggregatedPrices = append(aggregatedPrices, HistoricRealEstatePriceData{
				Zipcode: price.Zipcode,
				Dates:   aggregateToYear(price.Dates),
			})
		}
	}
	return aggregatedPrices
}

func ServeHistoricRealEstatePrices(c echo.Context) error {
	var p HistoricFilterParams
	if err := c.Bind(&p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid filter parameters")
	}

	file, err := os.Open("public/historic_real_estate_prices.json")
	if err != nil {
		log.Fatalf("Error opening file: %v", err)
	}
	defer file.Close()

	fileContents, err := io.ReadAll(file)
	if err != nil {
		log.Fatalf("Error reading file: %v", err)
	}

	var RawHistoricRealEstatePriceDataList []map[string]interface{}
	if err := json.Unmarshal(fileContents, &RawHistoricRealEstatePriceDataList); err != nil {
		log.Fatalf("Error unmarshalling JSON to slice: %v", err)
	}

	var dataList []HistoricRealEstatePriceData
	for _, RawHistoricRealEstatePriceDataMap := range RawHistoricRealEstatePriceDataList {
		var rd RawHistoricRealEstatePriceData
		if zipcode, ok := RawHistoricRealEstatePriceDataMap["zipcode"].(string); ok {
			rd.Zipcode, err = strconv.Atoi(zipcode)
		}

		data := HistoricRealEstatePriceData{
			Zipcode: rd.Zipcode,
			Dates:   make(map[string]float64),
		}

		for key, value := range RawHistoricRealEstatePriceDataMap {
			if key == "zipcode" {
				continue
			}

			if value != nil {
				floatValue, err := strconv.ParseFloat(value.(string), 64)
				if err != nil {
					log.Fatalf("COULD NOT CONVERT FLOAT AT "+key+"IN ZIPCODE :", data.Zipcode)
				}
				data.Dates[key] = floatValue
			}
		}

		dataList = append(dataList, data)
	}

	filteredPrices := filterHistoricPrices(dataList, &p)
	aggregatedPrices := aggregateHistoricPrices(filteredPrices, &p)
	return c.JSON(http.StatusOK, aggregatedPrices)
}

func ServeNeighbourhoods(c echo.Context) error {
	file, err := os.Open("public/nyc_zipcode_areas.geojson")
	if err == nil {
		log.Println("MANAGED TO OPEN THE FILE")
	} else {
		log.Println(err.Error())
	}
	defer file.Close()
	return c.File("public/nyc_zipcode_areas.geojson")
}
