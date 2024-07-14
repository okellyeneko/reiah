import { onMount, createEffect, createSignal, untrack } from "solid-js";
import { setStore, store } from "../data/stores";
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
// import { borough_neighbourhood } from "../data/dataToBeSent";

//marker size range
// const initialSize = 50;
// const finalSize = 100;
// const sizeDifference = finalSize - initialSize;

const [zipcode_markers, setZipcodeMarkers] = createSignal([]);
// const [borough_markers, setBoroughMarkers] = createSignal([]);
// const [neighbourhood_markers, setNeighbourhoodMarkers] = createSignal([]);

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly",
});

const createZipcodeMarkers = (
  zipcodes,
  Marker,
  zipcodes_latlng,
  realEstateData
) => {
  const level = "zipcode";

  zipcodes.forEach((el) => {
    const positionObj = zipcodes_latlng.filter(
      (obj) => obj["zip_code"] * 1 == el
    );
    const realEstateDataObj = realEstateData.filter(
      (obj) => obj.zipcode * 1 === el
    );

    try {
      const position = {
        lat: positionObj[0]["latitude"] * 1,
        lng: positionObj[0]["longitude"] * 1,
      };

      const { avg_home_value, median_age, median_household_income } =
        realEstateDataObj[0];

      const color = "#ffffff";
      const svg = window.btoa(`
  <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
 
  <circle cx="150" cy="120" opacity="1" r="350" />
  </svg>`);

      const marker = new Marker({
        position,
        title: `ZIPCODE: ${el.toString()}`,
        level,
        avg_home_value,
        median_age,
        median_household_income,
        label: {
          text: `\$${(avg_home_value / 1000).toFixed(1)}k`,
          color: "black",
        },
        icon: {
          url: `data:image/svg+xml;base64,${svg}`,
          scaledSize: new google.maps.Size(45, 45),
        },
      });
      setZipcodeMarkers((prev) => [...prev, marker]);
    } catch (error) {
      console.log(
        `${el} is problematic, it does not have latitude and longitude in zipcodes or data in realEstateData : ${error}`
      );
    }
  });
};

function putMarkersOnMap(markersArray, map) {
  markersArray.forEach((marker) => {
    marker.setMap(map);
  });
}

function clearMarkers(markersArray) {
  markersArray.forEach((marker) => {
    marker.setMap(null);
  });
}

const Markers = async (props) => {
  onMount(async () => {
    const zipcodes_latlng = props.zipcodes;
    const borough_neighbourhood = props.borough_neighbourhood;
    const realEstateData = props.realEstateData;
    //extract all zipcodes from borough_neighbourhood
    let zipcodes = [];
    let borough_zipcode = {};
    let neighbourhood_zipcode = {};
    borough_neighbourhood.forEach((el) => {
      zipcodes = [...zipcodes, ...el["zipcodes"]];
      borough_zipcode[el["borough"]] = el["zipcodes"];
      neighbourhood_zipcode[el["neighbourhood"]] = el["zipcodes"];
    });

    loader.importLibrary("marker").then(({ Marker }) => {
      createZipcodeMarkers(zipcodes, Marker, zipcodes_latlng, realEstateData);
      putMarkersOnMap(zipcode_markers(), props.map());
      const clusterRenderer = {
        render: (cluster, stats) => {
          // Access to the cluster's attributes, check all available in the doc
          const { markers, position, count } = cluster;
          // Access to the stats' attributes if you need it
          //// <circle cx="120" cy="120" opacity=".6" r="70" />
          // const color = "#0145ac";
          const color = "#ffffff";
          const svg = window.btoa(`
    <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
   
    <circle cx="150" cy="120" opacity="1" r="350" />
    </svg>`);
          let avgHomeValue = 0;
          let title = "";
          markers.forEach((marker) => {
            avgHomeValue += marker["avg_home_value"];
            title += `${marker.title} `;
          });
          avgHomeValue /= markers.length;

          return new google.maps.Marker({
            icon: {
              url: `data:image/svg+xml;base64,${svg}`,
              scaledSize: new google.maps.Size(80, 20),
            },
            title,

            label: {
              text: `\$${(avgHomeValue / 1000).toFixed(1)}k`,
              color: "black",
            },
            position: position,
            map,
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
          });
        },
      };
      const map = props.map();
      const markers = zipcode_markers();
      const markerCluster = new MarkerClusterer({
        markers,
        map,
        renderer: clusterRenderer,
        onClusterClick: async (event, cluster, map) => {},
      });
      // loader.importLibrary("core").then(({ LatLng, LatLngBounds }) => {

      //   // createBoroughMarkers(
      //   //   borough_zipcode,
      //   //   zipcodes_latlng,
      //   //   LatLng,
      //   //   LatLngBounds,
      //   //   realEstateData,
      //   //   Marker
      //   // );
      //   // createNeighbourhoodMarkers(
      //   //   neighbourhood_zipcode,
      //   //   zipcodes_latlng,
      //   //   LatLng,
      //   //   LatLngBounds,
      //   //   realEstateData,
      //   //   Marker
      //   // );

      // });
    });
  });

  const switchMarkers = (props, map) => {
    if (props.getDataLayerLevel() === "borough") {
      //borough level markers
      //if it has neighbourhood markers, clear the data layer
      clearMarkers(neighbourhood_markers(), map);
      clearMarkers(zipcode_markers(), map);
      putMarkersOnMap(borough_markers(), map);
    } else if (props.getDataLayerLevel() === "neighbourhood") {
      //datalayer changed to neighbourhood level
      clearMarkers(borough_markers(), map);
      clearMarkers(zipcode_markers(), map);
      putMarkersOnMap(neighbourhood_markers(), map);
    } else if (props.getDataLayerLevel() === "zipcode") {
      // zipcode level markers
      clearMarkers(borough_markers(), map);
      clearMarkers(neighbourhood_markers(), map);
      putMarkersOnMap(zipcode_markers(), map);
    }
  };

  // createEffect(() => {
  //   switchMarkers(props.props.map());
  // });
};

// function createNeighbourhoodMarkers(
//   neighbourhood_zipcode,
//   zipcodes_latlng,
//   LatLng,
//   LatLngBounds,
//   realEstateData,
//   Marker
// ) {
//   for (let [neighbourhood, zipcodeArray] of Object.entries(
//     neighbourhood_zipcode
//   )) {
//     const latlngArray = [];
//     const realEstateDataObj = {
//       avg_home_value: 0,
//       median_age: 0,
//       median_household_income: 0,
//     };
//     let count = 0;

//     zipcodeArray.forEach((zipcode) => {
//       try {
//         const { latitude, longitude } = zipcodes_latlng.filter(
//           (obj) => obj["zip_code"] * 1 == zipcode
//         )[0];
//         const { avg_home_value, median_age, median_household_income } =
//           realEstateData.filter((obj) => obj.zipcode === zipcode)[0];
//         latlngArray.push({ lat: latitude * 1, lng: longitude * 1 });
//         realEstateDataObj["avg_home_value"] += avg_home_value;
//         realEstateDataObj["median_age"] += median_age;
//         realEstateDataObj["median_household_income"] += median_household_income;
//         count += 1;
//       } catch (error) {
//         console.log(`${zipcode}: ${error}`);
//       }
//     });

//     //average the values inside
//     for (let key of Object.keys(realEstateDataObj)) {
//       realEstateDataObj[key] /= count;
//     }
//     const { avg_home_value, median_age, median_household_income } =
//       realEstateDataObj;

//     //center position:
//     const bounds = new LatLngBounds();

//     latlngArray.forEach((obj) => {
//       bounds.extend(new LatLng(obj["lat"], obj["lng"]));
//     });
//     // centerPositionArray.push(bounds.getCenter());
//     const svg = window.btoa(`
//       <svg fill="white xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
//       <circle cx="120" cy="120" opacity=".0" r="70" />
//       <circle cx="120" cy="120" opacity=".0" r="90" />
//       <circle cx="120" cy="120" opacity=".0" r="120" />
//       </svg>`);
//     const position = bounds.getCenter();
//     const marker = new Marker({
//       position,
//       title: neighbourhood,
//       level: "neighbourhood",
//       avg_home_value,
//       median_age,
//       median_household_income,
//       label: {
//         text: `\$ ${(avg_home_value / 1000).toFixed(1)}k`,
//         color: "black",
//         fontSize: "16px",
//       },
//       icon: {
//         url: `data:image/svg+xml;base64,${svg}`,
//         scaledSize: new google.maps.Size(2, 2),
//       },
//     });
//     setNeighbourhoodMarkers((prev) => [...prev, marker]);
//   }
// }

// function createBoroughMarkers(
//   borough_zipcode,
//   zipcodes_latlng,
//   LatLng,
//   LatLngBounds,
//   realEstateData,
//   Marker
// ) {
//   for (let [borough, zipcodeArray] of Object.entries(borough_zipcode)) {
//     const latlngArray = [];
//     const realEstateDataObj = {
//       avg_home_value: 0,
//       median_age: 0,
//       median_household_income: 0,
//     };
//     let count = 0;

//     zipcodeArray.forEach((zipcode) => {
//       try {
//         const { latitude, longitude } = zipcodes_latlng.filter(
//           (obj) => obj["zip_code"] * 1 == zipcode
//         )[0];
//         const { avg_home_value, median_age, median_household_income } =
//           realEstateData.filter((obj) => obj.zipcode === zipcode)[0];
//         latlngArray.push({ lat: latitude * 1, lng: longitude * 1 });
//         realEstateDataObj["avg_home_value"] += avg_home_value;
//         realEstateDataObj["median_age"] += median_age;
//         realEstateDataObj["median_household_income"] += median_household_income;
//         count += 1;
//       } catch (error) {
//         console.log(`${zipcode}: ${error}`);
//       }
//     });

//     //average the values inside
//     for (let key of Object.keys(realEstateDataObj)) {
//       realEstateDataObj[key] /= count;
//     }
//     const { avg_home_value, median_age, median_household_income } =
//       realEstateDataObj;

//     //center position:
//     const bounds = new LatLngBounds();

//     latlngArray.forEach((obj) => {
//       bounds.extend(new LatLng(obj["lat"], obj["lng"]));
//     });
//     // centerPositionArray.push(bounds.getCenter());
//     const svg = window.btoa(`
//       <svg fill="white xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
//       <circle cx="120" cy="120" opacity=".0" r="70" />
//       </svg>`);
//     const position = bounds.getCenter();
//     const marker = new Marker({
//       position,
//       title: borough,
//       level: "borough",
//       avg_home_value,
//       median_age,
//       median_household_income,
//       label: {
//         text: `\$ ${(avg_home_value / 1000).toFixed(1)}k`,
//         color: "black",
//         fontSize: "20px",
//       },
//       icon: {
//         url: `data:image/svg+xml;base64,${svg}`,
//         scaledSize: new google.maps.Size(45, 45),
//       },
//     });
//     setBoroughMarkers((prev) => [...prev, marker]);
//   }
// }

export default Markers;
