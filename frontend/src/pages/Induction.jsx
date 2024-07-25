import { InductionView } from "../layouts/Layout";
import mappage from "../assets/induction/default.png";
import hoverleft from "../assets/induction/hoverleft.png";
import nav_hoverMouseLeft from "../assets/induction/nav_hoverMouseLeft.png";
import zipcode_layer from "../assets/induction/zipcode_layer.png";
import search_bar from "../assets/induction/searchbar.png";
import search_bar_effect from "../assets/induction/searchbar_effect.png";
import search_bar_alert from "../assets/induction/searchbar_alert.png";
import filter from "../assets/induction/filter.png";
import recommend from "../assets/induction/recommend.png";
import recommend_effect from "../assets/induction/recommend_effect.png";
import dashboard from "../assets/induction/dashboard.png";
import marker_legend from "../assets/induction/marker_legend.png";
import marker_legend_effect from "../assets/induction/hide_markers.png";
import info_types from "../assets/induction/three_types_info.png";
import compare from "../assets/induction/dropdown.png";
import compare_effect1 from "../assets/induction/dropdown_effect.png";
import compare_effect2 from "../assets/induction/dropdown_effect2.png";
import property_marker from "../assets/induction/property_marker.png";
import account from "../assets/induction/account.png";

const MapPageSection = ({ title, description, id, children }) => {
  return (
    <div
      className="w-full flex flex-col items-center justify-center gap-3 text-justify"
      id={id}
    >
      <h2 className="text-xl">{title}</h2>
      {description}
      {children}
    </div>
  );
};

const MiniSection = ({ img_src, description }) => {
  return (
    <div
      class="flex flex-row gap-2 bg-white 
    rounded-md shadow-md border-solid border-grey-300 w-[60%] hover:scale-150 duration-300 hover:z-10"
    >
      <img src={img_src} className="w-[60%] h-auto" />
      <p class="mt-6 text-justify px-2">{description}</p>
    </div>
  );
};

const InductionPage = () => {
  return (
    <InductionView>
      <div
        className="mt-[2%] grid grid-row-1 divide-y justify-center 
      w-4/5 min-h-screen text-center py-3"
      >
        <h1 class="text-2xl">User Induction</h1>
        <div class="text-xl">
          Welcome to Reiah! Thanks for coming here. We hope you can learn how to
          use our application here.
        </div>
        {/* a tags */}
        {/* <div
          class="relative grid grid-cols-2 gap-10 mt-[2%]
        mx-auto mb-[2vh] text-xl text-center
             items-center justify-center"
        >
          <a href="#induction_step1">step 1</a>
          <a href="#induction_step2">step 2</a>
        </div> */}
        <div
          id="induction_step1"
          className="flex flex-col items-center w-full py-3"
        >
          {/* a tags */}
          <div
            class="relative grid grid-cols-7 mx-auto divide-x mb-[2vh]
             items-center justify-center"
          >
            <a href="#nav_bar">Navigation Bar</a>

            <a href="#zipcode_layer">Zip code Layer</a>
            <a href="#search_bar">Search Bar</a>
            <a href="#filter">Filter</a>
            <a href="#recommend">Recommend</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#account">Account Button</a>
          </div>

          <div className="flex flex-col gap-4 items-center w-full">
            {/* nav bar */}
            <MapPageSection
              title={"Navigation Bar"}
              id="nav_bar"
              description={
                "When you want to go to other pages like Settings Page, use the navigation bar."
              }
            >
              <MiniSection
                img_src={mappage}
                description={
                  "By default, the Navigation Bar is hidden on the Map Page."
                }
              ></MiniSection>
              <MiniSection
                img_src={hoverleft}
                description={
                  "When your mouse hovers on a zip code layer, the layer will turn purple. At the same time, the zip code number will show up on the search bar."
                }
              ></MiniSection>
            </MapPageSection>

            {/* zipcode layer */}
            <MapPageSection
              title={"Zip Code Layer"}
              id="zipcode_layer"
              description={
                "Each green layer on the map represents a single zip code in New York City."
              }
            >
              <MiniSection
                img_src={zipcode_layer}
                description={
                  "When your mouse hovers on a zip code layer, the layer will turn purple. At the same time, the zip code number will show up on the search bar."
                }
              ></MiniSection>
              {/* <MiniSection
                img_src={zipcode_layer_zoom}
                description={
                  "You can also zoom out the map to check the zip code number. When you zoom out to a certain point, the zip code number will show up on each layer."
                }
              ></MiniSection> */}
            </MapPageSection>

            {/* search bar */}
            <MapPageSection
              title={"Search Bar"}
              id="search_bar"
              description={
                "The search bar is on the top of the map. It helps you check the information of a zip code faster if you already knows which zip code you are interested in."
              }
            >
              <MiniSection
                img_src={search_bar}
                description={
                  "If you want to use the search bar, just type in the zip code number."
                }
              ></MiniSection>
              <MiniSection
                img_src={search_bar_effect}
                description={
                  "By hitting the 'Enter' Key on your keyboard, you can check the information in the dashboard."
                }
              ></MiniSection>
              <MiniSection
                img_src={search_bar_alert}
                description={
                  "If you happen to type in an invalid zip code, like a zip code out of New York or something that is not zip code, an alert window will pop up. You can type in the zip code you want again after closing the alert window."
                }
              ></MiniSection>
            </MapPageSection>

            {/* filter */}
            <MapPageSection
              title={"Filter"}
              id="filter"
              description={
                "Filter can help you locate to the zipcodes based on the location and other relevant information like house details and amenities"
              }
            >
              <MiniSection
                img_src={filter}
                description={
                  "After clicking the filter button, there will be some questions for you to help select the zip codes you want on the right. When you completing each of them, the map will display highlighted layers that fit the conditions."
                }
              ></MiniSection>
            </MapPageSection>

            {/* recommend */}
            <MapPageSection
              title={"Recommend"}
              id="recommend"
              description={
                "Compared to filter, the recommendation aims to select the zip codes that fits your personal preferences."
              }
            >
              <MiniSection
                img_src={recommend}
                description={
                  "The process for recommendation is similar to filter. You need to answer the questions shown on the right."
                }
              ></MiniSection>
              <MiniSection
                img_src={recommend_effect}
                description={
                  "After clicking Submit button on the bottom of the recommendation board, you can see golden highlighted zip codes on the map. Those are the zip codes we recommend based on your personal preferences"
                }
              ></MiniSection>
            </MapPageSection>

            {/* dashboard */}
            <MapPageSection
              title={"Dashboard"}
              id="dashboard"
              description={
                "The dashboard contains the information of one or multiple zip codes."
              }
            >
              <MiniSection
                img_src={dashboard}
                description={
                  "Either by using search bar or by clicking on a zip code layer, the dashboard will pop out from the right."
                }
              ></MiniSection>

              <MiniSection
                img_src={marker_legend}
                description={
                  "By default there are 2 types of markers on the map. The white ones represent each of the property sold in 2023. The blue ones are amenities. "
                }
              ></MiniSection>
              <MiniSection
                img_src={marker_legend_effect}
                description={
                  "To display or hide the markers, you can click on the buttons inside the marker legend on the top right of the dashboard. If the button goes grey, it means the type of markers are hidden on the map now."
                }
              ></MiniSection>
              <MiniSection
                img_src={property_marker}
                description={
                  "For the property markers, you can click one of them to check the details of that property."
                }
              ></MiniSection>

              <MiniSection
                img_src={info_types}
                description={
                  "You can check three types of information in total: Real Estate Information, Amenities Information and Other Information."
                }
              ></MiniSection>

              <MiniSection
                img_src={compare}
                description={
                  "You can also compare to other zip codes' information in the dashboard. Use the dropdown, select the zip codes you want to compare with the current one, click on the submit."
                }
              ></MiniSection>

              <MiniSection
                img_src={compare_effect1}
                description={
                  "After you click the Submit button, the line chart will update to show multiple zip codes' historical property value."
                }
              ></MiniSection>

              <MiniSection
                img_src={compare_effect2}
                description={
                  "At the same time, you can also check other zipcodes' 2023 sales records. By selecting one of the buttons on top of the doughnut chart, the doughnut chart will update to reflect the selected zip code's sales records."
                }
              ></MiniSection>
            </MapPageSection>

            {/* account */}
            <MapPageSection
              title={"Account Button"}
              id="account"
              description={
                "The account button on the top right will help you log out from the application."
              }
            >
              <MiniSection
                img_src={account}
                description={
                  "Click on the account button, log out, you will be redirected to the login page."
                }
              ></MiniSection>
            </MapPageSection>
          </div>
        </div>
      </div>
    </InductionView>
  );
};

export { InductionPage };
