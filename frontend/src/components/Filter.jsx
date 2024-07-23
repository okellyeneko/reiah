import { createSignal, createEffect, onMount } from "solid-js";

// Debounce function to limit API calls
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const Filter = ({
  setFilteredZipCodes,
  showFilterBoard,
  setShowFilterBoard,
  map,
  setSideBarOpen,
}) => {
  // const [filterTarget, setFilterTarget] = createSignal("Residential Property");
  const [selectedBoroughs, setSelectedBoroughs] = createSignal(new Set());
  const [selectedNeighborhoods, setSelectedNeighborhoods] = createSignal(
    new Set()
  );
  const [boroughData, setBoroughData] = createSignal([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = createSignal(false);
  const [selectedAmenities, setSelectedAmenities] = createSignal(new Set());
  const [filteredAmenities, setFilteredAmenities] = createSignal({});
  const [houseType, setHouseType] = createSignal("");
  const [expandedCategories, setExpandedCategories] = createSignal(new Set());
  const [beds, setBeds] = createSignal(0);
  const [baths, setBaths] = createSignal(0);
  const [propertySqft, setPropertySqft] = createSignal([0, 0]);
  const [propertyPrice, setPropertyPrice] = createSignal([0, 0]);
  const [filteredZipCodesLocal, setFilteredZipCodesLocal] = createSignal([]);
  const [realEstateData, setRealEstateData] = createSignal([]);

  const unique_borough = [
    "Bronx",
    "Manhattan",
    "Queens",
    "Brooklyn",
    "Staten Island",
  ];
  const houseTypeOptions = [
    "Condo",
    "Townhouse",
    "Co-op",
    "Multi-family home",
    "House",
  ];

  const fetchBoroughData = async () => {
    const response = await fetch(
      "http://localhost:8000/api/borough-neighbourhood"
    );
    const data = await response.json();
    // console.log("Fetched borough data:", data); // Log the fetched data
    setBoroughData(data);
  };

  const fetchRealEstateData = async (filters) => {
    const query = new URLSearchParams(filters).toString();
    try {
      const response = await fetch(
        `http://localhost:8000/api/property-data?${query}`
      );
      const data = await response.json();
      // console.log("Fetched real estate data:", data); // Log the fetched data

      // Handle null response
      if (data === null) {
        setRealEstateData([]);
      } else {
        setRealEstateData(data);
      }

      applyFilters(); // Apply filters after fetching data
    } catch (error) {
      console.error("Error fetching real estate data:", error);
      setRealEstateData([]);
      applyFilters(); // Still apply filters to handle empty data gracefully
    }
  };

  const fetchAmenities = debounce(async (neighborhoods) => {
    if (neighborhoods.length > 0) {
      const neighborhoodParams = neighborhoods.join(",");
      const response = await fetch(
        `http://localhost:8000/api/amenities?neighborhoods=${neighborhoodParams}`
      );
      const data = await response.json();
      // console.log("Fetched amenities data:", data); // Log fetched data
      setFilteredAmenities(
        data.reduce((acc, amenity) => {
          if (!acc[amenity.ZIPCODE]) acc[amenity.ZIPCODE] = [];
          acc[amenity.ZIPCODE].push(amenity);
          return acc;
        }, {})
      );
    } else {
      setFilteredAmenities({});
    }
  }, 300);

  const handleBoroughChange = (borough) => {
    setSelectedBoroughs((prev) => {
      const newBoroughs = new Set(prev);
      if (newBoroughs.has(borough)) {
        newBoroughs.delete(borough);
      } else {
        newBoroughs.add(borough);
      }
      setSelectedNeighborhoods(new Set());
      fetchBoroughData(); // Fetch borough data when borough changes
      return newBoroughs;
    });
    handleFilterChange();
  };

  const handleNeighborhoodChange = (neighborhood) => {
    setSelectedNeighborhoods((prev) => {
      const newNeighborhoods = new Set(prev);
      if (newNeighborhoods.has(neighborhood)) {
        newNeighborhoods.delete(neighborhood);
      } else {
        newNeighborhoods.add(neighborhood);
      }
      fetchAmenities([...newNeighborhoods]);
      return newNeighborhoods;
    });
    handleFilterChange();
  };

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities((prev) => {
      const newAmenities = new Set(prev);
      if (newAmenities.has(amenity)) {
        newAmenities.delete(amenity);
      } else {
        newAmenities.add(amenity);
      }
      return newAmenities;
    });
    handleFilterChange();
  };

  const handleHouseTypeChange = (type) => {
    setHouseType(type);
    // console.log(`Selected house type: ${type}`);
    handleFilterChange();
  };

  const handleCategoryToggle = (category) => {
    setExpandedCategories((prev) => {
      const newCategories = new Set(prev);
      if (newCategories.has(category)) {
        newCategories.delete(category);
      } else {
        newCategories.add(category);
      }
      return newCategories;
    });
  };

  const getNeighborhoods = (boroughs) => {
    return [
      ...new Set(
        boroughs.flatMap((borough) =>
          boroughData()
            .filter((el) => el.borough === borough)
            .map((el) => el.neighbourhood)
        )
      ),
    ];
  };

  const getZipcodes = (boroughs, neighborhoods) => {
    return [
      ...new Set(
        boroughs.flatMap((borough) =>
          boroughData()
            .filter(
              (el) =>
                el.borough === borough &&
                (neighborhoods.length === 0 ||
                  neighborhoods.includes(el.neighbourhood))
            )
            .flatMap((el) => el.zipcodes)
        )
      ),
    ];
  };

  const applyFilters = () => {
    // console.log("Applying filters...");

    // Fetch initial zipcodes based on selected boroughs and neighborhoods
    let zipCodes = getZipcodes(
      [...selectedBoroughs()],
      [...selectedNeighborhoods()]
    );

    // console.log("Initial zipcodes:", zipCodes);

    if (zipCodes.length === 0) {
      setFilteredZipCodesLocal([]);
      setFilteredZipCodes([]);
      // console.log("No zipcodes to filter.");
      return;
    }

    const hasPropertyFilters =
      houseType() !== "" ||
      beds() > 0 ||
      baths() > 0 ||
      propertySqft()[0] > 0 ||
      propertySqft()[1] > 0 ||
      propertyPrice()[0] > 0 ||
      propertyPrice()[1] > 0;

    if (hasPropertyFilters) {
      zipCodes = zipCodes.filter((zip) => {
        const properties = realEstateData().filter(
          (property) => property.ZIPCODE.toString() === zip.toString()
        );
        // console.log(`Properties in zip ${zip}:`, properties);

        if (properties.length === 0) return false; // If no properties in the zip, skip it

        const matches = properties.some((property) => {
          // Ensure property attributes are valid numbers before comparison
          const validPrice = property.PRICE != null && !isNaN(property.PRICE);
          const validBeds = property.BEDS != null && !isNaN(property.BEDS);
          const validBaths = property.BATH != null && !isNaN(property.BATH);
          const validSqft =
            property.PROPERTYSQFT != null && !isNaN(property.PROPERTYSQFT);

          const typeMatch = houseType() === "" || houseType() === property.TYPE;
          const bedsMatch =
            beds() > 0 ? validBeds && property.BEDS >= beds() : true;
          const bathsMatch =
            baths() > 0 ? validBaths && property.BATH >= baths() : true;
          const sqftMinMatch =
            propertySqft()[0] > 0
              ? validSqft && property.PROPERTYSQFT >= propertySqft()[0]
              : true;
          const sqftMaxMatch =
            propertySqft()[1] > 0
              ? validSqft && property.PROPERTYSQFT <= propertySqft()[1]
              : true;
          const priceMinMatch =
            propertyPrice()[0] > 0
              ? validPrice && property.PRICE >= propertyPrice()[0]
              : true;
          const priceMaxMatch =
            propertyPrice()[1] > 0
              ? validPrice && property.PRICE <= propertyPrice()[1]
              : true;

          return (
            typeMatch &&
            bedsMatch &&
            bathsMatch &&
            sqftMinMatch &&
            sqftMaxMatch &&
            priceMinMatch &&
            priceMaxMatch
          );
        });

        // console.log(`Zip ${zip} matches: ${matches}`);
        return matches;
      });

      if (zipCodes.length === 0) {
        // console.log("No properties match the filter criteria.");
      }
    }

    // console.log("Zipcodes after type/attribute filtering:", zipCodes);

    const hasAmenityFilters = selectedAmenities().size > 0;

    if (hasAmenityFilters) {
      zipCodes = zipCodes.filter((zip) => {
        const amenities = Array.isArray(filteredAmenities()[zip])
          ? filteredAmenities()[zip]
          : [];
        const matches = [...selectedAmenities()].every((amenity) =>
          amenities.some((a) => a.FACILITY_DOMAIN_NAME === amenity)
        );
        // console.log(`Zip ${zip} amenities match: ${matches}`);
        return matches;
      });
    }

    // console.log("Final filtered zipcodes:", zipCodes);

    setFilteredZipCodesLocal(zipCodes);
    setFilteredZipCodes(zipCodes);
    // console.log("Updated filtered zipcodes in state:", zipCodes);
  };

  const handleFilterChange = debounce(() => {
    const filters = {
      beds: beds() > 0 ? beds() : null,
      baths: baths() > 0 ? baths() : null,
      type: houseType() ? houseType() : null,
      minprice: propertyPrice()[0] > 0 ? propertyPrice()[0] : null,
      maxprice: propertyPrice()[1] > 0 ? propertyPrice()[1] : null,
      minsqft: propertySqft()[0] > 0 ? propertySqft()[0] : null,
      maxsqft: propertySqft()[1] > 0 ? propertySqft()[1] : null,
    };

    Object.keys(filters).forEach(
      (key) => filters[key] === null && delete filters[key]
    );

    fetchRealEstateData(filters);
  }, 300);

  createEffect(() => {
    handleFilterChange();
  });

  onMount(() => {
    fetchBoroughData();
    fetchRealEstateData({});
  });

  const categorizedAmenities = () => {
    const categories = {};
    filteredZipCodesLocal().forEach((zipCode) => {
      const amenities = Array.isArray(filteredAmenities()[zipCode])
        ? filteredAmenities()[zipCode]
        : [];
      amenities.forEach((amenity) => {
        if (!categories[amenity.FACILITY_T]) {
          categories[amenity.FACILITY_T] = new Set();
        }
        categories[amenity.FACILITY_T].add(amenity.FACILITY_DOMAIN_NAME);
      });
    });
    const result = {};
    for (const [key, value] of Object.entries(categories)) {
      result[key] = Array.from(value);
    }
    return result;
  };

  const clearAllFilters = () => {
    setSelectedBoroughs(new Set());
    setSelectedNeighborhoods(new Set());
    setSelectedAmenities(new Set());
    setFilteredZipCodes([]);
    setFilteredZipCodesLocal([]);
    setShowAdvancedFilters(false);
    setFilteredAmenities({});
    setHouseType("");
    setBeds(0);
    setBaths(0);
    setPropertySqft([0, 0]);
    setPropertyPrice([0, 0]);
  };

  const highlightZipCodesOnMap = (zipCodes) => {
    setFilteredZipCodes(zipCodes);
    setShowFilterBoard(false);
    setSideBarOpen(false);
    //  console.log("Highlighting zip codes on map:", zipCodes);
  };
  // -translate-x-1/2
  return (
    <div
      class={`absolute z-40 h-full bg-white 
         items-center transform left-[45vw] w-[55vw] border-black overflow-y-auto
      gap-0.5 justify-center text-black transition-transform duration-500 scale-100 ${
        showFilterBoard() ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div
        class="grid-cols-1 divide-y m-0 px-0 
          mt-[-2vh] w-full max-h-[100vh] shadow-lg z-20 
          items-center bg-white rounded-lg 
           relative"
      >
        {/* FILTER TITLE */}
        <div
          id="filter-dropdown-title"
          class="items-center justify-center 
          relative flex h-[10%]  
           text-white w-[100%] z-30 flex-row bg-teal-500"
          style="position: sticky; top: 0; height: 60px;"
        >
          <button
            class="absolute rounded-full w-[24px] h-[24px]
            left-[2%] text-black items-center flex hover:bg-white justify-center cursor-pointer"
            onClick={() => {
              setShowFilterBoard(false);
              setSideBarOpen(false);
            }}
          >
            <svg
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <p class="text-xl">Filters </p>
        </div>
        {/* FILTER CONTENT */}
        <div
          class="w-[100%] flex flex-col h-auto relative items-center py-6 px-[12%] gap-y-4 bg-white"
          id="filter-details-container"
        >
          {/* Borough Selection */}
          <div
            id="borough-selection-container"
            class="w-full p-4 rounded-lg transition-all duration-500"
          >
            <label
              htmlFor="borough-selection"
              class="font-sans text-2xl font-bold text-teal-500"
            >
              Borough:
            </label>
            <div class="flex flex-wrap gap-2 mt-2">
              {unique_borough.map((el) => (
                <div key={el} class="flex items-center">
                  <input
                    name="borough-selection"
                    value={el.toString()}
                    type="checkbox"
                    onChange={() => handleBoroughChange(el)}
                    checked={selectedBoroughs().has(el)}
                  />
                  <label
                    htmlFor="borough-selection"
                    class="ml-2 text-lg text-gray-700"
                  >
                    {el.toString()}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Neighborhood Selection */}
          {[...selectedBoroughs()].length > 0 && (
            <div
              class="w-full p-4 rounded-lg transition-all duration-500 ease-in-out transform opacity-100 scale-100"
              id="neighborhood-container"
            >
              <label
                htmlFor="neighborhood-selection"
                class="font-sans text-2xl font-bold text-teal-500"
              >
                Neighborhood:
              </label>
              <div class="w-full h-64 overflow-y-auto border border-gray-300 rounded-md mt-2">
                {getNeighborhoods([...selectedBoroughs()]).map((el) => (
                  <div
                    key={el}
                    class={`p-2 cursor-pointer ${
                      selectedNeighborhoods().has(el)
                        ? "bg-teal-500 text-white"
                        : "bg-white text-gray-700"
                    }`}
                    onClick={() => handleNeighborhoodChange(el)}
                  >
                    {el}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Filters Button */}
          {selectedNeighborhoods().size > 0 && (
            <button
              class="mt-4 p-3 bg-teal-500 text-white rounded transition-all duration-500 ease-in-out transform text-lg"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters())}
            >
              {showAdvancedFilters()
                ? "Hide Advanced Filters"
                : "Show Advanced Filters"}
            </button>
          )}

          {/* Advanced Filters */}
          {showAdvancedFilters() && (
            <div
              class="w-full p-4 rounded-lg mt-4 flex flex-col transition-all duration-500 ease-in-out transform opacity-100 scale-100"
              id="advanced-filters-container"
            >
              <div
                class="flex flex-col items-center justify-center p-4 rounded-lg"
                id="house-type-container"
              >
                <p class="font-sans text-2xl font-bold text-teal-500">
                  House Type
                </p>
                <div class="flex flex-wrap gap-2 mt-2">
                  {houseTypeOptions.map((type) => (
                    <div key={type} class="flex items-center">
                      <input
                        type="radio"
                        name="houseType"
                        value={type}
                        onChange={() => handleHouseTypeChange(type)}
                        checked={houseType() === type}
                      />
                      <label htmlFor={type} class="ml-2 text-lg text-gray-700">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div
                class="flex flex-col items-center justify-center p-4 rounded-lg"
                id="beds-container"
              >
                <p class="font-sans text-2xl font-bold text-teal-500">Beds</p>
                <input
                  type="number"
                  class="border border-gray-300 rounded p-2 text-lg w-full mt-2"
                  value={beds()}
                  onInput={(e) => setBeds(Number(e.target.value))}
                  onChange={handleFilterChange}
                />
              </div>

              <div
                class="flex flex-col items-center justify-center p-4 rounded-lg"
                id="baths-container"
              >
                <p class="font-sans text-2xl font-bold text-teal-500">Baths</p>
                <input
                  type="number"
                  class="border border-gray-300 rounded p-2 text-lg w-full mt-2"
                  value={baths()}
                  onInput={(e) => setBaths(Number(e.target.value))}
                  onChange={handleFilterChange}
                />
              </div>

              <div
                class="flex flex-col items-center justify-center p-4 rounded-lg"
                id="property-sqft-container"
              >
                <p class="font-sans text-2xl font-bold text-teal-500">
                  Property Sqft
                </p>
                <div class="flex gap-2 w-full mt-2">
                  <div class="flex flex-col w-full rounded-lg p-2">
                    <p class="text-lg text-gray-700">Minimum</p>
                    <input
                      type="number"
                      class="border border-gray-300 rounded p-2 text-lg w-full mt-1"
                      value={propertySqft()[0]}
                      onInput={(e) =>
                        setPropertySqft([
                          Number(e.target.value),
                          propertySqft()[1],
                        ])
                      }
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div class="flex flex-col w-full rounded-lg p-2">
                    <p class="text-lg text-gray-700">Maximum</p>
                    <input
                      type="number"
                      class="border border-gray-300 rounded p-2 text-lg w-full mt-1"
                      value={propertySqft()[1]}
                      onInput={(e) =>
                        setPropertySqft([
                          propertySqft()[0],
                          Number(e.target.value),
                        ])
                      }
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
              </div>

              <div
                class="flex flex-col items-center justify-center p-4 rounded-lg"
                id="property-price-container"
              >
                <p class="font-sans text-2xl font-bold text-teal-500">
                  Property Price
                </p>
                <div class="flex gap-2 w-full mt-2">
                  <div class="flex flex-col w-full rounded-lg p-2">
                    <p class="text-lg text-gray-700">Minimum</p>
                    <input
                      type="number"
                      class="border border-gray-300 rounded p-2 text-lg w-full mt-1"
                      value={propertyPrice()[0]}
                      onInput={(e) =>
                        setPropertyPrice([
                          Number(e.target.value),
                          propertyPrice()[1],
                        ])
                      }
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div class="flex flex-col w-full rounded-lg p-2">
                    <p class="text-lg text-gray-700">Maximum</p>
                    <input
                      type="number"
                      class="border border-gray-300 rounded p-2 text-lg w-full mt-1"
                      value={propertyPrice()[1]}
                      onInput={(e) =>
                        setPropertyPrice([
                          propertyPrice()[0],
                          Number(e.target.value),
                        ])
                      }
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
              </div>

              <div
                id="amenities-container"
                class="flex flex-col items-center justify-center p-4 rounded-lg"
              >
                <p class="font-sans text-2xl font-bold text-teal-500 mb-2">
                  Amenities
                </p>
                {Object.entries(categorizedAmenities()).map(
                  ([category, amenities]) => (
                    <div
                      key={category}
                      class="flex flex-col items-start w-full mb-2"
                    >
                      <p
                        class="font-sans text-xl font-semibold text-gray-700 cursor-pointer mb-1 p-2 bg-gray-100 rounded-md w-full"
                        onClick={() => handleCategoryToggle(category)}
                      >
                        {category}{" "}
                        {expandedCategories().has(category) ? "-" : "+"}
                      </p>
                      {expandedCategories().has(category) && (
                        <div class="grid grid-cols-2 w-full gap-2 p-2 bg-gray-50 rounded-md">
                          {amenities.map((amenity) => (
                            <div key={amenity} class="flex items-center mb-2">
                              <input
                                type="checkbox"
                                class="border border-gray-300 rounded p-2"
                                value={amenity}
                                onChange={() => handleAmenityChange(amenity)}
                                checked={selectedAmenities().has(amenity)}
                              />
                              <label
                                htmlFor={amenity}
                                class="ml-2 text-gray-700"
                              >
                                {amenity}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clear Button and Filter Results */}
        <div
          id="button-container"
          class="items-center justify-center 
          flex gap-4 bg-teal-500 text-white w-[100%] z-30  p-4 pointer-events-auto"
          style="position: sticky; bottom: 0; height: 56px;"
        >
          <button
            class="rounded-2xl z-20 cursor-pointer w-32 h-9 flex items-center 
            justify-center gap-1.5 hover:scale-110 duration-300 active:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-300"
            onClick={() => clearAllFilters()}
          >
            Clear all
          </button>

          {filteredZipCodesLocal().length === 0 ? (
            <span class="text-red-500">Change filters</span>
          ) : (
            <div class="flex items-center gap-2">
              <span>
                Filters result in {filteredZipCodesLocal().length} zipcodes
              </span>
              <button
                class="rounded-2xl z-20 cursor-pointer w-32 h-9 flex items-center justify-center gap-1.5 hover:scale-110 duration-300 active:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-300"
                onClick={() => {
                  highlightZipCodesOnMap(filteredZipCodesLocal());
                  map().setZoom(11);
                }}
              >
                See on Map
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filter;
