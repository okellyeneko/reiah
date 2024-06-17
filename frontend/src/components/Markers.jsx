import { onMount, createEffect, createSignal } from "solid-js";
import { layerStore, isGoogleMapInitialized } from "./layerStore";
import * as mc from "@googlemaps/markerclusterer";
const { MarkerClusterer, GridAlgorithm } = mc;
import Chart from "chart.js/auto";
// import Plotly from "plotly.js-dist-min";

const markers = [];

function Markers() {
  // const [AdvancedMarker, setAdvancedMarker] = createSignal(null);
  // const [infoWindow, setInfoWindow] = createSignal(null);
  createEffect(async () => {
    let Plotly = null;
    Plotly = await import("plotly.js-dist-min");
    if (isGoogleMapInitialized()) {
      const map = layerStore.map;

      if (map) {
        console.log("Google Maps instance is available", layerStore.google_map);
        // const { AdvancedMarkerElement, PinElement } =
        //   await google.maps.importLibrary("marker");
        const infoWindow = new google.maps.InfoWindow({
          content: "",
          ariaLabel: "Uluru",
        });

        fetch("/assets/real_estate_price_data.json")
          .then((response) => response.json())
          .then(async (data) => {
            const icon = {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 20,
              fillColor: "#81c7a5",
              fillOpacity: 1,
              strokeWeight: 0.4,
            };
            const historic_real_estate_data_promise = await fetch(
              "/assets/historic_real_estate_prices.json"
            );
            const historic_real_estate_data =
              await historic_real_estate_data_promise.json();
            // const dataFilter = data.filter(
            //   (data) => data["business_type"] === "Home Services"
            // );
            // const unique_zipCode = [
            //   ...new Set(data.map((item) => item["zip_code"])),
            // ];
            // console.log(data[0]["longitude"] * 1);
            // const infoWindow = document.getElementById("dashboard");
            // infoWindow.innerText = data;
            // const dataFilter = data.filter((el) => {
            //   return el["business_type"] == unique_businessType[0];
            // });
            const markers = data.map((el) => {
              // const pin = new PinElement({
              //   glyph: el["avg_home_value"].toString(),
              // });

              const marker = new google.maps.Marker({
                map,
                position: {
                  lat: el["lat"] * 1,
                  lng: el["lng"] * 1,
                },
                label: {
                  text: `${el["avg_home_value"] / 1000}k`,
                  color: "white",
                },
                price: el["avg_home_value"],
                animation: google.maps.Animation.DROP,
                // gmpClickable: true,
                title: el["zipcode"].toString(),
                clickable: true,
                icon,
              });
              marker.addListener("click", async ({ domEvent, latLng }) => {
                const { target } = domEvent;

                // infoWindow.close();
                // infoWindow.setContent(marker.title);
                // infoWindow.open(marker.map, marker);
                const infoWindow = document.getElementById("dashboard");

                infoWindow.innerText = `ZIPCODE: ${marker.title}`;
                infoWindow.innerHTML += '<canvas id="chart_js"></canvas>';
                infoWindow.innerHTML +=
                  '<div id="plotly_js" class="w-[80%]"></div>';
                const dataFilter = historic_real_estate_data.filter(
                  ({ zipcode }) => String(zipcode) === marker.title
                );

                //chart js

                new Chart(document.getElementById("chart_js"), {
                  type: "bar",
                  data: {
                    labels: Object.keys(dataFilter[0]),
                    datasets: [
                      {
                        label: marker.title,
                        data: Object.values(dataFilter[0]),
                      },
                    ],
                  },
                });

                //plotly

                const selectorOptions = {
                  buttons: [
                    {
                      step: "month",
                      stepmode: "backward",
                      count: 1,
                      label: "1m",
                    },
                    {
                      step: "month",
                      stepmode: "backward",
                      count: 6,
                      label: "6m",
                    },
                    {
                      step: "year",
                      stepmode: "todate",
                      count: 1,
                      label: "YTD",
                    },
                    {
                      step: "year",
                      stepmode: "backward",
                      count: 1,
                      label: "1y",
                    },
                    {
                      step: "all",
                    },
                  ],
                };
                const preped_data = [
                  {
                    mode: "lines",
                    x: Object.keys(dataFilter[0]),
                    y: Object.values(dataFilter[0]),
                  },
                ];
                const layout = {
                  title: "Time series with range slider and selectors",
                  xaxis: {
                    rangeselector: selectorOptions,
                    rangeslider: {},
                  },
                  yaxis: {
                    fixedrange: true,
                  },
                };

                if (Plotly) {
                  Plotly.newPlot("plotly_js", preped_data, layout);
                }
              });
              return marker;
            });

            let totalAvgPrice = 0;
            markers.map((marker) => {
              totalAvgPrice += marker.price;
            });
            totalAvgPrice /= markers.length * 1000;

            console.log("total avg price: ", totalAvgPrice);

            const clusterRenderer = {
              render: (cluster, stats) => {
                // Access to the cluster's attributes, check all available in the doc
                const { markers, position, count } = cluster;
                // Access to the stats' attributes if you need it

                let avgPrice = 0;
                markers.map((marker) => {
                  avgPrice += marker.price * 1;
                });
                avgPrice /= count * 1000;
                const color = avgPrice > totalAvgPrice ? "#0145ac" : "#81c7a5";

                const svg = window.btoa(`
            <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
            <circle cx="120" cy="120" opacity=".6" r="70" />
            <circle cx="120" cy="120" opacity=".3" r="90" />
            <circle cx="120" cy="120" opacity=".2" r="110" />
            <circle cx="120" cy="120" opacity=".1" r="130" />
            </svg>`);
                return new google.maps.Marker({
                  icon: {
                    url: `data:image/svg+xml;base64,${svg}`,
                    scaledSize: new google.maps.Size(45, 45),
                  },

                  label: {
                    text: `$${Math.ceil(avgPrice)}k`,
                    color: "white",
                  },
                  position: position,
                  map,
                  zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
                });
              },
            };
            const mapCluster = new MarkerClusterer({
              markers,
              map,
              renderer: clusterRenderer,
              onClusterClick: async (event, cluster, map) => {
                const infoWindow = document.getElementById("dashboard");
                infoWindow.innerText = `Cluster center: ${cluster.position}, 
                Number of markers: ${cluster.markers.length}`;
                infoWindow.innerHTML += '<ul id="infoContent"> </ul>';
                const infoContent = document.getElementById("infoContent");
                cluster.markers.forEach((marker) => {
                  infoContent.innerHTML += `<li>ZIPCODE : ${marker.title}</li>`;
                });
              },
            });
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        // Add some markers to the map.

        // Add a marker clusterer to manage the markers.
      } else {
        console.log("Google Maps instance is not available yet");
      }
    }
  });

  return null;
}

export default Markers;
